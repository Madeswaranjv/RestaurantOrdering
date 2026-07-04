import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import UserRepository from '../repositories/UserRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../services/emailService.js';
import { getPasswordResetTemplate } from '../utils/emailTemplates.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const googleClient = new OAuth2Client();

const getJwtSecret = (name) => {
  const value = process.env[name];
  if (value) return value;
  throw new Error(`${name} must be configured`);
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    getJwtSecret('JWT_SECRET'),
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    getJwtSecret('JWT_REFRESH_SECRET'),
    { expiresIn: '7d' }
  );
};

const sanitizeUser = (user) => {
  const safeUser = user?.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  delete safeUser.refreshTokens;
  return safeUser;
};

const persistRefreshToken = async (user, refreshToken) => {
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save();
};

const buildAuthPayload = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await persistRefreshToken(user, refreshToken);

  return {
    user: sanitizeUser(user),
    token: accessToken,
    accessToken,
    refreshToken
  };
};

const getGoogleClientId = () => process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

const verifyGoogleCredential = async (credential) => {
  const googleClientId = getGoogleClientId();
  if (!googleClientId) {
    throw new ApiError(500, 'Google login is not configured on the server');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new ApiError(401, 'Invalid Google credential');
  }

  if (!payload?.sub || !payload?.email) {
    throw new ApiError(401, 'Google credential did not include a usable profile');
  }

  if (payload.email_verified === false) {
    throw new ApiError(401, 'Google account email is not verified');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture || ''
  };
};

const findOrCreateGoogleUser = async ({ googleId, email, name, avatar }) => {
  let user = await UserRepository.findByGoogleId(googleId);

  if (!user) {
    user = await UserRepository.findByEmail(email);
  }

  if (user) {
    if (user.isBlocked) {
      throw new ApiError(403, `Your account has been blocked. Reason: ${user.blockedReason || 'No reason provided'}`);
    }

    let changed = false;
    if (!user.googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!user.avatar && avatar) {
      user.avatar = avatar;
      changed = true;
    }
    if (changed) await user.save();
    return user;
  }

  return await UserRepository.create({
    name,
    email,
    googleId,
    avatar,
    role: 'customer',
    password: crypto.randomBytes(32).toString('hex')
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // 1. Check if user already exists
  const existingUser = await UserRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // 2. Create the user
  const user = await UserRepository.create({
    name,
    email,
    password,
    phone,
    role: 'customer'
  });

  res.status(201).json(
    new ApiResponse(201, { user: sanitizeUser(user) }, 'User registered successfully')
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user
  const user = await UserRepository.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // 2. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new ApiError(403, `Your account has been blocked. Reason: ${user.blockedReason || 'No reason provided'}`);
  }

  res.status(200).json(
    new ApiResponse(200, await buildAuthPayload(user), 'Logged in successfully')
  );
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(200).json(
      new ApiResponse(200, null, 'Logged out successfully')
    );
  }

  // 1. Decode token to find user
  try {
    const decoded = jwt.verify(refreshToken, getJwtSecret('JWT_REFRESH_SECRET'));
    const user = await UserRepository.findById(decoded.id);
    if (user) {
      // Remove token from list
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();
    }
  } catch (error) {
    // Even if token is expired, we proceed to clean it up or ignore
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

export const rotateRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  // 1. Verify token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, getJwtSecret('JWT_REFRESH_SECRET'));
  } catch (error) {
    throw new ApiError(403, 'Invalid or expired refresh token');
  }

  // 2. Find user and check if token exists in DB
  const user = await UserRepository.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new ApiError(403, 'Access denied. Revoked refresh token.');
  }

  // 3. Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // 4. Rotate refresh token in DB
  user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { token: newAccessToken, accessToken: newAccessToken, refreshToken: newRefreshToken },
      'Token refreshed successfully'
    )
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserRepository.findByEmail(email);
  if (!user) {
    // For security reasons, don't expose if user exists
    return res.status(200).json(
      new ApiResponse(200, null, 'If that email exists in our system, we have sent a reset password link.')
    );
  }

  // Generate a reset token (short expiration: 1 hour)
  const resetToken = jwt.sign(
    { id: user._id },
    getJwtSecret('JWT_SECRET'),
    { expiresIn: '1h' }
  );

  // Generate reset URL (usually points to frontend route)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // Send Email
  const html = getPasswordResetTemplate(resetUrl, user.name);
  await sendEmail({
    to: user.email,
    subject: 'FlavorDash - Password Reset Request',
    html
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Password reset link sent to email')
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // 1. Verify reset token
  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret('JWT_SECRET'));
  } catch (error) {
    throw new ApiError(400, 'Invalid or expired password reset token');
  }

  // 2. Find user and update password
  const user = await UserRepository.findById(decoded.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.password = password;
  // Clear refresh tokens on password change for security
  user.refreshTokens = [];
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password reset successfully. Please login with your new password.')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { user: sanitizeUser(user) }, 'User profile retrieved successfully')
  );
});

export const googleCredentialLogin = asyncHandler(async (req, res) => {
  const credential = req.body.credential || req.body.idToken || req.body.token;
  if (!credential) {
    throw new ApiError(400, 'Google credential is required');
  }

  const googleProfile = await verifyGoogleCredential(credential);
  const user = await findOrCreateGoogleUser(googleProfile);

  res.status(200).json(
    new ApiResponse(200, await buildAuthPayload(user), 'Google login successful')
  );
});

// OAuth Callback handler to issue tokens to client
export const googleAuthCallbackSuccess = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Google login failed');
  }

  const { token, refreshToken } = await buildAuthPayload(req.user);

  // Redirect to frontend with tokens as query params or cookies (redirect is standard for OAuth callbacks)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  res.redirect(
    `${frontendUrl}/oauth-success?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`
  );
});

import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../services/emailService.js';
import { getPasswordResetTemplate } from '../utils/emailTemplates.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helpers to generate tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'jwt_default_secret_key_12345!',
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'jwt_default_refresh_key_54321!',
    { expiresIn: '7d' }
  );
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

  // Remove password from response
  user.password = undefined;

  res.status(201).json(
    new ApiResponse(201, { user }, 'User registered successfully')
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

  // 3. Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 4. Save refresh token in database
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Remove password from response
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(200).json(
    new ApiResponse(200, { user, accessToken, refreshToken }, 'Logged in successfully')
  );
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  // 1. Decode token to find user
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'jwt_default_refresh_key_54321!');
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
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'jwt_default_refresh_key_54321!');
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
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
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
    process.env.JWT_SECRET || 'jwt_default_secret_key_12345!',
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
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_default_secret_key_12345!');
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
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(200).json(
    new ApiResponse(200, { user }, 'User profile retrieved successfully')
  );
});

// OAuth Callback handler to issue tokens to client
export const googleAuthCallbackSuccess = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Google login failed');
  }

  // Generate tokens
  const accessToken = generateAccessToken(req.user);
  const refreshToken = generateRefreshToken(req.user);

  req.user.refreshTokens = req.user.refreshTokens || [];
  req.user.refreshTokens.push(refreshToken);
  await req.user.save();

  // Redirect to frontend with tokens as query params or cookies (redirect is standard for OAuth callbacks)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  res.redirect(
    `${frontendUrl}/oauth-success?token=${accessToken}&refreshToken=${refreshToken}`
  );
});

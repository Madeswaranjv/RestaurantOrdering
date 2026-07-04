import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. 'Home', 'Office'
  address: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'deliveryPartner', 'admin'], default: 'customer' },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  addresses: [addressSchema],
  savedRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
  refreshTokens: [{ type: String }],
  googleId: { type: String, unique: true, sparse: true },
  isBlocked: { type: Boolean, default: false },
  blockedAt: { type: Date },
  blockedReason: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

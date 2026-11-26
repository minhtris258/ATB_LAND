import mongoose from 'mongoose';

/**
 * Schema Người dùng & Chủ cơ sở lưu trú (users)
 */
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['GUEST', 'HOST', 'ADMIN'],
      default: 'GUEST',
    },
    hostProfile: {
      isVerified: { type: Boolean, default: false },
      businessType: { type: String, enum: ['INDIVIDUAL', 'ENTERPRISE'], default: 'INDIVIDUAL' },
      identityCardNumber: { type: String, default: '' },
      verifiedAt: { type: Date, default: null },
    },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
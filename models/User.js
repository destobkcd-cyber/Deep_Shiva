const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['local', 'google', 'apple', 'facebook'],
      default: 'local',
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
    },

    // Optional profile fields
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    farmSize: { type: String, trim: true },

    // Verification status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    // Email OTP
    emailOtpHash: { type: String },
    emailOtpExpiresAt: { type: Date },

    // Mobile OTP
    mobileOtpHash: { type: String },
    mobileOtpExpiresAt: { type: Date },

    // Password reset token
    resetTokenHash: { type: String },
    resetTokenExpiresAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });

module.exports = mongoose.model('User', userSchema);

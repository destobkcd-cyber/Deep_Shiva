const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

const OTP_LENGTH = 6;
const OTP_EXPIRES_MINUTES = 5;
const RESET_EXPIRES_MINUTES = 30;
const SALT_ROUNDS = 10;

function createToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

function generateNumericOtp(length = OTP_LENGTH) {
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

function generateResetTokenRaw() {
  return crypto.randomBytes(32).toString('hex');
}

// TODO: replace with real implementations
async function sendEmail(to, subject, text) {
  console.log('SEND EMAIL (stub):', { to, subject, text });
}

async function sendSms(mobile, text) {
  console.log('SEND SMS (stub):', { mobile, text });
}

/**
 * SIGNUP
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      state,
      district,
      farmSize,
    } = req.body;

    if (!email && !mobile) {
      return res
        .status(400)
        .json({ message: 'Email or mobile is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const existing = await User.findOne({
      $or: [
        email ? { email } : null,
        mobile ? { mobile } : null,
      ].filter(Boolean),
    });

    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate OTPs
    const emailOtp = email ? generateNumericOtp() : null;
    const mobileOtp = mobile ? generateNumericOtp() : null;

    const emailOtpHash = emailOtp
      ? await bcrypt.hash(emailOtp, SALT_ROUNDS)
      : undefined;
    const mobileOtpHash = mobileOtp
      ? await bcrypt.hash(mobileOtp, SALT_ROUNDS)
      : undefined;

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000
    );

    const user = await User.create({
      provider: 'local',
      name,
      email,
      mobile,
      passwordHash,
      state,
      district,
      farmSize,
      isEmailVerified: false,
      isMobileVerified: false,
      emailOtpHash,
      emailOtpExpiresAt: emailOtp ? expiresAt : undefined,
      mobileOtpHash,
      mobileOtpExpiresAt: mobileOtp ? expiresAt : undefined,
    });

    // Send OTPs
    if (email && emailOtp) {
      await sendEmail(
        email,
        'Smart Agriculture – Email verification code',
        `Your verification code is: ${emailOtp}. It is valid for ${OTP_EXPIRES_MINUTES} minutes.`
      );
    }
    if (mobile && mobileOtp) {
      await sendSms(
        mobile,
        `Smart Agriculture: your verification code is ${mobileOtp}. Valid for ${OTP_EXPIRES_MINUTES} minutes.`
      );
    }

    const token = createToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
      },
      otp: {
        emailSent: !!email,
        mobileSent: !!mobile,
      },
    });
  } catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * LOGIN
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if ((!email && !mobile) || !password) {
      return res
        .status(400)
        .json({ message: 'Email/mobile and password required' });
    }

    const user = await User.findOne(email ? { email } : { mobile });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * SEND EMAIL OTP (resend)
 * POST /api/auth/send-email-otp
 */
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with this email not found' });
    }

    const emailOtp = generateNumericOtp();
    const emailOtpHash = await bcrypt.hash(emailOtp, SALT_ROUNDS);
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000
    );

    user.emailOtpHash = emailOtpHash;
    user.emailOtpExpiresAt = expiresAt;
    await user.save();

    await sendEmail(
      email,
      'Smart Agriculture – Email verification code',
      `Your verification code is: ${emailOtp}. It is valid for ${OTP_EXPIRES_MINUTES} minutes.`
    );

    res.json({ message: 'Email OTP sent' });
  } catch (err) {
    console.error('Send email OTP error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * VERIFY EMAIL OTP
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      !user.emailOtpHash ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    const ok = await bcrypt.compare(otp, user.emailOtpHash);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * SEND MOBILE OTP (resend)
 * POST /api/auth/send-mobile-otp
 */
router.post('/send-mobile-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile is required' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with this mobile not found' });
    }

    const mobileOtp = generateNumericOtp();
    const mobileOtpHash = await bcrypt.hash(mobileOtp, SALT_ROUNDS);
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000
    );

    user.mobileOtpHash = mobileOtpHash;
    user.mobileOtpExpiresAt = expiresAt;
    await user.save();

    await sendSms(
      mobile,
      `Smart Agriculture: your verification code is ${mobileOtp}. Valid for ${OTP_EXPIRES_MINUTES} minutes.`
    );

    res.json({ message: 'Mobile OTP sent' });
  } catch (err) {
    console.error('Send mobile OTP error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * VERIFY MOBILE OTP
 * POST /api/auth/verify-mobile
 */
router.post('/verify-mobile', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ message: 'Mobile and OTP are required' });
    }

    const user = await User.findOne({ mobile });
    if (
      !user ||
      !user.mobileOtpHash ||
      !user.mobileOtpExpiresAt ||
      user.mobileOtpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    const ok = await bcrypt.compare(otp, user.mobileOtpHash);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isMobileVerified = true;
    user.mobileOtpHash = undefined;
    user.mobileOtpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Mobile verified successfully' });
  } catch (err) {
    console.error('Verify mobile error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * REQUEST PASSWORD RESET
 * POST /api/auth/forgot
 */
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: 'If this email exists, reset instructions were sent',
      });
    }

    const rawToken = generateResetTokenRaw();
    const resetTokenHash = await bcrypt.hash(rawToken, SALT_ROUNDS);
    const expiresAt = new Date(
      Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000
    );

    user.resetTokenHash = resetTokenHash;
    user.resetTokenExpiresAt = expiresAt;
    await user.save();

    const resetLink = `${
      process.env.FRONTEND_URL || 'http://localhost:5500'
    }/reset.html?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendEmail(
      email,
      'Smart Agriculture – Reset your password',
      `To reset your password, visit: ${resetLink}\n\nThis link is valid for ${RESET_EXPIRES_MINUTES} minutes.`
    );

    res.json({
      message: 'If this email exists, reset instructions were sent',
    });
  } catch (err) {
    console.error('Forgot password error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * COMPLETE PASSWORD RESET
 * POST /api/auth/reset
 */
router.post('/reset', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({
        message: 'Email, token and new password are required',
      });
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      !user.resetTokenHash ||
      !user.resetTokenExpiresAt ||
      user.resetTokenExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: 'Reset token expired or invalid' });
    }

    const ok = await bcrypt.compare(token, user.resetTokenHash);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHash = passwordHash;
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

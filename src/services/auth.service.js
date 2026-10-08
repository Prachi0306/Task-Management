const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const emailService = require('./email.service');
const User = require('../models/User');

class AuthService {
  async register({ name, email, password, role }) {
    const exists = await userRepository.existsByEmail(email);
    if (exists) {
      throw AppError.conflict('Email already registered');
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationTokenHash = crypto.createHash('sha256').update(verificationCode).digest('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await userRepository.create({ 
      name, 
      email, 
      password, 
      role,
      isEmailVerified: false,
      verificationTokenHash,
      verificationTokenExpiresAt,
    });

    await emailService.sendVerificationEmail(email, name, verificationCode);

    return {
      user: { ...user.toJSON(), isEmailVerified: false },
      requiresVerification: true,
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.isEmailVerified === false) {
      throw AppError.forbidden('Please verify your email before logging in.');
    }

    const token = generateToken(user._id, user.role);

    return {
      user: user.toJSON(),
      token,
    };
  }

  async verifyEmail({ email, code }) {
    const user = await User.findOne({ email }).select('+verificationTokenHash +verificationTokenExpiresAt');
    
    if (!user) {
      throw AppError.notFound('User not found');
    }
    if (user.isEmailVerified !== false) {
      throw AppError.badRequest('Email is already verified');
    }
    if (!user.verificationTokenHash || !user.verificationTokenExpiresAt) {
      throw AppError.badRequest('Invalid verification request');
    }
    if (user.verificationTokenExpiresAt < new Date()) {
      throw AppError.badRequest('Verification code has expired.');
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    if (hashedCode !== user.verificationTokenHash) {
      user.verificationAttempts = (user.verificationAttempts || 0) + 1;
      if (user.verificationAttempts >= 5) {
        user.verificationTokenHash = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        throw AppError.badRequest('Too many incorrect verification attempts. Please request a new verification code.');
      }
      await user.save();
      throw AppError.badRequest('Invalid verification code.');
    }

    user.isEmailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.verificationAttempts = 0;
    await user.save();

    return { success: true };
  }

  async resendVerification({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw AppError.notFound('User not found');
    }
    if (user.isEmailVerified !== false) {
      throw AppError.badRequest('Email is already verified');
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationTokenHash = crypto.createHash('sha256').update(verificationCode).digest('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationTokenHash = verificationTokenHash;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    user.verificationAttempts = 0;
    await user.save();

    await emailService.sendVerificationEmail(email, user.name, verificationCode);

    return { success: true };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user.toJSON();
  }
}

module.exports = new AuthService();

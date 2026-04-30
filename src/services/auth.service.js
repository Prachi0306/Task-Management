const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

class AuthService {
  async register({ name, email, password, role }) {
    const exists = await userRepository.existsByEmail(email);
    if (exists) {
      throw AppError.conflict('Email already registered');
    }

    const user = await userRepository.create({ name, email, password, role });

    const token = generateToken(user._id, user.role);

    return {
      user: user.toJSON(),
      token,
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

    const token = generateToken(user._id, user.role);

    return {
      user: user.toJSON(),
      token,
    };
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

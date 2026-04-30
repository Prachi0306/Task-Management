const User = require('../models/User');

class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email });
    if (includePassword) query.select('+password');
    return query;
  }

  async findById(id, includePassword = false) {
    const query = User.findById(id);
    if (includePassword) query.select('+password');
    return query;
  }

  async existsByEmail(email) {
    return User.exists({ email });
  }
}

module.exports = new UserRepository();

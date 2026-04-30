const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, _res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw AppError.unauthorized('Access denied. No token provided.');
  }

  const decoded = verifyToken(token);

  const user = await userRepository.findById(decoded.id);
  if (!user) {
    throw AppError.unauthorized('User belonging to this token no longer exists.');
  }

  req.user = { id: user._id.toString(), role: user.role };
  next();
});

const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw AppError.unauthorized('Access denied. Not authenticated.');
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('You do not have permission to perform this action.');
    }

    next();
  };
};

module.exports = { protect, authorize };

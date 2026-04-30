const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
});

const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = { register, login, getProfile };

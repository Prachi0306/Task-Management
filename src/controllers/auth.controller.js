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

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.body);
  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

const resendVerification = catchAsync(async (req, res) => {
  await authService.resendVerification(req.body);
  res.status(200).json({
    success: true,
    message: 'Verification email sent',
  });
});

module.exports = { register, login, getProfile, verifyEmail, resendVerification };

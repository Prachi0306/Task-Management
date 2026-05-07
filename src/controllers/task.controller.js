const taskService = require('../services/task.service');
const catchAsync = require('../utils/catchAsync');

const createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
});

const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: { task },
  });
});

const listTasks = catchAsync(async (req, res) => {
  const result = await taskService.listTasks(req.user.id, req.user.role, req.query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.user.id, req.user.role, req.body);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task },
  });
});

const deleteTask = catchAsync(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const task = await taskService.updateStatus(req.params.id, req.user.id, req.user.role, req.body.status);

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: { task },
  });
});

const getTaskActivity = catchAsync(async (req, res) => {
  const activity = await taskService.getTaskActivity(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: { activity },
  });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await taskService.getStats(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

const getTimeline = catchAsync(async (req, res) => {
  const timeline = await taskService.getTimeline(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: { timeline },
  });
});

module.exports = { createTask, getTask, listTasks, updateTask, deleteTask, updateStatus, getTaskActivity, getStats, getTimeline };

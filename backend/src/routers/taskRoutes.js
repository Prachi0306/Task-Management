const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { createTaskValidation, updateTaskValidation } = require('../validator/taskValidator');
const { validate } = require('../middleware/validation');

// All routes are protected
router.use(protect);

router.post('/', createTaskValidation, validate, taskController.createTask);
router.get('/stats', taskController.getTaskStats);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', updateTaskValidation, validate, taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.patch('/:id/assign', taskController.assignTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;

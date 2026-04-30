const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate');
const taskValidator = require('../validators/task.validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.post('/', validate(taskValidator.createTask), taskController.createTask);
router.get('/', validate(taskValidator.listTasks), taskController.listTasks);
router.get('/:id', validate(taskValidator.getTask), taskController.getTask);
router.put('/:id', validate(taskValidator.updateTask), taskController.updateTask);
router.delete('/:id', validate(taskValidator.deleteTask), taskController.deleteTask);

module.exports = router;

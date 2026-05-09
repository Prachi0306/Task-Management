const express = require('express');
const taskController = require('../controllers/task.controller');
const commentController = require('../controllers/comment.controller');
const validate = require('../middleware/validate');
const taskValidator = require('../validators/task.validator');
const commentValidator = require('../validators/comment.validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', validate(taskValidator.createTask), taskController.createTask);
router.get('/', validate(taskValidator.listTasks), taskController.listTasks);

router.get('/stats', taskController.getStats);
router.get('/stats/timeline', taskController.getTimeline);

router.get('/:id', validate(taskValidator.getTask), taskController.getTask);
router.put('/:id', validate(taskValidator.updateTask), taskController.updateTask);
router.delete('/:id', validate(taskValidator.deleteTask), taskController.deleteTask);

router.patch('/:id/status', validate(taskValidator.updateStatus), taskController.updateStatus);
router.get('/:id/activity', validate(taskValidator.getTask), taskController.getTaskActivity);

router.post('/:id/comments', validate(commentValidator.addComment), commentController.addComment);
router.get('/:id/comments', validate(commentValidator.getComments), commentController.getComments);
router.delete('/:id/comments/:commentId', validate(commentValidator.deleteComment), commentController.deleteComment);

module.exports = router;

const Comment = require('../models/Comment');

class CommentRepository {
  async create(commentData) {
    const comment = await Comment.create(commentData);
    return comment.populate([
      { path: 'author', select: 'name email' },
      { path: 'mentions', select: 'name email' },
    ]);
  }

  async findByTask(taskId, { skip, limit }) {
    const [comments, total] = await Promise.all([
      Comment.find({ task: taskId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email')
        .populate('mentions', 'name email'),
      Comment.countDocuments({ task: taskId }),
    ]);

    return { comments, total };
  }

  async findById(commentId) {
    return Comment.findById(commentId)
      .populate('author', 'name email')
      .populate('mentions', 'name email');
  }

  async deleteById(commentId) {
    return Comment.findByIdAndDelete(commentId);
  }

  async countByTask(taskId) {
    return Comment.countDocuments({ task: taskId });
  }
}

module.exports = new CommentRepository();

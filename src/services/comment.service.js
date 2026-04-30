const commentRepository = require('../repositories/comment.repository');
const taskRepository = require('../repositories/task.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

class CommentService {
  async addComment(taskId, userId, { text, mentions }) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    // Extract @mentions from text if not explicitly provided
    const parsedMentions = mentions || this._extractMentions(text);

    // Validate that mentioned user IDs exist
    const validMentions = [];
    for (const mentionId of parsedMentions) {
      const user = await userRepository.findById(mentionId);
      if (user) {
        validMentions.push(user._id);
      }
    }

    const comment = await commentRepository.create({
      task: taskId,
      author: userId,
      text,
      mentions: validMentions,
    });

    return comment;
  }

  async getComments(taskId, userId, userRole, { page = 1, limit = 20 }) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (
      userRole !== 'admin' &&
      task.createdBy._id.toString() !== userId &&
      (!task.assignedTo || task.assignedTo._id.toString() !== userId)
    ) {
      throw AppError.forbidden('You do not have access to this task comments');
    }

    const skip = (page - 1) * limit;
    const { comments, total } = await commentRepository.findByTask(taskId, { skip, limit });

    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteComment(commentId, userId, userRole) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw AppError.notFound('Comment not found');
    }

    if (userRole !== 'admin' && comment.author._id.toString() !== userId) {
      throw AppError.forbidden('Only the comment author or an admin can delete this comment');
    }

    await commentRepository.deleteById(commentId);
    return { message: 'Comment deleted successfully' };
  }

  _extractMentions(text) {
    // Match MongoDB ObjectId patterns after @ symbol
    const mentionPattern = /@([0-9a-fA-F]{24})/g;
    const mentions = [];
    let match;
    while ((match = mentionPattern.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)];
  }
}

module.exports = new CommentService();

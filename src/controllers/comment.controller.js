const commentService = require('../services/comment.service');
const catchAsync = require('../utils/catchAsync');

const addComment = catchAsync(async (req, res) => {
  const comment = await commentService.addComment(req.params.id, req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: { comment },
  });
});

const getComments = catchAsync(async (req, res) => {
  const result = await commentService.getComments(
    req.params.id,
    req.user.id,
    req.user.role,
    req.query
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const result = await commentService.deleteComment(req.params.commentId, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = { addComment, getComments, deleteComment };

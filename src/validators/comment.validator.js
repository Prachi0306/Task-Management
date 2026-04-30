const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format',
});

const addComment = {
  params: Joi.object({
    id: objectId.required(),
  }),
  body: Joi.object({
    text: Joi.string().trim().min(1).max(2000).required()
      .messages({
        'string.min': 'Comment cannot be empty',
        'string.max': 'Comment must not exceed 2000 characters',
        'any.required': 'Comment text is required',
      }),
    mentions: Joi.array().items(objectId).max(10).default([])
      .messages({
        'array.max': 'Cannot mention more than 10 users',
      }),
  }),
};

const getComments = {
  params: Joi.object({
    id: objectId.required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};

const deleteComment = {
  params: Joi.object({
    id: objectId.required(),
    commentId: objectId.required(),
  }),
};

module.exports = { addComment, getComments, deleteComment };

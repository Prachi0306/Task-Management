const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format',
});

const createTask = {
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).required()
      .messages({
        'string.min': 'Title must be at least 3 characters',
        'string.max': 'Title must not exceed 200 characters',
        'any.required': 'Title is required',
      }),
    description: Joi.string().trim().max(5000).allow('').default('')
      .messages({
        'string.max': 'Description must not exceed 5000 characters',
      }),
    status: Joi.string().valid('To-Do', 'In-Progress', 'Completed').default('To-Do'),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    dueDate: Joi.date().iso().greater('now').allow(null).default(null)
      .messages({
        'date.greater': 'Due date must be in the future',
        'date.format': 'Due date must be a valid ISO date',
      }),
    assignedTo: objectId.allow(null).default(null),
  }),
};

const updateTask = {
  params: Joi.object({
    id: objectId.required(),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200)
      .messages({
        'string.min': 'Title must be at least 3 characters',
        'string.max': 'Title must not exceed 200 characters',
      }),
    description: Joi.string().trim().max(5000).allow('')
      .messages({
        'string.max': 'Description must not exceed 5000 characters',
      }),
    status: Joi.string().valid('To-Do', 'In-Progress', 'Completed'),
    priority: Joi.string().valid('Low', 'Medium', 'High'),
    dueDate: Joi.date().iso().allow(null)
      .messages({
        'date.format': 'Due date must be a valid ISO date',
      }),
    assignedTo: objectId.allow(null),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};

const getTask = {
  params: Joi.object({
    id: objectId.required(),
  }),
};

const deleteTask = {
  params: Joi.object({
    id: objectId.required(),
  }),
};

const listTasks = {
  query: Joi.object({
    status: Joi.string().valid('To-Do', 'In-Progress', 'Completed'),
    priority: Joi.string().valid('Low', 'Medium', 'High'),
    assignedTo: objectId,
    createdBy: objectId,
    dueDateStart: Joi.date().iso(),
    dueDateEnd: Joi.date().iso().min(Joi.ref('dueDateStart')).messages({
      'date.min': 'dueDateEnd must be after or equal to dueDateStart',
    }),
    search: Joi.string().trim().max(200),
    sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};
const updateStatus = {
  params: Joi.object({
    id: objectId.required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('To-Do', 'In-Progress', 'Completed').required()
      .messages({
        'any.required': 'Status is required',
        'any.only': 'Status must be one of: To-Do, In-Progress, Completed',
      }),
  }),
};

module.exports = { createTask, updateTask, getTask, deleteTask, listTasks, updateStatus };

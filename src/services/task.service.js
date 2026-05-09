const taskRepository = require('../repositories/task.repository');
const cacheService = require('./cache.service');
const AppError = require('../utils/AppError');
const { emitToUser } = require('../config/socket');

const PRIORITY_ORDER = { Low: 1, Medium: 2, High: 3 };

const VALID_TRANSITIONS = {
  'To-Do': ['In-Progress'],
  'In-Progress': ['Completed', 'To-Do'],
  'Completed': ['To-Do'],
};

class TaskService {
  async createTask(userId, taskData) {
    const task = await taskRepository.create({
      ...taskData,
      createdBy: userId,
    });

    const populatedTask = await taskRepository.findById(task._id);

    await this._invalidateTaskCache(userId);

    if (populatedTask.assignedTo) {
      emitToUser(populatedTask.assignedTo._id, 'task_assigned', {
        message: 'You have been assigned a new task',
        task: populatedTask,
      });
    }

    return populatedTask;
  }

  async getTaskById(taskId, userId, userRole) {
    const cacheKey = `task:${taskId}`;
    let task = await cacheService.get(cacheKey);

    if (!task) {
      task = await taskRepository.findById(taskId);
      if (!task) {
        throw AppError.notFound('Task not found');
      }
      await cacheService.set(cacheKey, task);
    }

    if (userRole !== 'admin' && task.createdBy._id.toString() !== userId && (!task.assignedTo || task.assignedTo._id.toString() !== userId)) {
      throw AppError.forbidden('You do not have access to this task');
    }

    return task;
  }

  async listTasks(userId, userRole, queryParams) {
    const { status, priority, assignedTo, createdBy, dueDateStart, dueDateEnd, search, sortBy, sortOrder, page, limit } = queryParams;

    const filter = {};

    if (userRole !== 'admin') {
      filter.$or = [{ createdBy: userId }, { assignedTo: userId }];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdBy) filter.createdBy = createdBy;

    if (dueDateStart || dueDateEnd) {
      filter.dueDate = {};
      if (dueDateStart) filter.dueDate.$gte = new Date(dueDateStart);
      if (dueDateEnd) filter.dueDate.$lte = new Date(dueDateEnd);
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const searchCondition = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
        delete filter.$or;
      } else {
        filter.$or = searchCondition;
      }
    }

    let sort = {};
    if (sortBy === 'priority') {
      sort = { priority: sortOrder === 'asc' ? 1 : -1 };
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * limit;

    const cacheKey = `tasks:user:${userId}:${JSON.stringify(queryParams)}`;
    
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const { tasks, total } = await taskRepository.findWithFilters({
      filter,
      sort,
      skip,
      limit,
    });

    const result = {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await cacheService.set(cacheKey, result);
    return result;
  }

  async updateTask(taskId, userId, userRole, updateData) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (userRole !== 'admin' && task.createdBy._id.toString() !== userId) {
      throw AppError.forbidden('Only the task creator or an admin can update this task');
    }

    if (updateData.status && updateData.status !== task.status) {
      this._validateTransition(task.status, updateData.status);
    }

    const logEntries = [];
    for (const [field, newValue] of Object.entries(updateData)) {
      const oldValue = task[field];
      if (String(oldValue) !== String(newValue)) {
        logEntries.push({
          action: field === 'status' ? 'status_change' : 'updated',
          field,
          oldValue,
          newValue,
          changedBy: userId,
          changedAt: new Date(),
        });
      }
    }

    const update = {
      ...updateData,
    };

    if (logEntries.length > 0) {
      update.$push = { activityLog: { $each: logEntries } };
    }

    const updated = await taskRepository.updateById(taskId, update);

    await this._invalidateTaskCache(userId, taskId);

    if (logEntries.length > 0 && updated.assignedTo) {
      emitToUser(updated.assignedTo._id, 'task_updated', {
        message: `Task "${updated.title}" has been updated`,
        task: updated,
      });
    }

    return updated;
  }

  async deleteTask(taskId, userId, userRole) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (userRole !== 'admin' && task.createdBy._id.toString() !== userId) {
      throw AppError.forbidden('Only the task creator or an admin can delete this task');
    }

    await taskRepository.deleteById(taskId);
    await this._invalidateTaskCache(userId, taskId);
    return { message: 'Task deleted successfully' };
  }

  async updateStatus(taskId, userId, userRole, newStatus) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (userRole !== 'admin' && task.createdBy._id.toString() !== userId && (!task.assignedTo || task.assignedTo._id.toString() !== userId)) {
      throw AppError.forbidden('You do not have permission to change this task status');
    }

    if (task.status === newStatus) {
      throw AppError.badRequest(`Task is already in ${newStatus} status`);
    }

    this._validateTransition(task.status, newStatus);

    const update = {
      status: newStatus,
      $push: {
        activityLog: {
          action: 'status_change',
          field: 'status',
          oldValue: task.status,
          newValue: newStatus,
          changedBy: userId,
          changedAt: new Date(),
        },
      },
    };

    const updatedTask = await taskRepository.updateById(taskId, update);

    await this._invalidateTaskCache(userId, taskId);

    if (updatedTask.assignedTo && updatedTask.assignedTo._id.toString() !== userId) {
      emitToUser(updatedTask.assignedTo._id, 'task_status_changed', {
        message: `Status of "${updatedTask.title}" changed to ${newStatus}`,
        task: updatedTask,
      });
    }
    
    if (updatedTask.createdBy._id.toString() !== userId) {
      emitToUser(updatedTask.createdBy._id, 'task_status_changed', {
        message: `Status of "${updatedTask.title}" changed to ${newStatus}`,
        task: updatedTask,
      });
    }

    return updatedTask;
  }

  async _invalidateTaskCache(userId, taskId = null) {
    await cacheService.invalidatePattern(`tasks:user:${userId}:*`);
    await cacheService.invalidatePattern('tasks:user:admin:*');
    if (taskId) {
      await cacheService.del(`task:${taskId}`);
    }
  }

  async getTaskActivity(taskId, userId, userRole) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (userRole !== 'admin' && task.createdBy._id.toString() !== userId && (!task.assignedTo || task.assignedTo._id.toString() !== userId)) {
      throw AppError.forbidden('You do not have access to this task activity');
    }

    return task.activityLog.sort((a, b) => b.changedAt - a.changedAt);
  }

  async getStats(userId, userRole) {
    const mongoose = require('mongoose');
    const objectId = userRole === 'admin' ? null : new mongoose.Types.ObjectId(userId);
    return taskRepository.getStats(objectId, userRole);
  }

  async getTimeline(userId, userRole) {
    const mongoose = require('mongoose');
    const objectId = userRole === 'admin' ? null : new mongoose.Types.ObjectId(userId);
    return taskRepository.getTimeline(objectId, userRole);
  }

  _validateTransition(currentStatus, newStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw AppError.badRequest(
        `Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed ? allowed.join(', ') : 'none'}`
      );
    }
  }
}

module.exports = new TaskService();

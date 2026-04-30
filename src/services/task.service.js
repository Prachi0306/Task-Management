const taskRepository = require('../repositories/task.repository');
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

    if (populatedTask.assignedTo) {
      emitToUser(populatedTask.assignedTo._id, 'task_assigned', {
        message: 'You have been assigned a new task',
        task: populatedTask,
      });
    }

    return populatedTask;
  }

  async getTaskById(taskId, userId, userRole) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (userRole !== 'admin' && task.createdBy._id.toString() !== userId && (!task.assignedTo || task.assignedTo._id.toString() !== userId)) {
      throw AppError.forbidden('You do not have access to this task');
    }

    return task;
  }

  async listTasks(userId, userRole, queryParams) {
    const { status, priority, assignedTo, createdBy, dueDateStart, dueDateEnd, search, sortBy, sortOrder, page, limit } = queryParams;

    const filter = {};

    // Non-admin users only see tasks they created or are assigned to
    if (userRole !== 'admin') {
      filter.$or = [{ createdBy: userId }, { assignedTo: userId }];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdBy) filter.createdBy = createdBy;

    // Date range filtering
    if (dueDateStart || dueDateEnd) {
      filter.dueDate = {};
      if (dueDateStart) filter.dueDate.$gte = new Date(dueDateStart);
      if (dueDateEnd) filter.dueDate.$lte = new Date(dueDateEnd);
    }

    // Full-text search on title and description
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    let sort = {};
    if (sortBy === 'priority') {
      // Custom priority sorting since string sort won't give logical order
      sort = { priority: sortOrder === 'asc' ? 1 : -1 };
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * limit;

    const { tasks, total } = await taskRepository.findWithFilters({
      filter,
      sort,
      skip,
      limit,
    });

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateTask(taskId, userId, userRole, updateData) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (userRole !== 'admin' && task.createdBy._id.toString() !== userId) {
      throw AppError.forbidden('Only the task creator or an admin can update this task');
    }

    // Validate status transition if status is being changed
    if (updateData.status && updateData.status !== task.status) {
      this._validateTransition(task.status, updateData.status);
    }

    // Build activity log entries for changed fields
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

    // Emit event if there are changes and the task has an assignee
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

    // Notify the assignee if someone else changed the status
    if (updatedTask.assignedTo && updatedTask.assignedTo._id.toString() !== userId) {
      emitToUser(updatedTask.assignedTo._id, 'task_status_changed', {
        message: `Status of "${updatedTask.title}" changed to ${newStatus}`,
        task: updatedTask,
      });
    }
    
    // Notify the creator if the assignee changed the status
    if (updatedTask.createdBy._id.toString() !== userId) {
      emitToUser(updatedTask.createdBy._id, 'task_status_changed', {
        message: `Status of "${updatedTask.title}" changed to ${newStatus}`,
        task: updatedTask,
      });
    }

    return updatedTask;
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

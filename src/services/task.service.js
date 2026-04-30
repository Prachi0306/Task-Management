const taskRepository = require('../repositories/task.repository');
const AppError = require('../utils/AppError');

const PRIORITY_ORDER = { Low: 1, Medium: 2, High: 3 };

class TaskService {
  async createTask(userId, taskData) {
    const task = await taskRepository.create({
      ...taskData,
      createdBy: userId,
    });

    return taskRepository.findById(task._id);
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
    const { status, priority, assignedTo, search, sortBy, sortOrder, page, limit } = queryParams;

    const filter = {};

    // Non-admin users only see tasks they created or are assigned to
    if (userRole !== 'admin') {
      filter.$or = [{ createdBy: userId }, { assignedTo: userId }];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

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

    // Build activity log entries for changed fields
    const logEntries = [];
    for (const [field, newValue] of Object.entries(updateData)) {
      const oldValue = task[field];
      if (String(oldValue) !== String(newValue)) {
        logEntries.push({
          action: 'updated',
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
}

module.exports = new TaskService();

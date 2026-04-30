const Task = require('../models/Task');

class TaskRepository {
  async create(taskData) {
    return Task.create(taskData);
  }

  async findById(id) {
    return Task.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
  }

  async findWithFilters({ filter, sort, skip, limit }) {
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email'),
      Task.countDocuments(filter),
    ]);

    return { tasks, total };
  }

  async updateById(id, updateData) {
    return Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
  }

  async deleteById(id) {
    return Task.findByIdAndDelete(id);
  }
}

module.exports = new TaskRepository();

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

  async getStats(userId, userRole) {
    const matchStage = userRole === 'admin'
      ? {}
      : { $or: [{ createdBy: userId }, { assignedTo: userId }] };

    const [statusCounts, priorityCounts, overdueCounts] = await Promise.all([
      Task.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: matchStage },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        {
          $match: {
            ...matchStage,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date(), $ne: null },
          },
        },
        { $count: 'overdue' },
      ]),
    ]);

    return {
      byStatus: statusCounts,
      byPriority: priorityCounts,
      overdue: overdueCounts[0]?.overdue || 0,
    };
  }

  async getTimeline(userId, userRole) {
    const matchStage = userRole === 'admin'
      ? { status: 'Completed' }
      : { status: 'Completed', $or: [{ createdBy: userId }, { assignedTo: userId }] };

    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    return Task.aggregate([
      {
        $match: {
          ...matchStage,
          updatedAt: { $gte: eightWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$updatedAt' },
            week: { $isoWeek: '$updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);
  }
}

module.exports = new TaskRepository();

const mongoose = require('mongoose');

const STATUSES = ['To-Do', 'In-Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description must not exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be one of: To-Do, In-Progress, Completed',
      },
      default: 'To-Do',
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITIES,
        message: 'Priority must be one of: Low, Medium, High',
      },
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have a creator'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    activityLog: [
      {
        action: {
          type: String,
          required: true,
        },
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for filtering, sorting, and search
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ title: 'text', description: 'text' });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;

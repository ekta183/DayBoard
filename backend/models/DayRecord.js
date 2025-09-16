const mongoose = require('mongoose');

const dayRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  isEnded: {
    type: Boolean,
    default: false
  },
  endedAt: {
    type: Date
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  overallProductivity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  productivityLabel: {
    type: String,
    enum: ['Not Productive', 'Moderately Productive', 'Productive'],
    default: 'Not Productive'
  },
  summary: {
    type: String,
    trim: true
  }
});

dayRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

dayRecordSchema.methods.calculateProductivity = async function() {
  if (this.totalTasks === 0) {
    this.overallProductivity = 0;
    this.productivityLabel = 'Not Productive';
    return;
  }

  // Get all tasks for this day to calculate average completion percentage
  const Task = require('./Task');
  const tasks = await Task.find({
    userId: this.userId,
    date: this.date
  });

  if (tasks.length === 0) {
    this.overallProductivity = 0;
    this.productivityLabel = 'Not Productive';
    return;
  }

  // Calculate average completion percentage of all tasks
  const totalCompletionPercentage = tasks.reduce((sum, task) => sum + task.completionPercentage, 0);
  this.overallProductivity = Math.round(totalCompletionPercentage / tasks.length);

  if (this.overallProductivity >= 80) {
    this.productivityLabel = 'Productive';
  } else if (this.overallProductivity >= 50) {
    this.productivityLabel = 'Moderately Productive';
  } else {
    this.productivityLabel = 'Not Productive';
  }
};

module.exports = mongoose.model('DayRecord', dayRecordSchema);
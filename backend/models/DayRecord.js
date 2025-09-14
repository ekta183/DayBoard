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

dayRecordSchema.methods.calculateProductivity = function() {
  if (this.totalTasks === 0) {
    this.overallProductivity = 0;
    this.productivityLabel = 'Not Productive';
    return;
  }

  this.overallProductivity = Math.round((this.completedTasks / this.totalTasks) * 100);
  
  if (this.overallProductivity >= 80) {
    this.productivityLabel = 'Productive';
  } else if (this.overallProductivity >= 50) {
    this.productivityLabel = 'Moderately Productive';
  } else {
    this.productivityLabel = 'Not Productive';
  }
};

module.exports = mongoose.model('DayRecord', dayRecordSchema);
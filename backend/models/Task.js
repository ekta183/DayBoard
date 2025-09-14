const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  totalItems: {
    type: Number,
    required: true,
    min: 1
  },
  completedItems: {
    type: Number,
    default: 0,
    min: 0
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  note: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.pre('save', function(next) {
  this.completionPercentage = Math.round((this.completedItems / this.totalItems) * 100);
  this.isCompleted = this.completionPercentage === 100;
  next();
});

module.exports = mongoose.model('Task', taskSchema);
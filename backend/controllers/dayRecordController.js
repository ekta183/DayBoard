const Task = require('../models/Task');
const DayRecord = require('../models/DayRecord');
const User = require('../models/User');

const endDay = async (req, res) => {
  try {
    const { date, summary } = req.body;
    const userId = req.user._id;

    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);

    let dayRecord = await DayRecord.findOne({ userId, date: dayDate });
    
    if (dayRecord && dayRecord.isEnded) {
      return res.status(400).json({ message: 'Day has already been ended' });
    }

    const tasks = await Task.find({
      userId,
      date: dayDate
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;

    if (!dayRecord) {
      dayRecord = new DayRecord({
        userId,
        date: dayDate,
        totalTasks,
        completedTasks,
        summary: summary || ''
      });
    } else {
      dayRecord.totalTasks = totalTasks;
      dayRecord.completedTasks = completedTasks;
      dayRecord.summary = summary || '';
    }

    dayRecord.isEnded = true;
    dayRecord.endedAt = new Date();
    dayRecord.calculateProductivity();

    await dayRecord.save();

    res.json({
      message: 'Day ended successfully',
      dayRecord
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDayRecord = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user._id;

    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);

    const dayRecord = await DayRecord.findOne({ userId, date: dayDate });
    
    if (!dayRecord) {
      return res.status(404).json({ message: 'Day record not found' });
    }

    res.json(dayRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    let startDate, endDate;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const dayRecords = await DayRecord.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      isEnded: true
    });

    res.json(dayRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicUserCalendar = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    const user = await User.findById(userId);
    if (!user || !user.profileVisible) {
      return res.status(404).json({ message: 'User not found or profile not visible' });
    }

    let startDate, endDate;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const dayRecords = await DayRecord.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      isEnded: true
    });

    res.json({
      user: {
        username: user.username,
        profileVisible: user.profileVisible
      },
      dayRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ profileVisible: true })
      .select('username _id')
      .sort({ username: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  endDay,
  getDayRecord,
  getUserCalendar,
  getPublicUserCalendar,
  getAllUsers
};
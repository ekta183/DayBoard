const Task = require('../models/Task');
const DayRecord = require('../models/DayRecord');
const User = require('../models/User');

const createTask = async (req, res) => {
  try {
    const { title, description, totalItems, date } = req.body;
    const userId = req.user._id;

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const dayRecord = await DayRecord.findOne({
      userId,
      date: taskDate
    });

    if (dayRecord && dayRecord.isEnded) {
      return res.status(400).json({ 
        message: 'Cannot add tasks to an ended day' 
      });
    }

    const task = await Task.create({
      userId,
      title,
      description,
      totalItems,
      date: taskDate
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user._id;

    const query = { userId };
    
    if (date) {
      const taskDate = new Date(date);
      taskDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(taskDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: taskDate,
        $lt: nextDay
      };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, totalItems, completedItems, note } = req.body;
    const userId = req.user._id;

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);

    const dayRecord = await DayRecord.findOne({
      userId,
      date: taskDate
    });

    if (dayRecord && dayRecord.isEnded) {
      return res.status(400).json({
        message: 'Cannot update tasks for an ended day'
      });
    }

    // Update task details
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (totalItems !== undefined) {
      task.totalItems = totalItems;
      // Ensure completed items don't exceed new total
      if (task.completedItems > totalItems) {
        task.completedItems = totalItems;
      }
    }

    // Update progress
    if (completedItems !== undefined) {
      const maxItems = totalItems !== undefined ? totalItems : task.totalItems;
      if (completedItems > maxItems) {
        return res.status(400).json({
          message: 'Completed items cannot exceed total items'
        });
      }
      task.completedItems = completedItems;
    }

    if (note !== undefined) task.note = note;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);

    const dayRecord = await DayRecord.findOne({
      userId,
      date: taskDate
    });

    if (dayRecord && dayRecord.isEnded) {
      return res.status(400).json({
        message: 'Cannot delete tasks from an ended day'
      });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    // Check if user exists and profile is visible
    const user = await User.findById(userId);
    if (!user || !user.profileVisible) {
      return res.status(404).json({ message: 'User not found or profile not visible' });
    }

    const query = { userId };

    if (date) {
      const taskDate = new Date(date);
      taskDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(taskDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: taskDate,
        $lt: nextDay
      };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  updateTask,
  getUserTasks,
  deleteTask,
  getPublicUserTasks
};
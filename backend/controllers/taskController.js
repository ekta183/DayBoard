const Task = require('../models/Task');
const DayRecord = require('../models/DayRecord');

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

const updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completedItems, note } = req.body;
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

    if (completedItems > task.totalItems) {
      return res.status(400).json({ 
        message: 'Completed items cannot exceed total items' 
      });
    }

    task.completedItems = completedItems;
    if (note !== undefined) task.note = note;
    
    await task.save();

    res.json(task);
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

module.exports = {
  createTask,
  updateTaskProgress,
  getUserTasks,
  deleteTask
};
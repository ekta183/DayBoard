const express = require('express');
const { createTask, updateTaskProgress, getUserTasks, deleteTask } = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createTask);
router.get('/', auth, getUserTasks);
router.put('/:taskId/progress', auth, updateTaskProgress);
router.delete('/:taskId', auth, deleteTask);

module.exports = router;
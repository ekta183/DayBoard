const express = require('express');
const { createTask, updateTask, getUserTasks, deleteTask } = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createTask);
router.get('/', auth, getUserTasks);
router.put('/:taskId', auth, updateTask);
router.delete('/:taskId', auth, deleteTask);

module.exports = router;
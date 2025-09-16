const express = require('express');
const { createTask, updateTask, getUserTasks, deleteTask, getPublicUserTasks } = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createTask);
router.get('/', auth, getUserTasks);
router.get('/public/:userId', getPublicUserTasks);
router.put('/:taskId', auth, updateTask);
router.delete('/:taskId', auth, deleteTask);

module.exports = router;
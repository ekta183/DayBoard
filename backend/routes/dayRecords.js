const express = require('express');
const { 
  endDay, 
  getDayRecord, 
  getUserCalendar, 
  getPublicUserCalendar, 
  getAllUsers 
} = require('../controllers/dayRecordController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/end-day', auth, endDay);
router.get('/day/:date', auth, getDayRecord);
router.get('/calendar', auth, getUserCalendar);
router.get('/public/:userId/calendar', getPublicUserCalendar);
router.get('/users', getAllUsers);

module.exports = router;
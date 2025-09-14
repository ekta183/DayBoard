const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dayboard');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const dayRecordRoutes = require('./routes/dayRecords');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/day-records', dayRecordRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'DayBoard API Server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
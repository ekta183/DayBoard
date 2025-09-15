import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import AddTaskForm from '../components/AddTaskForm';
import { Task, DayRecord } from '../types';

// Utility function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [dayRecord, setDayRecord] = useState<DayRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [endDayLoading, setEndDayLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchDayRecord();
  }, [selectedDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.tasks.getByDate(selectedDate);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayRecord = async () => {
    try {
      const data = await api.dayRecords.getDay(selectedDate);
      setDayRecord(data);
    } catch (error) {
      if (error instanceof Error && error.message !== 'Day record not found') {
        console.error('Error fetching day record:', error);
      }
    }
  };

  const handleAddTask = async (taskData: { title: string; description: string; totalItems: number; date: string }) => {
    try {
      await api.tasks.create(taskData);
      fetchTasks();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateProgress = async (taskId: string, progressData: { completedItems: number; note: string }) => {
    try {
      await api.tasks.updateProgress(taskId, progressData);
      fetchTasks();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.tasks.delete(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEndDay = async () => {
    if (!window.confirm('Are you sure you want to end this day? This action is irreversible!')) {
      return;
    }

    setEndDayLoading(true);
    try {
      await api.dayRecords.endDay({
        date: selectedDate,
        summary: ''
      });
      
      // After ending the day, automatically move to the next day
      const currentDate = new Date(selectedDate);
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayString = formatDateLocal(nextDay);
      
      // Clear the current day record state first
      setDayRecord(null);
      
      // Set the next day as selected date
      setSelectedDate(nextDayString);
      
      // The useEffect will automatically fetch new data for the next day
    } catch (error) {
      console.error('Error ending day:', error);
      alert('Error ending day: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setEndDayLoading(false);
    }
  };

  const isToday = selectedDate === formatDateLocal(new Date());
  const isEndedDay = dayRecord?.isEnded;

  const getProductivityStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const totalCompletion = tasks.reduce((acc, task) => acc + task.completionPercentage, 0);
    const avgCompletion = totalTasks > 0 ? Math.round(totalCompletion / totalTasks) : 0;

    return { totalTasks, completedTasks, avgCompletion };
  };

  const stats = getProductivityStats();

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-text-primary">My Dashboard</h1>
            
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setDayRecord(null); // Clear day record when changing dates
                  setSelectedDate(e.target.value);
                }}
                className="px-3 py-2 bg-bg-secondary border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              
              {isToday && !isEndedDay && tasks.length > 0 && (
                <button
                  onClick={handleEndDay}
                  disabled={endDayLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                >
                  {endDayLoading ? 'Ending Day...' : 'End Day'}
                </button>
              )}
            </div>
          </div>

          {isEndedDay && (
            <div className="bg-bg-secondary border-l-4 border-productive p-4 rounded mb-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Day Completed - {dayRecord.productivityLabel}
                  </h3>
                  <p className="text-text-secondary">
                    Overall Productivity: {dayRecord.overallProductivity}% 
                    ({dayRecord.completedTasks}/{dayRecord.totalTasks} tasks completed)
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    Ended at {dayRecord.endedAt ? new Date(dayRecord.endedAt).toLocaleTimeString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <h3 className="text-text-secondary text-sm font-medium">Total Tasks</h3>
              <p className="text-2xl font-bold text-text-primary">{stats.totalTasks}</p>
            </div>
            
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <h3 className="text-text-secondary text-sm font-medium">Completed</h3>
              <p className="text-2xl font-bold text-productive">{stats.completedTasks}</p>
            </div>
            
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <h3 className="text-text-secondary text-sm font-medium">Avg Progress</h3>
              <p className="text-2xl font-bold text-text-primary">{stats.avgCompletion}%</p>
            </div>
          </div>
        </div>

        <AddTaskForm 
          onAddTask={handleAddTask}
          selectedDate={selectedDate}
          isEndedDay={!!isEndedDay}
        />

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-text-secondary">Loading tasks...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-text-secondary">
                {isEndedDay ? 'No tasks for this day' : 'No tasks yet. Add your first task!'}
              </div>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdateProgress={handleUpdateProgress}
                onDelete={handleDeleteTask}
                isEndedDay={!!isEndedDay}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import AddTaskForm from '../components/AddTaskForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [showEndDayModal, setShowEndDayModal] = useState(false);

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

  const handleUpdateTask = async (taskId: string, taskData: { title?: string; description?: string; totalItems?: number; completedItems?: number; note?: string }) => {
    try {
      await api.tasks.update(taskId, taskData);
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

  const handleEndDayClick = () => {
    setShowEndDayModal(true);
  };

  const handleEndDayConfirm = async () => {
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

      // Close the modal
      setShowEndDayModal(false);

      // The useEffect will automatically fetch new data for the next day
    } catch (error) {
      console.error('Error ending day:', error);
      alert('Error ending day: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setEndDayLoading(false);
    }
  };

  const handleEndDayCancel = () => {
    setShowEndDayModal(false);
  };

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayString = formatDateLocal(previousDay);

    setDayRecord(null); // Clear current day record
    setSelectedDate(previousDayString);
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayString = formatDateLocal(nextDay);

    setDayRecord(null); // Clear current day record
    setSelectedDate(nextDayString);
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
      <div className="max-w-4xl mx-auto" style={{ padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h1 className="text-text-primary" style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              margin: 0
            }}>My Dashboard</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Day Navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '0.25rem'
              }}>
                <button
                  onClick={handlePreviousDay}
                  className="btn btn-ghost"
                  style={{
                    padding: '0.5rem',
                    minWidth: 'auto',
                    borderRadius: '0.5rem'
                  }}
                  title="Previous Day"
                >
                  <ChevronLeft size={20} />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setDayRecord(null); // Clear day record when changing dates
                    setSelectedDate(e.target.value);
                  }}
                  style={{
                    minWidth: '160px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    background: 'transparent',
                    color: '#ffffff',
                    textAlign: 'center',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    outline: 'none',
                    colorScheme: 'dark',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                />

                <button
                  onClick={handleNextDay}
                  className="btn btn-ghost"
                  style={{
                    padding: '0.5rem',
                    minWidth: 'auto',
                    borderRadius: '0.5rem'
                  }}
                  title="Next Day"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {!isEndedDay && tasks.length > 0 && (
                <button
                  onClick={handleEndDayClick}
                  disabled={endDayLoading}
                  className="btn btn-danger"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    padding: '0.75rem 1.5rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  End Day
                </button>
              )}
            </div>
          </div>

          {isEndedDay && (
            <div className="bg-bg-secondary" style={{
              borderLeft: '4px solid #10b981',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="text-text-primary" style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Day Completed - {dayRecord.productivityLabel}
                  </h3>
                  <p className="text-text-secondary">
                    Overall Productivity: {dayRecord.overallProductivity}%
                    ({dayRecord.completedTasks}/{dayRecord.totalTasks} tasks completed)
                  </p>
                  <p className="text-text-muted" style={{
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    Ended at {dayRecord.endedAt ? new Date(dayRecord.endedAt).toLocaleTimeString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="bg-bg-secondary" style={{
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h3 className="text-text-secondary" style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                margin: 0
              }}>Total Tasks</h3>
              <p className="text-text-primary" style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>{stats.totalTasks}</p>
            </div>

            <div className="bg-bg-secondary" style={{
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h3 className="text-text-secondary" style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                margin: 0
              }}>Completed</h3>
              <p className="text-productive" style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>{stats.completedTasks}</p>
            </div>

            <div className="bg-bg-secondary" style={{
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h3 className="text-text-secondary" style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                margin: 0
              }}>Avg Progress</h3>
              <p className="text-text-primary" style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>{stats.avgCompletion}%</p>
            </div>
          </div>
        </div>

        <AddTaskForm 
          onAddTask={handleAddTask}
          selectedDate={selectedDate}
          isEndedDay={!!isEndedDay}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <div className="text-text-secondary">Loading tasks...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <div className="text-text-secondary">
                {isEndedDay ? 'No tasks for this day' : 'No tasks yet. Add your first task!'}
              </div>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdateTask={handleUpdateTask}
                onDelete={handleDeleteTask}
                isEndedDay={!!isEndedDay}
              />
            ))
          )}
        </div>
      </div>

      {/* End Day Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEndDayModal}
        onClose={handleEndDayCancel}
        onConfirm={handleEndDayConfirm}
        title="End This Day"
        message="Are you sure you want to end this day? This action is irreversible and will finalize your productivity record for today. You'll automatically be moved to the next day."
        confirmText="End Day"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={endDayLoading}
      />
    </div>
  );
};

export default Dashboard;
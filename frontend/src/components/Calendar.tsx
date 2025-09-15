import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DayRecord, Task } from '../types';

// Utility function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface CalendarProps {
  userId?: string | null;
  username?: string | null;
}

const Calendar: React.FC<CalendarProps> = ({ userId = null, username = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayRecords, setDayRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, userId]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      let data;
      if (userId) {
        data = await api.dayRecords.getPublicCalendar(userId, month, year);
        setDayRecords(data.dayRecords);
      } else {
        data = await api.dayRecords.getCalendar(month, year);
        setDayRecords(data);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForDate = async (date: Date) => {
    setTasksLoading(true);
    try {
      const dateString = formatDateLocal(date);
      const tasks = await api.tasks.getByDate(dateString);
      setSelectedDayTasks(tasks);
      setSelectedDate(date);
      setShowTaskModal(true);
    } catch (error) {
      console.error('Error fetching tasks for date:', error);
      setSelectedDayTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleDayClick = (date: Date) => {
    if (isCurrentMonth(date)) {
      fetchTasksForDate(date);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getDayRecord = (date: Date): DayRecord | undefined => {
    return dayRecords.find(record => {
      const recordDate = new Date(record.date).toDateString();
      return recordDate === date.toDateString();
    });
  };

  const getProductivityColor = (record: DayRecord | undefined): string => {
    if (!record) return 'bg-bg-tertiary';
    
    if (record.overallProductivity >= 80) return 'bg-productive';
    if (record.overallProductivity >= 50) return 'bg-moderate';
    return 'bg-not-productive';
  };

  const getProductivityTextColor = (record: DayRecord | undefined): string => {
    if (!record) return 'text-text-muted';
    
    if (record.overallProductivity >= 80) return 'text-productive-bg';
    if (record.overallProductivity >= 50) return 'text-moderate-bg';
    return 'text-not-productive-bg';
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-bg-secondary border border-border-color rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">
          {username ? `${username}'s Calendar` : 'My Calendar'}
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-bg-tertiary rounded-lg text-text-primary"
          >
            ←
          </button>
          
          <span className="text-lg font-semibold text-text-primary min-w-[200px] text-center">
            {formatMonthYear()}
          </span>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-bg-tertiary rounded-lg text-text-primary"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-text-secondary">Loading calendar...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center font-medium text-text-secondary">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const record = getDayRecord(date);
              const productivityColor = getProductivityColor(record);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(date)}
                  className={`
                    relative p-2 min-h-[60px] border border-border-color rounded-lg cursor-pointer
                    transition-all duration-300 hover:scale-105 hover:shadow-lg
                    ${isCurrentMonth(date) ? 'calendar-day-selectable bg-bg-primary' : 'bg-bg-tertiary opacity-50 cursor-not-allowed'}
                    ${isToday(date) ? 'ring-2 ring-accent' : ''}
                    ${selectedDate && date.toDateString() === selectedDate.toDateString() 
                      ? 'calendar-day-selected ring-2 ring-purple-500' 
                      : isCurrentMonth(date) ? 'hover:calendar-day-hover hover:ring-2 hover:ring-purple-400' : ''
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`
                      text-sm font-medium
                      ${isCurrentMonth(date) ? 'text-text-primary' : 'text-text-muted'}
                    `}>
                      {date.getDate()}
                    </span>
                    
                    {record && (
                      <div 
                        className={`w-3 h-3 rounded-full ${productivityColor}`}
                        title={`${record.productivityLabel} - ${record.overallProductivity}%`}
                      ></div>
                    )}
                  </div>
                  
                  {record && (
                    <div className="mt-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-bold text-center ${productivityColor} ${getProductivityTextColor(record)}`}>
                        {record.overallProductivity}%
                      </div>
                    </div>
                  )}
                  
                  {/* Task indicator for days with tasks */}
                  {isCurrentMonth(date) && (
                    <div className="absolute bottom-1 right-1">
                      <div className="w-2 h-2 bg-accent rounded-full opacity-60"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-productive"></div>
                <div className="px-3 py-1 rounded-full bg-productive text-productive-bg text-xs font-bold">
                  80%+
                </div>
                <span className="text-text-secondary">High Productivity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-moderate"></div>
                <div className="px-3 py-1 rounded-full bg-moderate text-moderate-bg text-xs font-bold">
                  50-79%
                </div>
                <span className="text-text-secondary">Moderate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-not-productive"></div>
                <div className="px-3 py-1 rounded-full bg-not-productive text-not-productive-bg text-xs font-bold">
                  0-49%
                </div>
                <span className="text-text-secondary">Low</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-text-muted">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Days with tasks</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 ring-2 ring-purple-400"></div>
                <span>Click on any day to view tasks and progress details</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-border-secondary">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-text-primary">
                  Tasks for {selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-text-muted hover:text-text-primary text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-text-secondary">Loading tasks...</span>
                </div>
              ) : selectedDayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">No tasks found</h4>
                  <p className="text-text-muted">No tasks were created for this day.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayTasks.map((task) => (
                    <div key={task._id} className="bg-bg-tertiary rounded-lg p-4 border border-border-secondary">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-text-primary mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-text-muted text-sm mb-2">{task.description}</p>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getProductivityColor({ overallProductivity: task.completionPercentage } as DayRecord)} text-white`}>
                          {task.completionPercentage}%
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-text-muted">
                          <span>Progress</span>
                          <span>{task.completedItems} of {task.totalItems} items</span>
                        </div>
                        
                        <div className="w-full bg-bg-quaternary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProductivityColor({ overallProductivity: task.completionPercentage } as DayRecord)}`}
                            style={{ width: `${task.completionPercentage}%` }}
                          ></div>
                        </div>
                        
                        {task.note && (
                          <div className="mt-3 p-3 bg-bg-quaternary rounded-lg">
                            <p className="text-xs font-medium text-accent mb-1">Note</p>
                            <p className="text-text-secondary text-sm">{task.note}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-text-subtle">
                          <span>Status: {task.isCompleted ? '✅ Completed' : '⏳ In Progress'}</span>
                          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary Stats */}
                  <div className="mt-6 p-4 bg-bg-tertiary rounded-lg border border-border-secondary">
                    <h4 className="text-lg font-semibold text-text-primary mb-3">Day Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted">Total Tasks:</span>
                        <span className="ml-2 font-semibold text-text-primary">{selectedDayTasks.length}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Completed:</span>
                        <span className="ml-2 font-semibold text-productive">{selectedDayTasks.filter(t => t.isCompleted).length}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">In Progress:</span>
                        <span className="ml-2 font-semibold text-moderate">{selectedDayTasks.filter(t => !t.isCompleted).length}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Avg. Progress:</span>
                        <span className="ml-2 font-semibold text-text-primary">
                          {Math.round(selectedDayTasks.reduce((acc, task) => acc + task.completionPercentage, 0) / selectedDayTasks.length)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
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
      let tasks;

      if (userId) {
        // Viewing someone else's calendar - fetch their tasks
        tasks = await api.tasks.getPublicByDate(userId, dateString);
      } else {
        // Viewing own calendar - fetch own tasks
        tasks = await api.tasks.getByDate(dateString);
      }

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
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#ffffff'
        }}>
          {username ? `${username}'s Calendar` : 'My Calendar'}
        </h2>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #262626 0%, #333333 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ←
          </button>
          
          <span style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#ffffff',
            minWidth: '200px',
            textAlign: 'center'
          }}>
            {formatMonthYear()}
          </span>
          
          <button
            onClick={() => navigateMonth(1)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #262626 0%, #333333 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem 0'
        }}>
          <div style={{ color: '#e5e5e5' }}>Loading calendar...</div>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            {weekDays.map(day => (
              <div key={day} style={{
                padding: '0.5rem',
                textAlign: 'center',
                fontWeight: '500',
                color: '#e5e5e5'
              }}>
                {day}
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '0.25rem'
          }}>
            {days.map((date, index) => {
              const record = getDayRecord(date);
              const productivityColor = getProductivityColor(record);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(date)}
                  style={{
                    position: 'relative',
                    padding: '0.5rem',
                    minHeight: '60px',
                    border: '1px solid #404040',
                    borderRadius: '0.5rem',
                    cursor: isCurrentMonth(date) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    background: isCurrentMonth(date)
                      ? (selectedDate && date.toDateString() === selectedDate.toDateString()
                          ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)'
                          : 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)')
                      : 'linear-gradient(135deg, #262626 0%, #333333 100%)',
                    opacity: isCurrentMonth(date) ? 1 : 0.5,
                    borderColor: isToday(date)
                      ? '#6366f1'
                      : (selectedDate && date.toDateString() === selectedDate.toDateString()
                          ? 'rgba(147, 51, 234, 0.5)'
                          : '#404040'),
                    boxShadow: selectedDate && date.toDateString() === selectedDate.toDateString()
                      ? '0 4px 20px rgba(147, 51, 234, 0.2)'
                      : (isToday(date) ? '0 0 0 2px #6366f1' : 'none')
                  }}
                  onMouseEnter={(e) => {
                    if (isCurrentMonth(date) && (!selectedDate || date.toDateString() !== selectedDate.toDateString())) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isCurrentMonth(date) && (!selectedDate || date.toDateString() !== selectedDate.toDateString())) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)';
                      e.currentTarget.style.borderColor = isToday(date) ? '#6366f1' : '#404040';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: isCurrentMonth(date) ? '#ffffff' : '#a3a3a3'
                    }}>
                      {date.getDate()}
                    </span>
                    
                    {record && (
                      <div
                        style={{
                          width: '0.75rem',
                          height: '0.75rem',
                          borderRadius: '50%',
                          background: record.overallProductivity >= 80
                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                            : record.overallProductivity >= 50
                            ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                          boxShadow: record.overallProductivity >= 80
                            ? '0 4px 15px rgba(5, 150, 105, 0.4)'
                            : record.overallProductivity >= 50
                            ? '0 4px 15px rgba(217, 119, 6, 0.4)'
                            : '0 4px 15px rgba(220, 38, 38, 0.4)'
                        }}
                        title={`${record.productivityLabel} - ${record.overallProductivity}%`}
                      ></div>
                    )}
                  </div>
                  
                  {record && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#ffffff',
                        background: record.overallProductivity >= 80
                          ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                          : record.overallProductivity >= 50
                          ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        boxShadow: record.overallProductivity >= 80
                          ? '0 4px 15px rgba(5, 150, 105, 0.4)'
                          : record.overallProductivity >= 50
                          ? '0 4px 15px rgba(217, 119, 6, 0.4)'
                          : '0 4px 15px rgba(220, 38, 38, 0.4)'
                      }}>
                        {record.overallProductivity}%
                      </div>
                    </div>
                  )}
                  
                  {/* Task indicator for days with tasks */}
                  {isCurrentMonth(date) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0.25rem',
                      right: '0.25rem'
                    }}>
                      <div style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        borderRadius: '50%',
                        opacity: 0.6
                      }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  boxShadow: '0 4px 15px rgba(5, 150, 105, 0.4)'
                }}></div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  80%+
                </div>
                <span style={{ color: '#e5e5e5' }}>High Productivity</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)'
                }}></div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  50-79%
                </div>
                <span style={{ color: '#e5e5e5' }}>Moderate</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
                }}></div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  0-49%
                </div>
                <span style={{ color: '#e5e5e5' }}>Low</span>
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#a3a3a3'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '50%'
                }}></div>
                <span>Days with tasks</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  background: '#8b5cf6',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.4)'
                }}></div>
                <span>Click on any day to view tasks and progress details</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
            borderRadius: '0.5rem',
            maxWidth: '42rem',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #525252'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#ffffff'
                }}>
                  Tasks for {selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  style={{
                    color: '#a3a3a3',
                    fontSize: '1.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a3a3a3';
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{
              padding: '1.5rem',
              overflowY: 'auto',
              maxHeight: '60vh'
            }}>
              {tasksLoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem 0'
                }}>
                  <div className="loading-spinner"></div>
                  <span style={{
                    marginLeft: '0.5rem',
                    color: '#e5e5e5'
                  }}>Loading tasks...</span>
                </div>
              ) : selectedDayTasks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 0'
                }}>
                  <div style={{
                    fontSize: '2.25rem',
                    marginBottom: '1rem'
                  }}>📝</div>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '0.5rem'
                  }}>No tasks found</h4>
                  <p style={{ color: '#a3a3a3' }}>No tasks were created for this day.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Summary Stats */}
                  <div style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #262626 0%, #333333 100%)',
                    borderRadius: '0.5rem',
                    border: '1px solid #525252'
                  }}>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.75rem'
                    }}>Day Summary</h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <span style={{ color: '#a3a3a3' }}>Total Tasks:</span>
                        <span style={{
                          marginLeft: '0.5rem',
                          fontWeight: '600',
                          color: '#ffffff'
                        }}>{selectedDayTasks.length}</span>
                      </div>
                      <div>
                        <span style={{ color: '#a3a3a3' }}>Completed:</span>
                        <span style={{
                          marginLeft: '0.5rem',
                          fontWeight: '600',
                          color: '#059669'
                        }}>{selectedDayTasks.filter(t => t.isCompleted).length}</span>
                      </div>
                      <div>
                        <span style={{ color: '#a3a3a3' }}>
                          {selectedDate && selectedDate.toDateString() < new Date().toDateString() ? 'Incomplete:' : 'In Progress:'}
                        </span>
                        <span style={{
                          marginLeft: '0.5rem',
                          fontWeight: '600',
                          color: selectedDate && selectedDate.toDateString() < new Date().toDateString() ? '#dc2626' : '#d97706'
                        }}>{selectedDayTasks.filter(t => !t.isCompleted).length}</span>
                      </div>
                      <div>
                        <span style={{ color: '#a3a3a3' }}>Avg. Progress:</span>
                        <span style={{
                          marginLeft: '0.5rem',
                          fontWeight: '600',
                          color: '#ffffff'
                        }}>
                          {Math.round(selectedDayTasks.reduce((acc, task) => acc + task.completionPercentage, 0) / selectedDayTasks.length)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedDayTasks.map((task) => (
                    <div key={task._id} style={{
                      background: 'linear-gradient(135deg, #262626 0%, #333333 100%)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      border: '1px solid #525252'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '0.25rem'
                          }}>{task.title}</h4>
                          {task.description && (
                            <p style={{
                              color: '#a3a3a3',
                              fontSize: '0.875rem',
                              marginBottom: '0.5rem'
                            }}>{task.description}</p>
                          )}
                        </div>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: '#ffffff',
                          background: task.completionPercentage >= 80
                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                            : task.completionPercentage >= 50
                            ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                        }}>
                          {task.completionPercentage}%
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.875rem',
                          color: '#a3a3a3'
                        }}>
                          <span>Progress</span>
                          <span>{task.completedItems} of {task.totalItems} items</span>
                        </div>
                        
                        <div style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
                          borderRadius: '9999px',
                          height: '0.5rem'
                        }}>
                          <div
                            style={{
                              height: '0.5rem',
                              borderRadius: '9999px',
                              transition: 'width 0.3s ease',
                              width: `${task.completionPercentage}%`,
                              background: task.completionPercentage >= 80
                                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                : task.completionPercentage >= 50
                                ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                            }}
                          ></div>
                        </div>
                        
                        {task.note && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
                            borderRadius: '0.5rem'
                          }}>
                            <p style={{
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: '#6366f1',
                              marginBottom: '0.25rem'
                            }}>Note</p>
                            <p style={{
                              color: '#e5e5e5',
                              fontSize: '0.875rem'
                            }}>{task.note}</p>
                          </div>
                        )}
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: '#737373'
                        }}>
                          <span>Status: {task.isCompleted ? '✅ Completed' : (selectedDate && selectedDate.toDateString() < new Date().toDateString() ? '❌ Incomplete' : '⏳ In Progress')}</span>
                          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
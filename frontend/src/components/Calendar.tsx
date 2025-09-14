import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DayRecord } from '../types';

interface CalendarProps {
  userId?: string | null;
  username?: string | null;
}

const Calendar: React.FC<CalendarProps> = ({ userId = null, username = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayRecords, setDayRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(false);

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
                  className={`
                    relative p-2 min-h-[60px] border border-border-color rounded-lg
                    ${isCurrentMonth(date) ? 'bg-bg-primary' : 'bg-bg-tertiary opacity-50'}
                    ${isToday(date) ? 'ring-2 ring-accent' : ''}
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
                    <div className="mt-1">
                      <div className="text-xs text-text-muted">
                        {record.completedTasks}/{record.totalTasks} tasks
                      </div>
                      <div className="text-xs font-medium text-text-secondary">
                        {record.overallProductivity}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-productive"></div>
              <span className="text-text-secondary">Productive (80%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-moderate"></div>
              <span className="text-text-secondary">Moderate (50-79%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-not-productive"></div>
              <span className="text-text-secondary">Low (0-49%)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
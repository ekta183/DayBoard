import React from 'react';
import Calendar from '../components/Calendar';

const MyCalendar = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            My Calendar
          </h1>
          <p className="text-text-secondary">
            View your productivity calendar and track your daily progress
          </p>
        </div>

        <Calendar />
      </div>
    </div>
  );
};

export default MyCalendar;
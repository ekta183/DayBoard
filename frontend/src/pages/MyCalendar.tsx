import React from 'react';
import Calendar from '../components/Calendar';

const MyCalendar = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '2rem 1rem',
        position: 'relative'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '0.5rem'
          }}>
            My Calendar
          </h1>
          <p style={{ color: '#e5e5e5' }}>
            View your productivity calendar and track your daily progress
          </p>
        </div>

        <Calendar />
      </div>
    </div>
  );
};

export default MyCalendar;
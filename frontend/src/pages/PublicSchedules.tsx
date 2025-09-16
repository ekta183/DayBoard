import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Calendar from '../components/Calendar';
import { User } from '../types';

const PublicSchedules = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.dayRecords.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
      }}>
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '2rem 1rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={handleBackToList}
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #262626 0%, #333333 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)';
              }}
            >
              ← Back to Users
            </button>
          </div>

          <Calendar
            userId={selectedUser._id}
            username={selectedUser.username}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
    }}>
      <div style={{
        maxWidth: '64rem',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '0.5rem'
          }}>
            Public Schedules
          </h1>
          <p style={{
            color: '#a3a3a3',
            fontSize: '1rem'
          }}>
            View other users' productivity calendars and schedules
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 0'
          }}>
            <div style={{ color: '#a3a3a3' }}>Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 0'
          }}>
            <div style={{ color: '#a3a3a3' }}>
              No public users found
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {users.map(user => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #262626 0%, #333333 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.5rem'
                    }}>
                      {user.username}
                    </h3>
                    <p style={{
                      color: '#a3a3a3',
                      fontSize: '0.875rem'
                    }}>
                      Click to view calendar
                    </p>
                  </div>
                  <div style={{
                    color: '#8b5cf6',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSchedules;
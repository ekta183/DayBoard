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
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="bg-bg-secondary hover:bg-bg-tertiary text-text-primary px-4 py-2 rounded-lg font-medium transition-colors mb-4"
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
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Public Schedules
          </h1>
          <p className="text-text-secondary">
            View other users' productivity calendars and schedules
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-text-secondary">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-secondary">
              No public users found
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className="bg-bg-secondary border border-border-color rounded-lg p-6 hover:bg-bg-tertiary cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {user.username}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Click to view calendar
                    </p>
                  </div>
                  <div className="text-accent text-xl">
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
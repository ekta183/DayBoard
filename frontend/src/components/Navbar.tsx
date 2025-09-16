import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="max-w-6xl mx-auto" style={{ padding: '0 1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '3rem',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}>
              <svg style={{
                width: '1.25rem',
                height: '1.25rem',
                color: 'white'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="gradient-text" style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0
            }}>
              DayBoard
            </h1>
          </div>

          {/* Navigation Links */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flex: 1,
              justifyContent: 'center'
            }}>
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/calendar"
                className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}
              >
                My Calendar
              </Link>
              <Link
                to="/public-schedules"
                className={`nav-link ${location.pathname === '/public-schedules' ? 'active' : ''}`}
              >
                Public Schedules
              </Link>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            {user && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-text-primary" style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {user.username}
                    </p>
                    <p className="text-text-muted" style={{
                      fontSize: '0.75rem',
                      margin: 0
                    }}>
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="btn btn-danger"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <svg style={{
                    width: '1rem',
                    height: '1rem'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
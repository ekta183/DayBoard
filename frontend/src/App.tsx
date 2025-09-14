import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyCalendar from './pages/MyCalendar';
import PublicSchedules from './pages/PublicSchedules';

const AppNavigation = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-bg-secondary border-b border-border-color">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8 py-4">
          <Link 
            to="/dashboard" 
            className="text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/calendar" 
            className="text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            My Calendar
          </Link>
          <Link 
            to="/public-schedules" 
            className="text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            Public Schedules
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-primary">
          <Navbar />
          <AppNavigation />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute>
                <MyCalendar />
              </ProtectedRoute>
            } />
            
            <Route path="/public-schedules" element={
              <ProtectedRoute>
                <PublicSchedules />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

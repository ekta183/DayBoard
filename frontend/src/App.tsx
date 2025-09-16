import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyCalendar from './pages/MyCalendar';
import PublicSchedules from './pages/PublicSchedules';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-bg-primary">
          <Navbar />

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

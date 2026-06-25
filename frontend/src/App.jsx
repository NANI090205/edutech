import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MyEnrolments from './pages/MyEnrolments';
import AdminDashboard from './pages/AdminDashboard';
import ManageCourses from './pages/ManageCourses';
import ManageStudents from './pages/ManageStudents';
import Profile from './pages/Profile';
import CourseDetail from './pages/CourseDetail';
import './App.css';

// Route protection component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

// Root Router Redirection
const HomeRedirect = () => {
  const { user, token } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
};

const App = () => {
  return (
    <ThemeProvider>
    <div className="d-flex flex-column min-vh-100 bg-slate-900 text-light">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enrolments"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <MyEnrolments />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-courses"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <ManageCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-students"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <ManageStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <CourseDetail />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer-glass mt-auto">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            {/* Brand */}
            <div className="d-flex align-items-center gap-2">
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
              }}>🎓</div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>EduManager</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                © {new Date().getFullYear()}
              </span>
            </div>
            {/* Tech stack badges */}
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {[
                { label: 'Spring Boot', emoji: '☕' },
                { label: 'React 18', emoji: '⚛️' },
                { label: 'MySQL', emoji: '🗄️' },
                { label: 'JWT Auth', emoji: '🔐' },
              ].map(({ label, emoji }) => (
                <span key={label} className="tech-badge">{emoji} {label}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
    </ThemeProvider>
  );
};

export default App;

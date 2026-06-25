import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../api/axiosConfig';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Glassmorphism scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 20) {
          navRef.current.classList.add('scrolled');
        } else {
          navRef.current.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, location.pathname]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/api/notifications');
      setNotifications(response.data.slice(0, 10)); // keep last 10
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axiosInstance.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <nav ref={navRef} className="navbar navbar-expand-lg navbar-glass py-0" style={{ position: 'sticky', top: 0, zIndex: 999 }}>
      <div className="container py-3">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
          }}>
            🎓
          </div>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.05rem',
            background: 'linear-gradient(120deg, #60a5fa, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em',
          }}>
            EduManager
          </span>
        </Link>

        {/* Mobile toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Nav links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 mt-3 mt-lg-0">
            {isStudent() && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                    Browse Courses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/enrolments') ? 'active' : ''}`} to="/enrolments">
                    My Enrolments
                  </Link>
                </li>
              </>
            )}
            {isAdmin() && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/admin') ? 'active' : ''}`} to="/admin">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/manage-courses') ? 'active' : ''}`} to="/manage-courses">
                    Courses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/manage-students') ? 'active' : ''}`} to="/manage-students">
                    Students
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Right side controls */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-glass"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                fontSize: '1.05rem',
              }}
              title={`Toggle to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {user ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="position-relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="btn btn-glass"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      fontSize: '1.05rem',
                      position: 'relative',
                    }}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span
                        className="position-absolute translate-middle badge rounded-pill bg-danger"
                        style={{
                          top: '10%',
                          left: '85%',
                          fontSize: '0.62rem',
                          padding: '0.25em 0.5em',
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {showNotifications && (
                    <div
                      className="card bg-slate-800 border-secondary border-opacity-20 text-light shadow-2xl p-0 position-absolute end-0 mt-2 rounded-4"
                      style={{
                        width: '320px',
                        zIndex: 1000,
                        backdropFilter: 'blur(16px)',
                        background: 'rgba(23, 32, 54, 0.95)',
                      }}
                    >
                      <div className="card-header bg-transparent border-secondary border-opacity-10 py-3 px-3 d-flex justify-content-between align-items-center">
                        <span className="fw-bold small text-uppercase tracking-wider">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="btn btn-link text-decoration-none p-0 text-primary small"
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '280px' }}>
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-muted small">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                              className={`list-group-item bg-transparent text-light border-secondary border-opacity-10 py-2.5 px-3 ${
                                !notif.isRead ? 'bg-slate-700 bg-opacity-20' : ''
                              }`}
                              style={{
                                cursor: !notif.isRead ? 'pointer' : 'default',
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start gap-1">
                                <span className={`small ${!notif.isRead ? 'fw-bold' : ''}`} style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                                  {notif.message}
                                </span>
                                {!notif.isRead && (
                                  <span
                                    className="bg-primary rounded-circle mt-1.5"
                                    style={{ width: '6px', height: '6px', flexShrink: 0 }}
                                  />
                                )}
                              </div>
                              <span className="text-muted d-block mt-1" style={{ fontSize: '0.65rem' }}>
                                {formatNotifTime(notif.createdAt)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar + user info */}
                <Link to="/profile" className="d-flex align-items-center gap-2 text-decoration-none" style={{ cursor: 'pointer' }}>
                  <div className="avatar-circle" style={{ overflow: 'hidden' }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="d-none d-sm-flex flex-column">
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {user.name}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: user.role === 'ADMIN' ? 'var(--purple-400)' : 'var(--blue-400)',
                    }}>
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  className="btn btn-danger-glass"
                  onClick={handleLogout}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-glass" to="/login" style={{ fontSize: '0.85rem', padding: '0.45rem 1.1rem' }}>
                  Sign In
                </Link>
                <Link className="btn btn-glow-blue" to="/register" style={{ fontSize: '0.85rem' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

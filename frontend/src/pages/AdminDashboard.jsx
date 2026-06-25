import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Animated counter hook
const useCountUp = (target, duration = 1200, shouldStart = true) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart || target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
};

const StatCard = ({ icon, label, value, linkTo, linkLabel, colorClass, accentClass }) => {
  const count = useCountUp(value, 1000, value > 0);
  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {label}
          </p>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '2.5rem', lineHeight: 1,
            background: accentClass,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {count}
          </h2>
        </div>
        <div className={`icon-box ${colorClass === 'blue' ? 'icon-blue' : colorClass === 'purple' ? 'icon-purple' : 'icon-emerald'}`}
          style={{ fontSize: '1.4rem' }}>
          {icon}
        </div>
      </div>
      {linkTo ? (
        <Link to={linkTo} style={{ color: 'var(--blue-400)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
          {linkLabel} <span>→</span>
        </Link>
      ) : (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{linkLabel}</span>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalEnrolments: 0 });
  const [analytics, setAnalytics] = useState({ monthlyEnrolments: [], popularCourses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          axiosInstance.get('/api/admin/dashboard'),
          axiosInstance.get('/api/admin/analytics')
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics. Please reload the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Prepare chart options & data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          stepSize: 1
        }
      }
    }
  };

  const lineChartData = {
    labels: analytics.monthlyEnrolments.map(item => item.label),
    datasets: [
      {
        label: 'Monthly Enrolments',
        data: analytics.monthlyEnrolments.map(item => item.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#60a5fa',
        pointHoverRadius: 6
      }
    ]
  };

  const barChartData = {
    labels: analytics.popularCourses.map(item =>
      item.courseTitle.length > 18 ? item.courseTitle.substring(0, 16) + '...' : item.courseTitle
    ),
    datasets: [
      {
        label: 'Enrolments',
        data: analytics.popularCourses.map(item => item.enrollCount),
        backgroundColor: 'rgba(168, 85, 247, 0.65)',
        hoverBackgroundColor: 'rgba(168, 85, 247, 0.9)',
        borderRadius: 6,
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="container py-5 text-light">
      {/* Page header */}
      <div className="mb-5 anim-fade-up">
        <p className="section-eyebrow">Overview</p>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: '0.4rem',
          background: 'linear-gradient(120deg, #60a5fa, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Admin Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          System-wide metrics: students, courses, and enrolments at a glance.
        </p>
      </div>

      {error && (
        <div className="alert-glass-danger p-3 mb-4" role="alert">✕ {error}</div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="spinner-glow" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading metrics...</span>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="row g-4 mb-4 anim-stagger">
            <div className="col-12 col-md-4">
              <StatCard
                icon="👥" label="Total Students" value={stats.totalStudents}
                linkTo="/manage-students" linkLabel="View all students"
                colorClass="blue" accentClass="linear-gradient(120deg, #60a5fa, #06b6d4)"
              />
            </div>
            <div className="col-12 col-md-4">
              <StatCard
                icon="📚" label="Total Courses" value={stats.totalCourses}
                linkTo="/manage-courses" linkLabel="Manage courses"
                colorClass="purple" accentClass="linear-gradient(120deg, #c084fc, #60a5fa)"
              />
            </div>
            <div className="col-12 col-md-4">
              <StatCard
                icon="📝" label="Total Enrolments" value={stats.totalEnrolments}
                linkLabel="Active student-course links"
                colorClass="emerald" accentClass="linear-gradient(120deg, #34d399, #06b6d4)"
              />
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="row g-4 mb-4 anim-fade-up">
            <div className="col-12 col-lg-7">
              <div className="glass-card p-4 h-100" style={{ minHeight: '340px' }}>
                <h5 className="fw-bold fs-6 mb-3 text-white">📈 Enrolments Trend Over Time</h5>
                <div style={{ height: '240px', position: 'relative' }}>
                  {analytics.monthlyEnrolments.length === 0 ? (
                    <div className="text-center py-5 text-muted">No monthly enrollment statistics.</div>
                  ) : (
                    <Line options={chartOptions} data={lineChartData} />
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="glass-card p-4 h-100" style={{ minHeight: '340px' }}>
                <h5 className="fw-bold fs-6 mb-3 text-white">📊 Top 5 Popular Courses</h5>
                <div style={{ height: '240px', position: 'relative' }}>
                  {analytics.popularCourses.length === 0 ? (
                    <div className="text-center py-5 text-muted">No course enrollment statistics.</div>
                  ) : (
                    <Bar options={chartOptions} data={barChartData} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-1 mb-4 anim-fade-up">
            <div className="p-4">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Quick Actions
              </h5>
              <div className="row g-3">
                {[
                  {
                    icon: '📚', title: 'Course Management', color: 'blue',
                    desc: 'Add, edit or remove courses from the catalog. Keep curriculum up to date.',
                    link: '/manage-courses', label: 'Open Courses',
                  },
                  {
                    icon: '👥', title: 'Student Tracking', color: 'purple',
                    desc: 'View registered students, their profiles, and enrolled courses.',
                    link: '/manage-students', label: 'Open Students',
                  },
                ].map(({ icon, title, color, desc, link, label }) => (
                  <div className="col-12 col-sm-6" key={title}>
                    <div style={{
                      background: 'var(--bg-800)', border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)', padding: '1.25rem',
                      height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      transition: 'all 0.25s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = color === 'blue' ? 'rgba(59,130,246,0.4)' : 'rgba(168,85,247,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div className={`icon-box-sm icon-${color}`}>{icon}</div>
                          <h6 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{title}</h6>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.6 }}>{desc}</p>
                      </div>
                      <Link to={link} className="btn btn-glow-blue btn-sm"
                        style={color === 'purple' ? {
                          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                          boxShadow: '0 4px 14px rgba(168,85,247,0.3)',
                        } : {}}>
                        {label} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

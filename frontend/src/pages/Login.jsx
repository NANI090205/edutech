import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';

// Floating preview card used in the hero panel
const HeroFeatureCard = ({ icon, title, subtitle, delay = 0 }) => (
  <div className="hero-float-card d-flex align-items-center gap-3 mb-3" style={{ animationDelay: `${delay}s` }}>
    <div className="icon-box-sm icon-blue" style={{ fontSize: '1.1rem' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{subtitle}</div>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', { email: email.trim(), password });
      login(response.data);
      navigate(response.data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh' }}>
      {/* ── Left Hero Panel ─────────────────────────────── */}
      <div className="auth-hero col-lg-6 d-none d-lg-flex">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 440 }}>
          {/* Brand mark */}
          <div className="d-flex align-items-center gap-3 mb-5">
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
            }}>🎓</div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.3rem',
              background: 'linear-gradient(120deg, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>EduManager</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '2.6rem', lineHeight: 1.15,
            marginBottom: '1.25rem', color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}>
            Your Learning<br />
            <span style={{
              background: 'linear-gradient(120deg, #60a5fa, #c084fc, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Journey Starts</span><br />
            Here.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Manage your courses, track enrolments and access your learning dashboard — all in one place.
          </p>

          {/* Feature cards */}
          <HeroFeatureCard icon="📚" title="5+ Curated Courses" subtitle="Expert-led learning tracks" delay={0} />
          <HeroFeatureCard icon="🔐" title="Secure JWT Auth" subtitle="Role-based access control" delay={0.3} />
          <HeroFeatureCard icon="📊" title="Real-time Dashboard" subtitle="Track your progress instantly" delay={0.6} />

          {/* Bottom stats row */}
          <div className="d-flex gap-4 mt-4">
            {[['3+', 'Students'], ['5+', 'Courses'], ['100%', 'Secure']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--blue-400)' }}>{num}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────────── */}
      <div className="auth-form-panel col-12 col-lg-6 anim-fade-in">
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          {/* Mobile brand */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-5">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>🎓</div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--blue-400)' }}>EduManager</span>
          </div>

          <div className="mb-5">
            <p className="section-eyebrow">Welcome back</p>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Sign In
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--blue-400)', textDecoration: 'none', fontWeight: 600 }}>
                Create one free →
              </Link>
            </p>
          </div>

          {/* Alerts */}
          {isExpired && (
            <div className="alert-glass-warning p-3 mb-4" role="alert" style={{ fontSize: '0.875rem' }}>
              ⚠️ Your session expired. Please sign in again.
            </div>
          )}
          {error && (
            <div className="alert-glass-danger p-3 mb-4" role="alert" style={{ fontSize: '0.875rem' }}>
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="login-email" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                className="form-control input-glass"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label htmlFor="login-password" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                id="login-password"
                className="form-control input-glass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-glow-blue w-100" style={{ padding: '0.8rem', fontSize: '0.95rem' }} disabled={loading}>
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" />
                  Signing In...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Hint credentials */}
          <div className="glass-card-strong p-3 mt-4">
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Demo Credentials
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span className="badge-purple me-2">Admin</span> admin@example.com / password
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span className="badge-blue me-2">Student</span> john.doe@example.com / password
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

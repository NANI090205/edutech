import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long'); return; }
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/register', { name: name.trim(), email: email.trim(), password, role });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.validationErrors) {
        setError(Object.values(err.response.data.validationErrors)[0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh' }}>
      {/* ── Left Hero Panel ─────────────────────────────── */}
      <div className="auth-hero col-lg-5 d-none d-lg-flex">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <div className="d-flex align-items-center gap-3 mb-5">
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
            }}>📝</div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.3rem',
              background: 'linear-gradient(120deg, #c084fc, #60a5fa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>EduManager</span>
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '2.4rem', lineHeight: 1.15, marginBottom: '1.25rem',
            color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>
            Join the<br />
            <span style={{
              background: 'linear-gradient(120deg, #c084fc, #60a5fa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Learning</span><br />
            Platform.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Register as a student to browse and enrol in courses, or as an admin to manage the platform.
          </p>

          {/* Role info */}
          <div className="glass-card p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="icon-box-sm icon-blue">👨‍🎓</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Student Account</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Browse & enrol in courses</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box-sm icon-purple">👑</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Admin Account</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Manage courses & students</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────────── */}
      <div className="auth-form-panel col-12 col-lg-7 anim-fade-in" style={{ overflowY: 'auto' }}>
        <div style={{ maxWidth: 480, width: '100%', margin: '0 auto', paddingTop: '1rem', paddingBottom: '2rem' }}>
          {/* Mobile brand */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-5">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>📝</div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--purple-400)' }}>EduManager</span>
          </div>

          <div className="mb-4">
            <p className="section-eyebrow" style={{ color: 'var(--purple-400)' }}>New here?</p>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--blue-400)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in →
              </Link>
            </p>
          </div>

          {error && (
            <div className="alert-glass-danger p-3 mb-4" role="alert" style={{ fontSize: '0.875rem' }}>
              ✕ {error}
            </div>
          )}
          {success && (
            <div className="alert-glass-success p-3 mb-4" role="alert" style={{ fontSize: '0.875rem' }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-3">
              <label htmlFor="reg-name" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input type="text" id="reg-name" className="form-control input-glass"
                placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="reg-email" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input type="email" id="reg-email" className="form-control input-glass"
                placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* Role selector — visual toggle */}
            <div className="mb-3">
              <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Account Type
              </label>
              <div className="d-flex gap-2">
                {['STUDENT', 'ADMIN'].map((r) => (
                  <button key={r} type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: 10, border: '1px solid',
                      borderColor: role === r ? (r === 'STUDENT' ? 'var(--blue-500)' : 'var(--purple-500)') : 'var(--glass-border-strong)',
                      background: role === r
                        ? (r === 'STUDENT' ? 'rgba(59,130,246,0.12)' : 'rgba(168,85,247,0.12)')
                        : 'var(--glass-bg)',
                      color: role === r
                        ? (r === 'STUDENT' ? 'var(--blue-400)' : 'var(--purple-400)')
                        : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}>
                    {r === 'STUDENT' ? '👨‍🎓 Student' : '👑 Admin'}
                  </button>
                ))}
              </div>
            </div>

            {/* Passwords row */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="reg-password" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <input type="password" id="reg-password" className="form-control input-glass"
                  placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="reg-confirm" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Confirm
                </label>
                <input type="password" id="reg-confirm" className="form-control input-glass"
                  placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-glow-blue w-100"
              style={{
                padding: '0.8rem', fontSize: '0.95rem',
                background: role === 'ADMIN'
                  ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                  : undefined,
                boxShadow: role === 'ADMIN' ? '0 4px 16px rgba(168,85,247,0.3)' : undefined,
              }}
              disabled={loading}>
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" />
                  Creating Account...
                </span>
              ) : `Create ${role === 'ADMIN' ? 'Admin' : 'Student'} Account →`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

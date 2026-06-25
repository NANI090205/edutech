import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  // Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Extended Info
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/api/users/profile');
        const data = response.data;
        setName(data.name || '');
        setEmail(data.email || '');
        setProfileImage(data.profileImage || '');
        setMobile(data.mobile || '');
        setAddress(data.address || '');
        setCollege(data.college || '');
        setBranch(data.branch || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setGithubUrl(data.githubUrl || '');
        setBio(data.bio || '');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password && password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password && password.length < 6) { setError('Password must be at least 6 characters long'); return; }
    setUpdating(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        profileImage,
        mobile: mobile.trim(),
        address: address.trim(),
        college: college.trim(),
        branch: branch.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        bio: bio.trim(),
      };
      if (password) payload.password = password;

      const response = await axiosInstance.put('/api/users/profile', payload);
      updateUserProfile({
        name: response.data.name,
        email: response.data.email,
        profileImage: response.data.profileImage,
      });
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = (n) => {
    if (!n) return '?';
    return n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
  };

  const tabStyle = (tab) => ({
    padding: '0.55rem 1.25rem',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.82rem',
    transition: 'all 0.2s ease',
    background: activeTab === tab ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: activeTab === tab ? 'var(--blue-400)' : 'var(--text-secondary)',
    borderBottom: activeTab === tab ? '2px solid var(--blue-400)' : '2px solid transparent',
  });

  const inputLabel = (text) => (
    <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
      {text}
    </label>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ minHeight: '90vh' }}>
      <div className="row justify-content-center">
        <div className="col-xl-11">

          {/* Page Header */}
          <div className="mb-4">
            <p className="section-eyebrow">Account Settings</p>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '2.2rem', marginBottom: '0.25rem' }}>
              My Profile
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Manage your personal information, profile photo, and security credentials
            </p>
          </div>

          <div className="row g-4">

            {/* ── Left Column: Avatar + Quick Info ── */}
            <div className="col-lg-4">
              <div className="glass-card p-4 text-center" style={{ position: 'sticky', top: 90 }}>

                {/* Avatar */}
                <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 1.25rem auto' }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid var(--glass-border-strong)',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}>
                    {profileImage
                      ? <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(name)
                    }
                  </div>
                </div>

                <h4 style={{ fontWeight: 700, marginBottom: '0.2rem', fontSize: '1.1rem' }}>{name || '—'}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{email}</p>
                {college && <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.4rem' }}>🎓 {college}</p>}
                {branch && <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.8rem' }}>📚 {branch}</p>}

                <span className={`badge-${user?.role === 'ADMIN' ? 'purple' : 'blue'}`} style={{ fontSize: '0.72rem' }}>
                  {user?.role === 'ADMIN' ? '👑 Administrator' : '🎓 Student'}
                </span>

                {/* Social Links */}
                {(linkedinUrl || githubUrl) && (
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    {linkedinUrl && (
                      <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noreferrer"
                        className="btn btn-glass" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
                        💼 LinkedIn
                      </a>
                    )}
                    {githubUrl && (
                      <a href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`} target="_blank" rel="noreferrer"
                        className="btn btn-glass" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
                        🐙 GitHub
                      </a>
                    )}
                  </div>
                )}

                {bio && (
                  <div className="mt-3 p-3 glass-card" style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{bio}</p>
                  </div>
                )}

                {/* Photo upload controls */}
                <div className="mt-4 d-flex flex-column gap-2">
                  <label className="btn btn-glass w-100" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                    📷 Upload Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  {profileImage && (
                    <button type="button" className="btn btn-danger-glass w-100" style={{ fontSize: '0.82rem' }} onClick={() => setProfileImage('')}>
                      Remove Photo
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                  JPG, PNG, GIF — max 2 MB
                </p>

              </div>
            </div>

            {/* ── Right Column: Edit Form ── */}
            <div className="col-lg-8">
              <div className="glass-card-strong p-4 p-md-5">

                {/* Tabs */}
                <div className="d-flex gap-1 mb-4" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0' }}>
                  {[
                    { key: 'personal', label: '👤 Personal' },
                    { key: 'academic', label: '🎓 Academic' },
                    { key: 'links', label: '🔗 Links & Bio' },
                    { key: 'security', label: '🔐 Security' },
                  ].map(({ key, label }) => (
                    <button key={key} type="button" style={tabStyle(key)} onClick={() => setActiveTab(key)}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Global Alerts */}
                {error && (
                  <div className="alert-glass-danger p-3 mb-4" role="alert" style={{ fontSize: '0.875rem' }}>✕ {error}</div>
                )}
                {success && (
                  <div className="alert-glass-success p-3 mb-4" role="alert" style={{ fontSize: '0.875rem' }}>✓ {success}</div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* ─── Personal Tab ─── */}
                  {activeTab === 'personal' && (
                    <div className="anim-fade-in">
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          {inputLabel('Full Name')}
                          <input type="text" className="form-control input-glass" value={name}
                            onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="col-md-6">
                          {inputLabel('Email Address')}
                          <input type="email" className="form-control input-glass" value={email}
                            onChange={e => setEmail(e.target.value)} required />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          {inputLabel('Mobile Number')}
                          <input type="tel" className="form-control input-glass" placeholder="+91 XXXXX XXXXX"
                            value={mobile} onChange={e => setMobile(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                          {inputLabel('Address / City')}
                          <input type="text" className="form-control input-glass" placeholder="City, State, Country"
                            value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── Academic Tab ─── */}
                  {activeTab === 'academic' && (
                    <div className="anim-fade-in">
                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          {inputLabel('College / University')}
                          <input type="text" className="form-control input-glass" placeholder="e.g. IIT Bombay"
                            value={college} onChange={e => setCollege(e.target.value)} />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          {inputLabel('Branch / Specialization')}
                          <input type="text" className="form-control input-glass" placeholder="e.g. Computer Science Engineering"
                            value={branch} onChange={e => setBranch(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── Links & Bio Tab ─── */}
                  {activeTab === 'links' && (
                    <div className="anim-fade-in">
                      <div className="mb-3">
                        {inputLabel('LinkedIn Profile URL')}
                        <div className="input-group">
                          <span className="input-group-text" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-strong)', color: 'var(--blue-400)', fontSize: '0.9rem' }}>💼</span>
                          <input type="url" className="form-control input-glass" placeholder="https://linkedin.com/in/yourname"
                            value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
                            style={{ borderLeft: 'none' }} />
                        </div>
                      </div>
                      <div className="mb-3">
                        {inputLabel('GitHub Profile URL')}
                        <div className="input-group">
                          <span className="input-group-text" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-strong)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>🐙</span>
                          <input type="url" className="form-control input-glass" placeholder="https://github.com/yourusername"
                            value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                            style={{ borderLeft: 'none' }} />
                        </div>
                      </div>
                      <div className="mb-3">
                        {inputLabel('Bio / About Me')}
                        <textarea className="form-control input-glass" rows={4}
                          placeholder="Write a short description about yourself..."
                          value={bio} onChange={e => setBio(e.target.value)}
                          style={{ resize: 'vertical', minHeight: 100 }} />
                        <small style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{bio.length}/500 characters</small>
                      </div>
                    </div>
                  )}

                  {/* ─── Security Tab ─── */}
                  {activeTab === 'security' && (
                    <div className="anim-fade-in">
                      <div className="glass-card p-4 mb-4">
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                          🔐 To change your password, fill in the fields below. Leave blank if you want to keep your current password.
                        </p>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          {inputLabel('New Password')}
                          <input type="password" className="form-control input-glass"
                            placeholder="Min 6 characters" value={password}
                            onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                          {inputLabel('Confirm Password')}
                          <input type="password" className="form-control input-glass"
                            placeholder="Repeat new password" value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="mt-5 d-flex align-items-center gap-3">
                    <button type="submit" className="btn btn-glow-blue px-5" disabled={updating}
                      style={{ padding: '0.75rem 2rem' }}>
                      {updating ? (
                        <span className="d-flex align-items-center gap-2">
                          <span className="spinner-border spinner-border-sm" />
                          Saving Changes...
                        </span>
                      ) : '💾 Save Changes'}
                    </button>
                    {success && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--green-400)', fontWeight: 600 }}>
                        ✓ Saved!
                      </span>
                    )}
                  </div>

                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

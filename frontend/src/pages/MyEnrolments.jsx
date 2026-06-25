import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { jsPDF } from 'jspdf';

const COURSE_COLORS = [
  'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'linear-gradient(135deg,#a855f7,#3b82f6)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#f43f5e)',
  'linear-gradient(135deg,#f43f5e,#a855f7)',
];

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const MyEnrolments = () => {
  const navigate = useNavigate();
  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dropConfirm, setDropConfirm] = useState(null); // { courseId, courseTitle }

  useEffect(() => {
    const fetchEnrolmentsAndProgress = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get('/api/enrolments/my');
        const enrolmentsData = response.data;
        
        // Fetch progress details for each enrolled course in parallel
        const enrolmentsWithProgress = await Promise.all(
          enrolmentsData.map(async (enrolment) => {
            try {
              const progressRes = await axiosInstance.get(`/api/progress/${enrolment.courseId}`);
              return {
                ...enrolment,
                progressPercentage: progressRes.data.progressPercentage,
                completedLessons: progressRes.data.completedLessons,
                totalLessons: progressRes.data.totalLessons,
                certificateEligible: progressRes.data.certificateEligible,
              };
            } catch (err) {
              console.error(`Failed to fetch progress for course ${enrolment.courseId}`, err);
              return {
                ...enrolment,
                progressPercentage: 0,
                completedLessons: 0,
                totalLessons: 0,
                certificateEligible: false,
              };
            }
          })
        );

        setEnrolments(enrolmentsWithProgress);
      } catch (err) {
        setError('Failed to fetch your enrolments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolmentsAndProgress();
  }, []);

  const handleDrop = async (courseId, courseTitle) => {
    setError('');
    setSuccess('');
    setDropConfirm(null);
    setActionLoading((prev) => ({ ...prev, [courseId]: true }));
    try {
      await axiosInstance.delete(`/api/enrolments/drop/${courseId}`);
      setSuccess(`Successfully dropped "${courseTitle}"`);
      setEnrolments((prev) => prev.filter((item) => item.courseId !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to drop the course. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [courseId]: false }));
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleDownloadCertificate = (enrolment) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Background decorative borders
      doc.setDrawColor(59, 130, 246); // Blue
      doc.setLineWidth(5);
      doc.rect(6, 6, 285, 198);

      doc.setDrawColor(168, 85, 247); // Purple
      doc.setLineWidth(1);
      doc.rect(11, 11, 275, 188);

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(34);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('CERTIFICATE OF COMPLETION', 148.5, 48, { align: 'center' });

      // Subtitle
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(15);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text('This is proudly presented to', 148.5, 72, { align: 'center' });

      // Student Name
      doc.setFont('Helvetica', 'bolditalic');
      doc.setFontSize(26);
      doc.setTextColor(59, 130, 246); // Blue-500
      doc.text(enrolment.studentName || 'Student Scholar', 148.5, 92, { align: 'center' });

      // Accomplishment text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105);
      doc.text('for successfully completing all syllabus modules for the course', 148.5, 112, { align: 'center' });

      // Course Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(168, 85, 247); // Purple-500
      doc.text(enrolment.courseTitle, 148.5, 128, { align: 'center' });

      // Separator
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(40, 155, 110, 155);
      doc.line(180, 155, 250, 155);

      // Footer
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`Instructor: ${enrolment.courseInstructor}`, 52, 160);
      doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 192, 160);

      // Save PDF
      doc.save(`Certificate_${enrolment.courseTitle.replace(/\s+/g, '_')}.pdf`);
      setSuccess('Certificate downloaded successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate PDF certificate.');
    }
  };

  return (
    <div className="container py-5 text-light">
      {/* Header */}
      <div className="mb-5 anim-fade-up">
        <p className="section-eyebrow">My Learning</p>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '2rem',
          letterSpacing: '-0.02em', marginBottom: '0.4rem',
          background: 'linear-gradient(120deg, #60a5fa, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>My Enrolments</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Track your progress, continue study sessions, and download completion certificates.
        </p>
      </div>

      {/* Alerts */}
      {success && <div className="alert-glass-success p-3 mb-4 anim-fade-in">✓ {success}</div>}
      {error && <div className="alert-glass-danger p-3 mb-4 anim-fade-in">✕ {error}</div>}

      {loading ? (
        <div className="loader-container">
          <div className="spinner-glow" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading enrolments...</span>
        </div>
      ) : enrolments.length === 0 ? (
        <div className="glass-card text-center p-5">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎓</div>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No active enrolments</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You haven't enrolled in any courses yet.
          </p>
          <Link to="/dashboard" className="btn btn-glow-blue px-4" style={{ borderRadius: 12 }}>
            Browse Courses →
          </Link>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="d-flex align-items-center gap-3 mb-4 anim-fade-up">
            <div style={{
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 10, padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
              <span style={{ fontSize: '1rem' }}>📚</span>
              <span style={{ fontWeight: 700, color: 'var(--blue-400)' }}>{enrolments.length}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {enrolments.length === 1 ? 'Course' : 'Courses'} Enrolled
              </span>
            </div>
          </div>

          {/* Enrolment cards list */}
          <div className="d-flex flex-column gap-3 anim-stagger">
            {enrolments.map((enrolment, index) => {
              const accentColor = COURSE_COLORS[index % COURSE_COLORS.length];
              const isDropping = actionLoading[enrolment.courseId];
              const confirmingDrop = dropConfirm?.courseId === enrolment.courseId;
              const hasCompleted = enrolment.progressPercentage === 100;

              return (
                <div key={enrolment.id} className="enrolment-card"
                  style={{ borderLeftColor: accentColor.includes('#3b82f6') ? '#3b82f6' : accentColor.includes('#a855f7') ? '#a855f7' : '#10b981' }}>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                      {/* Left: course info */}
                      <div className="d-flex align-items-start gap-3 flex-grow-1" style={{ cursor: 'pointer' }} onClick={() => navigate(`/course/${enrolment.courseId}`)}>
                        {/* Number badge */}
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, background: accentColor, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.85rem', color: 'white',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                        }}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h6 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }} className="hover-text-white transition">
                            {enrolment.courseTitle}
                          </h6>
                          <div className="d-flex flex-wrap gap-2 align-items-center">
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              👨‍🏫 {enrolment.courseInstructor}
                            </span>
                            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              📅 Enrolled {formatDate(enrolment.enrolledAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: action buttons */}
                      <div className="flex-shrink-0 d-flex gap-2 align-items-center">
                        <button
                          className="btn btn-glow-blue btn-sm px-3.5"
                          onClick={() => navigate(`/course/${enrolment.courseId}`)}
                          style={{
                            background: 'rgba(59,130,246,0.12)',
                            color: 'var(--blue-400)',
                            border: '1px solid rgba(59,130,246,0.3)',
                          }}
                        >
                          Study Console →
                        </button>
                        
                        {hasCompleted && (
                          <button
                            className="btn btn-sm text-uppercase font-semibold badge-emerald border-0 shadow-sm"
                            onClick={() => handleDownloadCertificate(enrolment)}
                            style={{ padding: '0.55rem 1rem' }}
                            title="Download Certificate PDF"
                          >
                            📜 Certificate
                          </button>
                        )}

                        {confirmingDrop ? (
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drop?</span>
                            <button
                              style={{
                                padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700,
                                background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)',
                                color: 'var(--rose-500)', borderRadius: 8, cursor: 'pointer',
                              }}
                              onClick={() => handleDrop(enrolment.courseId, enrolment.courseTitle)}
                              disabled={isDropping}
                            >
                              {isDropping ? '...' : 'Confirm'}
                            </button>
                            <button
                              style={{
                                padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                                background: 'var(--glass-bg)', border: '1px solid var(--glass-border-strong)',
                                color: 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer',
                              }}
                              onClick={() => setDropConfirm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-danger-glass btn-sm"
                            onClick={() => setDropConfirm({ courseId: enrolment.courseId, courseTitle: enrolment.courseTitle })}
                            disabled={isDropping}
                            style={{ padding: '0.45rem 0.85rem' }}
                          >
                            {isDropping ? '...' : '✕ Drop'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar under information */}
                    <div className="pt-2 border-top border-secondary border-opacity-5">
                      <div className="d-flex align-items-center justify-content-between mb-1.5" style={{ fontSize: '0.78rem' }}>
                        <span className="text-muted">Module Completion</span>
                        <span className="text-white fw-bold">
                          {enrolment.progressPercentage?.toFixed(0) || 0}% ({enrolment.completedLessons || 0}/{enrolment.totalLessons || 0} Lessons)
                        </span>
                      </div>
                      <div className="progress bg-slate-900 bg-opacity-50" style={{ height: '6px', borderRadius: '3px' }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${enrolment.progressPercentage || 0}%`,
                            background: hasCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #a855f7)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-5">
            <Link to="/dashboard" style={{ color: 'var(--blue-400)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              ← Browse more courses
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default MyEnrolments;

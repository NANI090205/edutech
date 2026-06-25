import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

// Course color themes cycle
const CARD_THEMES = [
  { accent: 'linear-gradient(90deg,#3b82f6,#06b6d4)', badge: 'blue', icon: '💻' },
  { accent: 'linear-gradient(90deg,#a855f7,#3b82f6)', badge: 'purple', icon: '🔬' },
  { accent: 'linear-gradient(90deg,#10b981,#06b6d4)', badge: 'emerald', icon: '📊' },
  { accent: 'linear-gradient(90deg,#f59e0b,#f43f5e)', badge: 'amber', icon: '⚡' },
  { accent: 'linear-gradient(90deg,#f43f5e,#a855f7)', badge: 'purple', icon: '🎨' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolments, setEnrolments] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Search / filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch initial categories and enrolments
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catsRes, enrolRes] = await Promise.all([
          axiosInstance.get('/api/courses/categories'),
          axiosInstance.get('/api/enrolments/my'),
        ]);
        setCategories(catsRes.data);
        setEnrolments(enrolRes.data);
      } catch (err) {
        console.error('Failed to load filters or enrolments', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch paginated courses on query/page changes
  useEffect(() => {
    fetchCourses();
  }, [searchQuery, selectedCategory, selectedInstructor, page]);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        instructor: selectedInstructor || undefined,
        page: page,
        size: 6
      };
      const response = await axiosInstance.get('/api/courses/search', { params });
      setCourses(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrol = async (courseId) => {
    setError('');
    setSuccessMsg('');
    setActionLoading((prev) => ({ ...prev, [courseId]: true }));
    try {
      const response = await axiosInstance.post('/api/enrolments/enrol', { courseId });
      setSuccessMsg(`Successfully enrolled in "${response.data.courseTitle}"!`);
      setEnrolments((prev) => [...prev, response.data]);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrolment failed. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [courseId]: false }));
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const isEnrolled = (courseId) => enrolments.some((e) => e.courseId === courseId);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    setPage(0);
  };

  return (
    <div className="container py-5 text-light">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4 mb-4 anim-fade-up">
        <div>
          <p className="section-eyebrow">Course Catalog</p>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '2rem',
            letterSpacing: '-0.02em', marginBottom: '0.4rem',
            background: 'linear-gradient(120deg, #60a5fa, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Welcome, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 0 }}>
            Explore available courses and build your credentials.{' '}
            <span className="badge-emerald">{enrolments.length} enrolled</span>
          </p>
        </div>

        {/* Filters Panel */}
        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="search-group flex-grow-1">
            <div className="input-group">
              <span className="input-group-text">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Search title, instructor..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          </div>
          <input
            type="text"
            className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 px-3 py-2"
            placeholder="Instructor name..."
            value={selectedInstructor}
            onChange={(e) => { setSelectedInstructor(e.target.value); setPage(0); }}
            style={{ fontSize: '0.85rem', width: '160px' }}
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="d-flex flex-wrap gap-2 mb-4 anim-fade-up">
        <button
          onClick={() => handleCategoryClick('')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition ${
            selectedCategory === '' ? 'btn-primary' : 'btn-glass text-muted'
          }`}
          style={{ fontSize: '0.78rem' }}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition ${
              selectedCategory === cat ? 'btn-primary' : 'btn-glass text-muted'
            }`}
            style={{ fontSize: '0.78rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert-glass-success p-3 mb-4 anim-fade-in" role="alert">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="alert-glass-danger p-3 mb-4 anim-fade-in" role="alert">
          ✕ {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-glow" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading courses...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-card text-center p-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No courses found</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
            Try adjusting your search filters.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Showing courses <strong style={{ color: 'var(--text-primary)' }}>{page * 6 + 1} - {Math.min((page + 1) * 6, totalElements)}</strong> of {totalElements}
          </p>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 anim-stagger">
            {courses.map((course, index) => {
              const enrolled = isEnrolled(course.id);
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              return (
                <div className="col" key={course.id}>
                  <div className="course-card h-100">
                    {/* Top accent bar */}
                    <div className="course-card-accent" style={{ '--accent': theme.accent }} />

                    <div className="p-4 d-flex flex-column h-100">
                      {/* Badges row */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className={`badge-${theme.badge} d-flex align-items-center gap-1`}>
                          {theme.icon} {course.duration}
                        </span>
                        {course.category && (
                          <span className="badge bg-slate-900 border border-secondary border-opacity-35 text-white small px-2 py-1 rounded-2">
                            🏷️ {course.category}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem', lineHeight: 1.4 }}>
                        {course.title}
                      </h5>

                      {/* Ratings summary */}
                      <div className="d-flex align-items-center gap-1 mb-2">
                        {course.averageRating && course.averageRating > 0 ? (
                          <>
                            <span style={{ color: 'var(--amber-500)', fontSize: '0.85rem' }}>★</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{course.averageRating.toFixed(1)}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>({course.reviewCount} reviews)</span>
                          </>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>No reviews yet</span>
                        )}
                      </div>

                      {/* Description */}
                      <p style={{
                        color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.65,
                        flex: 1, marginBottom: '1rem',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {course.description || 'No description available for this course.'}
                      </p>

                      {/* Tags */}
                      {course.tags && (
                        <div className="d-flex flex-wrap gap-1.5 mb-3">
                          {course.tags.split(',').map((tag) => (
                            <span key={tag} className="badge bg-secondary bg-opacity-10 text-secondary-emphasis font-monospace" style={{ fontSize: '0.65rem', padding: '0.25rem 0.45rem' }}>
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Instructor Info */}
                      <div className="d-flex align-items-center gap-2 mb-4" style={{
                        padding: '0.6rem 0.75rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 10,
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: theme.accent,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 700, color: 'white',
                        }}>
                          {course.instructor.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Instructor</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{course.instructor}</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {enrolled ? (
                        <button
                          className="btn btn-glow-blue w-100"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                          }}
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          Go to Course →
                        </button>
                      ) : (
                        <button
                          className="btn btn-glow-blue w-100"
                          style={{
                            background: theme.accent,
                            boxShadow: `0 4px 16px rgba(59,130,246,0.25)`,
                          }}
                          onClick={() => handleEnrol(course.id)}
                          disabled={actionLoading[course.id]}
                        >
                          {actionLoading[course.id] ? (
                            <span className="d-flex align-items-center justify-content-center gap-2">
                              <span className="spinner-border spinner-border-sm" />
                              Enrolling...
                            </span>
                          ) : (
                            'Enrol Now →'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
              <button
                className="btn btn-glass"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
                style={{ borderRadius: '10px', minWidth: '40px', height: '40px' }}
              >
                ◀
              </button>
              <span className="small text-muted">
                Page <strong className="text-white">{page + 1}</strong> of {totalPages}
              </span>
              <button
                className="btn btn-glass"
                disabled={page === totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
                style={{ borderRadius: '10px', minWidth: '40px', height: '40px' }}
              >
                ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;

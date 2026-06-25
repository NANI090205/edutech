import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const formatNotifTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) + 
         ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewFormLoading, setReviewFormLoading] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Expanded lesson ID tracking
  const [expandedLessonId, setExpandedLessonId] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [courseRes, progressRes, reviewsRes, myReviewRes] = await Promise.all([
        axiosInstance.get(`/api/courses/${courseId}`),
        axiosInstance.get(`/api/progress/${courseId}`),
        axiosInstance.get(`/api/reviews/course/${courseId}`),
        axiosInstance.get(`/api/reviews/my/${courseId}`).catch(() => ({ data: null })), // handle 404/no review
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);
      setReviews(reviewsRes.data);
      if (myReviewRes && myReviewRes.data) {
        setMyReview(myReviewRes.data);
      } else {
        setMyReview(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load course details or progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLesson = async (lessonId, currentCompleted) => {
    if (toggleLoading[lessonId]) return;
    setToggleLoading(prev => ({ ...prev, [lessonId]: true }));
    try {
      const endpoint = currentCompleted ? '/api/progress/incomplete' : '/api/progress/complete';
      await axiosInstance.post(endpoint, { lessonId });
      
      // Re-fetch progress to update the progress bar & completion checkboxes
      const progressRes = await axiosInstance.get(`/api/progress/${courseId}`);
      setProgress(progressRes.data);
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setToggleLoading(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewFormLoading(true);

    try {
      const response = await axiosInstance.post('/api/reviews', {
        courseId: parseInt(courseId),
        rating: rating,
        comment: comment,
      });
      setMyReview(response.data);
      setReviewSuccess('Thank you! Your review has been submitted.');
      
      // Refresh the aggregate list of reviews and course details (for new average rating)
      const [reviewsRes, courseRes] = await Promise.all([
        axiosInstance.get(`/api/reviews/course/${courseId}`),
        axiosInstance.get(`/api/courses/${courseId}`),
      ]);
      setReviews(reviewsRes.data);
      setCourse(courseRes.data);
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewFormLoading(false);
    }
  };

  const handleLessonHeaderClick = (lessonId) => {
    setExpandedLessonId(prev => (prev === lessonId ? null : lessonId));
  };

  if (loading) {
    return (
      <div className="loader-container" style={{ minHeight: '80vh' }}>
        <div className="spinner-glow" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading learning console...</span>
      </div>
    );
  }

  if (error || !course || !progress) {
    return (
      <div className="container py-5 text-center text-light">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h4 className="fw-bold">{error || 'Course not found'}</h4>
        <p className="text-muted">Could not retrieve course metrics or progress records.</p>
        <Link to="/dashboard" className="btn btn-glass px-4 mt-3">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5 text-light animate-fade-in">
      {/* Back button */}
      <Link to="/enrolments" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-4 hover-text-white transition">
        ← Back to my enrolments
      </Link>

      {/* Header Info */}
      <div className="glass-card p-4 p-md-5 mb-4 position-relative overflow-hidden">
        {/* Dynamic mesh border */}
        <div className="course-card-accent position-absolute top-0 start-0 end-0" style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #a855f7)' }} />

        <div className="row g-4 align-items-start">
          <div className="col-12 col-md-8">
            <span className="badge bg-slate-900 border border-secondary border-opacity-30 text-primary-emphasis px-3 py-1.5 rounded-pill small mb-3">
              🏷️ {course.category || 'General'}
            </span>
            <h2 className="fw-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
              {course.title}
            </h2>
            <p className="text-light-emphasis leading-relaxed mb-4" style={{ fontSize: '0.95rem' }}>
              {course.description || 'No description listed.'}
            </p>
            
            <div className="d-flex flex-wrap gap-4 align-items-center text-muted" style={{ fontSize: '0.85rem' }}>
              <span>👨‍🏫 Instructor: <strong className="text-white">{course.instructor}</strong></span>
              <span>⏱️ Duration: <strong className="text-white">{course.duration}</strong></span>
              {course.averageRating && (
                <span className="d-flex align-items-center gap-1">
                  ⭐ Rating: <strong className="text-warning">{course.averageRating.toFixed(1)}</strong> ({course.reviewCount} ratings)
                </span>
              )}
            </div>
          </div>
          
          {/* Progress circle/bar section */}
          <div className="col-12 col-md-4 text-md-end">
            <div className="glass-card bg-slate-900 bg-opacity-40 p-4 rounded-4 border-secondary border-opacity-10 d-inline-block w-100 text-center text-md-start">
              <span className="small text-muted text-uppercase tracking-wider">Course Progress</span>
              <div className="d-flex align-items-baseline justify-content-between mt-2 mb-1">
                <h3 className="fw-bold m-0" style={{ fontSize: '1.8rem' }}>
                  {progress.progressPercentage.toFixed(0)}%
                </h3>
                <span className="small text-muted">
                  {progress.completedLessons}/{progress.totalLessons} Lessons
                </span>
              </div>
              <div className="progress bg-slate-800" style={{ height: '8px', borderRadius: '4px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${progress.progressPercentage}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                    transition: 'width 0.4s ease-out',
                  }}
                />
              </div>
              {progress.certificateEligible && (
                <div className="mt-3 text-center">
                  <span className="badge-emerald d-inline-flex align-items-center gap-1.5 text-uppercase tracking-wider font-semibold" style={{ fontSize: '0.72rem', padding: '0.45rem 0.85rem' }}>
                    📜 Completion Certificate Earned!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Syllabus and Lessons List */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Syllabus & Lessons</h4>
            
            {progress.lessons && progress.lessons.length === 0 ? (
              <div className="text-center py-5 text-muted bg-slate-900 bg-opacity-25 rounded-3 border border-secondary border-opacity-10">
                <span className="fs-1 d-block mb-3">📖</span>
                <p className="mb-0 small">No lessons have been added to this course syllabus yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {progress.lessons.map((lesson) => {
                  const isExpanded = expandedLessonId === lesson.id;
                  const isLvlLoading = toggleLoading[lesson.id];
                  
                  return (
                    <div
                      key={lesson.id}
                      className={`border border-secondary border-opacity-10 rounded-4 overflow-hidden transition ${
                        lesson.completed ? 'bg-slate-900 bg-opacity-20 border-emerald-opacity' : 'bg-slate-900 bg-opacity-40'
                      }`}
                      style={lesson.completed ? { borderLeft: '4px solid var(--emerald-500)' } : { borderLeft: '4px solid transparent' }}
                    >
                      <div className="p-3 d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ cursor: 'pointer' }} onClick={() => handleLessonHeaderClick(lesson.id)}>
                          {/* Checkbox wrapper */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // prevent expanding
                              handleToggleLesson(lesson.id, lesson.completed);
                            }}
                            className={`d-flex align-items-center justify-content-center rounded-3 border transition ${
                              lesson.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-secondary border-opacity-40'
                            }`}
                            style={{ width: '24px', height: '24px', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {isLvlLoading ? (
                              <span className="spinner-border spinner-border-sm text-white" style={{ width: '12px', height: '12px' }} />
                            ) : lesson.completed ? (
                              <span className="text-white fw-bold" style={{ fontSize: '0.75rem' }}>✓</span>
                            ) : null}
                          </div>
                          
                          <div>
                            <span className="small text-muted fw-mono">Lesson {lesson.orderIndex}</span>
                            <h6 className="fw-semibold text-white m-0 mt-0.5" style={{ fontSize: '0.9rem' }}>
                              {lesson.title}
                            </h6>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted small font-monospace" style={{ fontSize: '0.72rem' }}>
                            ⏱️ {lesson.durationMinutes}m
                          </span>
                          <button
                            className="btn btn-outline-secondary border-0 btn-sm p-1.5"
                            onClick={() => handleLessonHeaderClick(lesson.id)}
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 pb-3 pt-1 border-top border-secondary border-opacity-5">
                          <p className="text-muted small leading-relaxed mb-0">
                            {lesson.description || 'No detailed description available for this lesson module.'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Review Submission and Course reviews */}
        <div className="col-12 col-lg-4">
          {/* Review Submission Card */}
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>My Course Review</h5>
            
            {myReview ? (
              <div className="bg-slate-900 bg-opacity-40 border border-secondary border-opacity-10 p-3 rounded-3">
                <div className="d-flex align-items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        color: star <= myReview.rating ? 'var(--amber-500)' : 'var(--text-tertiary)',
                        fontSize: '1rem',
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <span className="small text-muted ms-1 font-monospace">{formatNotifTime(myReview.createdAt)}</span>
                </div>
                <p className="small text-light-emphasis leading-relaxed mb-0" style={{ fontStyle: 'italic' }}>
                  "{myReview.comment || 'No comment written.'}"
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                {reviewSuccess && <div className="alert alert-success p-2 small border-0 bg-success bg-opacity-10 text-success rounded-2 mb-3">✓ {reviewSuccess}</div>}
                {reviewError && <div className="alert alert-danger p-2 small border-0 bg-danger bg-opacity-10 text-danger rounded-2 mb-3">✕ {reviewError}</div>}
                
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold text-uppercase d-block mb-1">Your Rating</label>
                  <div className="d-flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          cursor: 'pointer',
                          fontSize: '1.6rem',
                          color: star <= (hoverRating || rating) ? 'var(--amber-500)' : 'var(--text-tertiary)',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Comment (Optional)</label>
                  <textarea
                    className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                    placeholder="Tell us what you think of this course..."
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-100 py-2 rounded-2 fw-semibold"
                  disabled={reviewFormLoading}
                >
                  {reviewFormLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

          {/* Aggregate Course Reviews list */}
          <div className="glass-card p-4">
            <h5 className="fw-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Student Ratings</h5>
            
            {reviews.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No reviews yet for this course. Be the first!
              </div>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-bottom border-secondary border-opacity-10 pb-3 last-border-none">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold small text-white">{rev.studentName}</span>
                      <span className="text-muted" style={{ fontSize: '0.68rem' }}>{formatNotifTime(rev.createdAt)}</span>
                    </div>
                    <div className="d-flex align-items-center gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            color: star <= rev.rating ? 'var(--amber-500)' : 'var(--text-tertiary)',
                            fontSize: '0.8rem',
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {rev.comment && (
                      <p className="text-muted mb-0 small leading-relaxed" style={{ fontSize: '0.78rem' }}>
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course Modal control states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // ADD or EDIT
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Lessons Modal control states
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  
  // New Lesson form states
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonOrder, setNewLessonOrder] = useState(1);
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [lessonFormError, setLessonFormError] = useState('');
  const [lessonFormLoading, setLessonFormLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/courses');
      setCourses(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('ADD');
    setSelectedCourseId(null);
    setTitle('');
    setInstructor('');
    setDuration('');
    setDescription('');
    setCategory('');
    setTags('');
    setStartDate('');
    setEndDate('');
    setDeadline('');
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (course) => {
    setModalMode('EDIT');
    setSelectedCourseId(course.id);
    setTitle(course.title);
    setInstructor(course.instructor);
    setDuration(course.duration);
    setDescription(course.description || '');
    setCategory(course.category || '');
    setTags(course.tags || '');
    setStartDate(course.startDate || '');
    setEndDate(course.endDate || '');
    setDeadline(course.deadline || '');
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const payload = {
      title,
      instructor,
      duration,
      description,
      category: category || null,
      tags: tags || null,
      startDate: startDate || null,
      endDate: endDate || null,
      deadline: deadline || null,
    };

    try {
      if (modalMode === 'ADD') {
        const response = await axiosInstance.post('/api/courses', payload);
        setCourses((prev) => [...prev, response.data]);
        setSuccess(`Course "${title}" created successfully!`);
      } else {
        const response = await axiosInstance.put(`/api/courses/${selectedCourseId}`, payload);
        setCourses((prev) =>
          prev.map((c) => (c.id === selectedCourseId ? response.data : c))
        );
        setSuccess(`Course "${title}" updated successfully!`);
      }
      setShowModal(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save course. Please check inputs.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async (id, courseTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete course "${courseTitle}"? This will delete all student enrolments in this course.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await axiosInstance.delete(`/api/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setSuccess(`Course "${courseTitle}" deleted successfully!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete course. Please try again.');
      }
    }
  };

  // ── Lesson Handlers ─────────────────────────────────────
  const handleOpenLessons = async (course) => {
    setActiveCourse(course);
    setLessons([]);
    setLessonsLoading(true);
    setLessonFormError('');
    // reset form inputs
    setNewLessonTitle('');
    setNewLessonDesc('');
    setNewLessonOrder(1);
    setNewLessonDuration(15);
    setShowLessonsModal(true);

    try {
      const response = await axiosInstance.get(`/api/courses/${course.id}/lessons`);
      setLessons(response.data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (err) {
      console.error('Failed to load lessons', err);
      setLessonFormError('Failed to load lessons for this course.');
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle) return;
    setLessonFormError('');
    setLessonFormLoading(true);

    const payload = {
      title: newLessonTitle,
      description: newLessonDesc,
      orderIndex: parseInt(newLessonOrder),
      durationMinutes: parseInt(newLessonDuration),
    };

    try {
      const response = await axiosInstance.post(`/api/admin/courses/${activeCourse.id}/lessons`, payload);
      setLessons((prev) => [...prev, response.data].sort((a, b) => a.orderIndex - b.orderIndex));
      setNewLessonTitle('');
      setNewLessonDesc('');
      setNewLessonOrder(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setLessonFormError('Failed to add lesson. Please verify inputs.');
    } finally {
      setLessonFormLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    setLessonFormError('');
    try {
      await axiosInstance.delete(`/api/admin/lessons/${lessonId}`);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    } catch (err) {
      console.error(err);
      setLessonFormError('Failed to delete lesson.');
    }
  };

  return (
    <div className="container py-5 text-light position-relative">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold bg-gradient-primary-to-secondary text-transparent bg-clip-text d-inline-block">
            Course Management
          </h2>
          <p className="text-muted mb-0">Create, review, edit, or delete courses and manage their syllabus</p>
        </div>
        <div>
          <button className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm" onClick={handleOpenAdd}>
            + Add New Course
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 mb-4 shadow-sm" role="alert">
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 mb-4 shadow-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Loading courses catalog...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="card bg-slate-800 border-0 text-center p-5 rounded-4 shadow-sm">
          <div className="card-body">
            <span className="fs-1 d-block mb-3">📚</span>
            <h4 className="fw-bold">No courses registered</h4>
            <p className="text-muted mb-0">Click "+ Add New Course" above to create one.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 bg-slate-800 shadow-sm rounded-4 overflow-hidden animate-fade-in">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead className="bg-slate-900 text-muted small text-uppercase">
                <tr>
                  <th className="py-3 px-4" style={{ width: '8%' }}>ID</th>
                  <th className="py-3 px-4" style={{ width: '27%' }}>Course</th>
                  <th className="py-3 px-4" style={{ width: '18%' }}>Instructor</th>
                  <th className="py-3 px-4" style={{ width: '12%' }}>Duration</th>
                  <th className="py-3 px-4" style={{ width: '15%' }}>Schedule</th>
                  <th className="py-3 px-4 text-end" style={{ width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="py-3 px-4 text-muted fw-mono">{course.id}</td>
                    <td className="py-3 px-4">
                      <div className="d-flex flex-column">
                        <span className="text-white fw-bold">{course.title}</span>
                        <div className="d-flex gap-2 align-items-center mt-1">
                          {course.category && (
                            <span className="badge bg-slate-900 text-primary-emphasis border border-primary border-opacity-20 px-2 py-0.5 rounded small" style={{ fontSize: '0.7rem' }}>
                              {course.category}
                            </span>
                          )}
                          {course.tags && (
                            <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                              {course.tags.split(',').slice(0,2).map(t => `#${t.trim()}`).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-light">{course.instructor}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1.5 rounded-pill small">
                        {course.duration}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {course.startDate ? (
                        <div className="d-flex flex-column" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                          <span className="text-light">Start: {course.startDate}</span>
                          {course.deadline && <span className="text-warning">Reg: {course.deadline}</span>}
                        </div>
                      ) : (
                        <span className="text-muted small italic">Not Scheduled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-outline-info btn-sm px-2.5 py-1.5 rounded-2 d-inline-flex align-items-center gap-1"
                          onClick={() => handleOpenLessons(course)}
                          title="Manage course syllabus & lessons"
                          style={{ fontSize: '0.8rem' }}
                        >
                          📖 Lessons
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm px-2.5 py-1.5 rounded-2 d-inline-flex"
                          onClick={() => handleOpenEdit(course)}
                          title="Edit course info"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm px-2.5 py-1.5 rounded-2 d-inline-flex"
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          title="Delete course"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Edit/Add Modal */}
      {showModal && (
        <div className="custom-modal-overlay d-flex align-items-center justify-content-center">
          <div className="card border-0 bg-slate-800 text-light shadow-2xl rounded-4 overflow-hidden w-100 mx-3" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-slate-900 border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold mb-0">{modalMode === 'ADD' ? 'Add New Course' : 'Edit Course Details'}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal} aria-label="Close"></button>
            </div>
            <form onSubmit={handleSaveCourse}>
              <div className="card-body p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                {formError && (
                  <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 mb-3 small" role="alert">
                    {formError}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="courseTitle" className="form-label text-muted small fw-semibold text-uppercase">Course Title</label>
                    <input
                      type="text"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="courseTitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="instructorName" className="form-label text-muted small fw-semibold text-uppercase">Instructor Name</label>
                    <input
                      type="text"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="instructorName"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="durationLength" className="form-label text-muted small fw-semibold text-uppercase">Duration (e.g. 6 Weeks)</label>
                    <input
                      type="text"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="durationLength"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label text-muted small fw-semibold text-uppercase">Category (e.g. Backend)</label>
                    <input
                      type="text"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="category"
                      placeholder="Backend, Frontend, DSA..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="tags" className="form-label text-muted small fw-semibold text-uppercase">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="tags"
                      placeholder="java, spring, api..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="startDate" className="form-label text-muted small fw-semibold text-uppercase">Start Date</label>
                    <input
                      type="date"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="endDate" className="form-label text-muted small fw-semibold text-uppercase">End Date</label>
                    <input
                      type="date"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="deadline" className="form-label text-muted small fw-semibold text-uppercase">Deadline</label>
                    <input
                      type="date"
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="deadline"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="courseDescription" className="form-label text-muted small fw-semibold text-uppercase">Description</label>
                    <textarea
                      className="form-control bg-slate-900 border-secondary border-opacity-20 text-light rounded-3 py-2 px-3 focus-primary"
                      id="courseDescription"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-slate-900 border-secondary border-opacity-10 py-3 px-4 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary px-3 py-2 rounded-2 fw-medium border-opacity-50 text-light" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 rounded-2 fw-semibold" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons Sub-Modal */}
      {showLessonsModal && activeCourse && (
        <div className="custom-modal-overlay d-flex align-items-center justify-content-center">
          <div className="card border-0 bg-slate-800 text-light shadow-2xl rounded-4 overflow-hidden w-100 mx-3" style={{ maxWidth: '750px' }}>
            <div className="card-header bg-slate-900 border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h5 className="fw-bold mb-0">Manage Course Syllabus</h5>
                <span className="text-muted small">{activeCourse.title}</span>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowLessonsModal(false)} aria-label="Close"></button>
            </div>
            
            <div className="card-body p-4 overflow-auto" style={{ maxHeight: '75vh' }}>
              <div className="row g-4">
                {/* Left side: Add new lesson form */}
                <div className="col-md-5 border-end border-secondary border-opacity-20 pe-md-4">
                  <h6 className="fw-bold mb-3 text-primary">Add New Lesson</h6>
                  <form onSubmit={handleAddLesson}>
                    {lessonFormError && (
                      <div className="alert alert-danger p-2 mb-3 small border-0 bg-danger bg-opacity-10 text-danger rounded-2">
                        {lessonFormError}
                      </div>
                    )}
                    <div className="mb-2">
                      <label className="form-label text-muted small fw-semibold text-uppercase">Lesson Title</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-slate-900 border-secondary border-opacity-20 text-light py-1.5"
                        placeholder="Introduction, Module 1..."
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-muted small fw-semibold text-uppercase">Order Index</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm bg-slate-900 border-secondary border-opacity-20 text-light py-1.5"
                        value={newLessonOrder}
                        onChange={(e) => setNewLessonOrder(parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-muted small fw-semibold text-uppercase">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm bg-slate-900 border-secondary border-opacity-20 text-light py-1.5"
                        value={newLessonDuration}
                        onChange={(e) => setNewLessonDuration(parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold text-uppercase">Description</label>
                      <textarea
                        className="form-control form-control-sm bg-slate-900 border-secondary border-opacity-20 text-light"
                        rows="2"
                        value={newLessonDesc}
                        onChange={(e) => setNewLessonDesc(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm w-100 py-2 rounded-2 fw-semibold"
                      disabled={lessonFormLoading}
                    >
                      {lessonFormLoading ? 'Adding...' : '+ Add Lesson'}
                    </button>
                  </form>
                </div>

                {/* Right side: Lessons List */}
                <div className="col-md-7 ps-md-4">
                  <h6 className="fw-bold mb-3 text-light">Lessons Curriculum ({lessons.length})</h6>
                  {lessonsLoading ? (
                    <div className="text-center py-5">
                      <span className="spinner-border spinner-border-sm text-primary mb-2"></span>
                      <p className="text-muted small">Loading syllabus...</p>
                    </div>
                  ) : lessons.length === 0 ? (
                    <div className="text-center py-5 text-muted bg-slate-900 bg-opacity-25 rounded-3 border border-secondary border-opacity-10">
                      <p className="mb-0 small">No lessons added to this course yet.</p>
                      <p className="text-muted small">Use the form on the left to add one.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="d-flex justify-content-between align-items-start p-3 bg-slate-900 bg-opacity-50 border border-secondary border-opacity-20 rounded-3 hover-glass"
                        >
                          <div style={{ maxWidth: '82%' }}>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary rounded px-2 py-0.5 small" style={{ fontSize: '0.7rem' }}>
                                #{lesson.orderIndex}
                              </span>
                              <span className="fw-semibold small text-white">{lesson.title}</span>
                            </div>
                            {lesson.description && (
                              <p className="text-muted mt-1 mb-0 small" style={{ fontSize: '0.72rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {lesson.description}
                              </p>
                            )}
                            <span className="text-secondary small mt-1 d-block" style={{ fontSize: '0.68rem' }}>
                              ⏱️ {lesson.durationMinutes} mins
                            </span>
                          </div>
                          <button
                            className="btn btn-outline-danger btn-sm p-1 d-inline-flex border-0"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            title="Remove Lesson"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-slate-900 border-secondary border-opacity-10 py-3 px-4 text-end">
              <button type="button" className="btn btn-outline-secondary btn-sm px-4 py-2" onClick={() => setShowLessonsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;

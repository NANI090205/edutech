import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination and search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/admin/students');
      setStudents(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportStudents = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await axiosInstance.get('/api/admin/export/students', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_list.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('Students CSV exported successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to export students CSV.');
    }
  };

  const handleExportEnrolments = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await axiosInstance.get('/api/admin/export/enrolments', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'enrolments_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('Enrollments CSV exported successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to export enrollments CSV.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter students by name / email / college / branch
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.college || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination slice
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container py-5 text-light">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold bg-gradient-primary-to-secondary text-transparent bg-clip-text d-inline-block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Student Registrations & Enrolments
          </h2>
          <p className="text-muted mb-0">Monitor student accounts, view profiles, and export records</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary px-3 py-2 rounded-3 fw-semibold small d-flex align-items-center gap-1"
            onClick={handleExportStudents}
          >
            📤 Export Students CSV
          </button>
          <button
            className="btn btn-outline-info px-3 py-2 rounded-3 fw-semibold small d-flex align-items-center gap-1"
            onClick={handleExportEnrolments}
          >
            📤 Export Enrolments CSV
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 mb-4 shadow-sm" role="alert">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 mb-4 shadow-sm" role="alert">
          ✕ {error}
        </div>
      )}

      {/* Filter search box */}
      <div className="search-group mb-4" style={{ maxWidth: '350px' }}>
        <div className="input-group">
          <span className="input-group-text">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Filter students, college, branch..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
            style={{ fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Loading students registry...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card bg-slate-800 border-0 text-center p-5 rounded-4 shadow-sm">
          <div className="card-body">
            <span className="fs-1 d-block mb-3">👥</span>
            <h4 className="fw-bold">No students registered</h4>
            <p className="text-muted mb-0">Student records will appear here once they register on the system.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card border-0 bg-slate-800 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead className="bg-slate-900 text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4" style={{ width: '8%' }}>ID</th>
                    <th className="py-3 px-4" style={{ width: '25%' }}>Student</th>
                    <th className="py-3 px-4" style={{ width: '25%' }}>Education</th>
                    <th className="py-3 px-4" style={{ width: '12%' }}>Joined Date</th>
                    <th className="py-3 px-4" style={{ width: '30%' }}>Enrolled Courses</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="py-4 px-4 text-muted fw-mono">{student.id}</td>
                      <td className="py-4 px-4">
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-white fs-6">{student.name}</span>
                          <span className="text-muted small mt-1">{student.email}</span>
                          {student.mobile && (
                            <span className="text-secondary small mt-0.5" style={{ fontSize: '0.75rem' }}>📞 {student.mobile}</span>
                          )}
                          {student.linkedinUrl && (
                            <a
                              href={student.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary small mt-1 d-inline-flex align-items-center gap-1 text-decoration-none"
                              style={{ fontSize: '0.75rem' }}
                            >
                              🔗 LinkedIn Profile
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {student.college ? (
                          <div className="d-flex flex-column">
                            <span className="text-light fw-semibold small">{student.college}</span>
                            <span className="text-muted small mt-1">{student.branch || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-muted small italic">Not provided</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-light small">{formatDate(student.createdAt)}</span>
                      </td>
                      <td className="py-4 px-4">
                        {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {student.enrolledCourses.map((course) => (
                              <span
                                key={course.id}
                                className="badge bg-slate-900 border border-secondary border-opacity-20 text-light px-2.5 py-2 rounded-2 fw-medium small"
                              >
                                📚 {course.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small italic">No active enrolments</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button
                className="btn btn-glass"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ borderRadius: '10px', minWidth: '40px', height: '40px' }}
              >
                ◀
              </button>
              <span className="small text-muted">
                Page <strong className="text-white">{currentPage + 1}</strong> of {totalPages}
              </span>
              <button
                className="btn btn-glass"
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
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

export default ManageStudents;

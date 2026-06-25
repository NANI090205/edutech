package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Enrolment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrolmentRepository extends JpaRepository<Enrolment, Long> {
    List<Enrolment> findByStudentId(Long studentId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    Optional<Enrolment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    long countByCourseId(Long courseId);

    @Query("SELECT MONTH(e.enrolledAt) as month, YEAR(e.enrolledAt) as year, COUNT(e) as count " +
           "FROM Enrolment e GROUP BY YEAR(e.enrolledAt), MONTH(e.enrolledAt) ORDER BY YEAR(e.enrolledAt), MONTH(e.enrolledAt)")
    List<Object[]> findMonthlyEnrolmentCounts();

    @Query("SELECT e.course.id, e.course.title, COUNT(e) as enrollCount " +
           "FROM Enrolment e GROUP BY e.course.id, e.course.title ORDER BY enrollCount DESC")
    List<Object[]> findPopularCourses(Pageable pageable);
}

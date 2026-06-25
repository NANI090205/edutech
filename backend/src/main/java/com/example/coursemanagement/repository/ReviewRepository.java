package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCourseIdOrderByCreatedAtDesc(Long courseId);
    Optional<Review> findByStudentIdAndCourseId(Long studentId, Long courseId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.course.id = :courseId")
    Double findAverageRatingByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.course.id = :courseId")
    Long countByCourseId(@Param("courseId") Long courseId);
}

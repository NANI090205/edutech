package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByStudentId(Long studentId);
    boolean existsByStudentIdAndLessonId(Long studentId, Long lessonId);
    Optional<LessonProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);
    long countByStudentIdAndLessonCourseId(Long studentId, Long courseId);
}

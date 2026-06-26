package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.LessonProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends MongoRepository<LessonProgress, String> {
    List<LessonProgress> findByStudentId(String studentId);
    boolean existsByStudentIdAndLessonId(String studentId, String lessonId);
    Optional<LessonProgress> findByStudentIdAndLessonId(String studentId, String lessonId);
    void deleteByLessonId(String lessonId);
    void deleteByLessonIdIn(List<String> lessonIds);
}

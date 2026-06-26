package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Lesson;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends MongoRepository<Lesson, String> {
    List<Lesson> findByCourseIdOrderByOrderIndex(String courseId);
    long countByCourseId(String courseId);
    void deleteByCourseId(String courseId);
}

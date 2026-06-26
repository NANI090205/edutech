package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByCourseIdOrderByCreatedAtDesc(String courseId);
    Optional<Review> findByStudentIdAndCourseId(String studentId, String courseId);
    boolean existsByStudentIdAndCourseId(String studentId, String courseId);

    @org.springframework.data.mongodb.repository.Aggregation(pipeline = {
        "{ $match: { 'courseId': ?0 } }",
        "{ $group: { _id: null, average: { $avg: '$rating' } } }"
    })
    Double findAverageRatingByCourseId(String courseId);

    long countByCourseId(String courseId);
    void deleteByCourseId(String courseId);
}

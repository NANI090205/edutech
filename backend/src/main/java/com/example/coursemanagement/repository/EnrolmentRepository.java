package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Enrolment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrolmentRepository extends MongoRepository<Enrolment, String> {
    List<Enrolment> findByStudentId(String studentId);
    boolean existsByStudentIdAndCourseId(String studentId, String courseId);
    Optional<Enrolment> findByStudentIdAndCourseId(String studentId, String courseId);
    long countByCourseId(String courseId);
    void deleteByCourseId(String courseId);

    @org.springframework.data.mongodb.repository.Aggregation(pipeline = {
        "{ $group: { _id: { year: { $year: '$enrolledAt' }, month: { $month: '$enrolledAt' } }, count: { $sum: 1 } } }",
        "{ $sort: { '_id.year': 1, '_id.month': 1 } }"
    })
    List<org.bson.Document> findMonthlyEnrolmentCounts();

    @org.springframework.data.mongodb.repository.Aggregation(pipeline = {
        "{ $group: { _id: '$courseId', enrollCount: { $sum: 1 } } }",
        "{ $sort: { enrollCount: -1 } }"
    })
    List<org.bson.Document> findPopularCourses(Pageable pageable);
}

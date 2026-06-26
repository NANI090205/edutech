package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {

    @Query("{ $and: [ " +
           "  { $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'instructor': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }," +
           "  { 'category': { $regex: ?1, $options: 'i' } }," +
           "  { 'instructor': { $regex: ?2, $options: 'i' } }" +
           "] }")
    Page<Course> searchCourses(String search, String category, String instructor, Pageable pageable);

    List<String> findDistinctCategoryBy();
}

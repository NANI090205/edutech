package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c WHERE " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(c.instructor) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%',:search,'%'))) " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category))" +
           "AND (:instructor IS NULL OR LOWER(c.instructor) LIKE LOWER(CONCAT('%',:instructor,'%')))")
    Page<Course> searchCourses(@Param("search") String search,
                               @Param("category") String category,
                               @Param("instructor") String instructor,
                               Pageable pageable);

    List<String> findDistinctCategoryBy();
}

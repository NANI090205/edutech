package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.ReviewDTO;
import com.example.coursemanagement.entity.Course;
import com.example.coursemanagement.entity.Review;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.BadRequestException;
import com.example.coursemanagement.exception.ResourceNotFoundException;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.repository.EnrolmentRepository;
import com.example.coursemanagement.repository.ReviewRepository;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrolmentRepository enrolmentRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository,
                         CourseRepository courseRepository, EnrolmentRepository enrolmentRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrolmentRepository = enrolmentRepository;
    }

    @Transactional
    public ReviewDTO submitReview(String studentId, String courseId, Integer rating, String comment) {
        if (!enrolmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new BadRequestException("You must be enrolled in this course to leave a review");
        }
        if (reviewRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            // Update existing review
            Review existing = reviewRepository.findByStudentIdAndCourseId(studentId, courseId).get();
            existing.setRating(rating);
            existing.setComment(comment);
            return toDTO(reviewRepository.save(existing));
        }

        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Review review = Review.builder()
                .studentId(studentId)
                .courseId(courseId)
                .rating(rating)
                .comment(comment)
                .build();

        return toDTO(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getCourseReviews(String courseId) {
        return reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewDTO getMyReview(String studentId, String courseId) {
        return reviewRepository.findByStudentIdAndCourseId(studentId, courseId)
                .map(this::toDTO)
                .orElse(null);
    }

    private ReviewDTO toDTO(Review review) {
        User student = userRepository.findById(review.getStudentId()).orElse(null);
        Course course = courseRepository.findById(review.getCourseId()).orElse(null);
        return ReviewDTO.builder()
                .id(review.getId())
                .studentId(student != null ? student.getId() : null)
                .studentName(student != null ? student.getName() : null)
                .studentProfileImage(student != null ? student.getProfileImage() : null)
                .courseId(course != null ? course.getId() : null)
                .courseTitle(course != null ? course.getTitle() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

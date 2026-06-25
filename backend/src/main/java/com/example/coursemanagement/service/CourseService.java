package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.CourseDTO;
import com.example.coursemanagement.entity.Course;
import com.example.coursemanagement.entity.Notification;
import com.example.coursemanagement.entity.Role;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.ResourceNotFoundException;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.repository.EnrolmentRepository;
import com.example.coursemanagement.repository.LessonRepository;
import com.example.coursemanagement.repository.ReviewRepository;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final ReviewRepository reviewRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CourseService(CourseRepository courseRepository, ReviewRepository reviewRepository,
                         LessonRepository lessonRepository, UserRepository userRepository,
                         NotificationService notificationService) {
        this.courseRepository = courseRepository;
        this.reviewRepository = reviewRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<CourseDTO> searchCourses(String search, String category, String instructor, Pageable pageable) {
        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;
        String categoryParam = (category != null && !category.isBlank()) ? category.trim() : null;
        String instructorParam = (instructor != null && !instructor.isBlank()) ? instructor.trim() : null;
        return courseRepository.searchCourses(searchParam, categoryParam, instructorParam, pageable)
                .map(this::convertToDTO);
    }

    public List<String> getCategories() {
        return courseRepository.findDistinctCategoryBy().stream()
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return convertToDTO(course);
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
        Course course = Course.builder()
                .title(courseDTO.getTitle())
                .description(courseDTO.getDescription())
                .duration(courseDTO.getDuration())
                .instructor(courseDTO.getInstructor())
                .category(courseDTO.getCategory())
                .tags(courseDTO.getTags())
                .startDate(courseDTO.getStartDate())
                .endDate(courseDTO.getEndDate())
                .deadline(courseDTO.getDeadline())
                .build();

        Course savedCourse = courseRepository.save(course);

        // Notify all students about the new course
        List<User> students = userRepository.findByRole(Role.STUDENT);
        notificationService.notifyAllStudents(students,
                "📚 New course available: \"" + savedCourse.getTitle() + "\"",
                Notification.NotificationType.COURSE_ADDED);

        return convertToDTO(savedCourse);
    }

    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        course.setTitle(courseDTO.getTitle());
        course.setDescription(courseDTO.getDescription());
        course.setDuration(courseDTO.getDuration());
        course.setInstructor(courseDTO.getInstructor());
        course.setCategory(courseDTO.getCategory());
        course.setTags(courseDTO.getTags());
        course.setStartDate(courseDTO.getStartDate());
        course.setEndDate(courseDTO.getEndDate());
        course.setDeadline(courseDTO.getDeadline());

        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }

    public CourseDTO convertToDTO(Course course) {
        Double avgRating = reviewRepository.findAverageRatingByCourseId(course.getId());
        Long reviewCount = reviewRepository.countByCourseId(course.getId());
        long lessonCount = lessonRepository.countByCourseId(course.getId());

        return CourseDTO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .duration(course.getDuration())
                .instructor(course.getInstructor())
                .category(course.getCategory())
                .tags(course.getTags())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .deadline(course.getDeadline())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                .lessonCount((int) lessonCount)
                .createdAt(course.getCreatedAt())
                .build();
    }
}

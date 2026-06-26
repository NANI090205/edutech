package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.EnrolmentDTO;
import com.example.coursemanagement.entity.Course;
import com.example.coursemanagement.entity.Enrolment;
import com.example.coursemanagement.entity.Notification;
import com.example.coursemanagement.entity.Role;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.BadRequestException;
import com.example.coursemanagement.exception.ResourceNotFoundException;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.repository.EnrolmentRepository;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrolmentService {

    private final EnrolmentRepository enrolmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final NotificationService notificationService;

    public EnrolmentService(EnrolmentRepository enrolmentRepository, UserRepository userRepository,
                            CourseRepository courseRepository, NotificationService notificationService) {
        this.enrolmentRepository = enrolmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public EnrolmentDTO enrol(String studentId, String courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (enrolmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new BadRequestException("You are already enrolled in this course");
        }

        Enrolment enrolment = Enrolment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .build();

        Enrolment savedEnrolment = enrolmentRepository.save(enrolment);

        // Notify all admins about new enrollment
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        admins.forEach(admin -> notificationService.createNotification(
                admin.getId(),
                "🎓 " + student.getName() + " enrolled in \"" + course.getTitle() + "\"",
                Notification.NotificationType.NEW_ENROLLMENT));

        return convertToDTO(savedEnrolment, student, course);
    }

    @Transactional
    public void drop(String studentId, String courseId) {
        Enrolment enrolment = enrolmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrolment not found for student " + studentId + " and course " + courseId));

        enrolmentRepository.delete(enrolment);
    }

    public List<EnrolmentDTO> getStudentEnrolments(String studentId) {
        if (!userRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }

        return enrolmentRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private EnrolmentDTO convertToDTO(Enrolment enrolment) {
        User student = userRepository.findById(enrolment.getStudentId()).orElse(null);
        Course course = courseRepository.findById(enrolment.getCourseId()).orElse(null);
        return convertToDTO(enrolment, student, course);
    }

    private EnrolmentDTO convertToDTO(Enrolment enrolment, User student, Course course) {
        return EnrolmentDTO.builder()
                .id(enrolment.getId())
                .studentId(student != null ? student.getId() : null)
                .studentName(student != null ? student.getName() : null)
                .studentEmail(student != null ? student.getEmail() : null)
                .courseId(course != null ? course.getId() : null)
                .courseTitle(course != null ? course.getTitle() : null)
                .courseInstructor(course != null ? course.getInstructor() : null)
                .enrolledAt(enrolment.getEnrolledAt())
                .build();
    }
}

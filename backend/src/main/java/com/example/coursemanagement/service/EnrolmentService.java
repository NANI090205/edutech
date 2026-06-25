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
    public EnrolmentDTO enrol(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (enrolmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new BadRequestException("You are already enrolled in this course");
        }

        Enrolment enrolment = Enrolment.builder()
                .student(student)
                .course(course)
                .build();

        Enrolment savedEnrolment = enrolmentRepository.save(enrolment);

        // Notify all admins about new enrollment
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        admins.forEach(admin -> notificationService.createNotification(
                admin.getId(),
                "🎓 " + student.getName() + " enrolled in \"" + course.getTitle() + "\"",
                Notification.NotificationType.NEW_ENROLLMENT));

        return convertToDTO(savedEnrolment);
    }

    @Transactional
    public void drop(Long studentId, Long courseId) {
        Enrolment enrolment = enrolmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrolment not found for student " + studentId + " and course " + courseId));

        enrolmentRepository.delete(enrolment);
    }

    public List<EnrolmentDTO> getStudentEnrolments(Long studentId) {
        if (!userRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }

        return enrolmentRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private EnrolmentDTO convertToDTO(Enrolment enrolment) {
        return EnrolmentDTO.builder()
                .id(enrolment.getId())
                .studentId(enrolment.getStudent().getId())
                .studentName(enrolment.getStudent().getName())
                .studentEmail(enrolment.getStudent().getEmail())
                .courseId(enrolment.getCourse().getId())
                .courseTitle(enrolment.getCourse().getTitle())
                .courseInstructor(enrolment.getCourse().getInstructor())
                .enrolledAt(enrolment.getEnrolledAt())
                .build();
    }
}

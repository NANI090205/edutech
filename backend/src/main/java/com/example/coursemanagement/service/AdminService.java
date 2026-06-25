package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.CourseDTO;
import com.example.coursemanagement.dto.DashboardStatsDTO;
import com.example.coursemanagement.dto.StudentDTO;
import com.example.coursemanagement.entity.Course;
import com.example.coursemanagement.entity.Role;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.repository.EnrolmentRepository;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrolmentRepository enrolmentRepository;

    public AdminService(UserRepository userRepository, CourseRepository courseRepository, EnrolmentRepository enrolmentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrolmentRepository = enrolmentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalStudents = userRepository.findByRole(Role.STUDENT).size();
        long totalCourses = courseRepository.count();
        long totalEnrolments = enrolmentRepository.count();

        return DashboardStatsDTO.builder()
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .totalEnrolments(totalEnrolments)
                .build();
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudentsWithEnrolments() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        return students.stream().map(student -> {
            List<CourseDTO> enrolledCourses = enrolmentRepository.findByStudentId(student.getId()).stream()
                    .map(enrolment -> {
                        Course course = enrolment.getCourse();
                        return CourseDTO.builder()
                                .id(course.getId())
                                .title(course.getTitle())
                                .description(course.getDescription())
                                .duration(course.getDuration())
                                .instructor(course.getInstructor())
                                .createdAt(course.getCreatedAt())
                                .build();
                    })
                    .collect(Collectors.toList());

            return StudentDTO.builder()
                    .id(student.getId())
                    .name(student.getName())
                    .email(student.getEmail())
                    .createdAt(student.getCreatedAt())
                    .college(student.getCollege())
                    .branch(student.getBranch())
                    .mobile(student.getMobile())
                    .address(student.getAddress())
                    .linkedinUrl(student.getLinkedinUrl())
                    .enrolledCourses(enrolledCourses)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEnrolmentAnalytics() {
        List<Object[]> monthly = enrolmentRepository.findMonthlyEnrolmentCounts();
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (Object[] row : monthly) {
            Map<String, Object> entry = new HashMap<>();
            int month = ((Number) row[0]).intValue();
            int year = ((Number) row[1]).intValue();
            long count = ((Number) row[2]).longValue();
            String label = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
            entry.put("label", label);
            entry.put("count", count);
            monthlyData.add(entry);
        }

        List<Object[]> popular = enrolmentRepository.findPopularCourses(PageRequest.of(0, 5));
        List<Map<String, Object>> popularData = new ArrayList<>();
        for (Object[] row : popular) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("courseId", row[0]);
            entry.put("courseTitle", row[1]);
            entry.put("enrollCount", ((Number) row[2]).longValue());
            popularData.add(entry);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("monthlyEnrolments", monthlyData);
        result.put("popularCourses", popularData);
        return result;
    }

    @Transactional(readOnly = true)
    public String exportStudentsCSV() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Name,Email,College,Branch,Mobile,Joined\n");
        for (User s : students) {
            sb.append(csvEscape(String.valueOf(s.getId()))).append(",")
              .append(csvEscape(s.getName())).append(",")
              .append(csvEscape(s.getEmail())).append(",")
              .append(csvEscape(s.getCollege())).append(",")
              .append(csvEscape(s.getBranch())).append(",")
              .append(csvEscape(s.getMobile())).append(",")
              .append(csvEscape(s.getCreatedAt() != null ? s.getCreatedAt().toLocalDate().toString() : "")).append("\n");
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String exportEnrolmentsCSV() {
        StringBuilder sb = new StringBuilder();
        sb.append("EnrolmentID,StudentName,StudentEmail,CourseTitle,Instructor,EnrolledAt\n");
        enrolmentRepository.findAll().forEach(e -> {
            sb.append(csvEscape(String.valueOf(e.getId()))).append(",")
              .append(csvEscape(e.getStudent().getName())).append(",")
              .append(csvEscape(e.getStudent().getEmail())).append(",")
              .append(csvEscape(e.getCourse().getTitle())).append(",")
              .append(csvEscape(e.getCourse().getInstructor())).append(",")
              .append(csvEscape(e.getEnrolledAt() != null ? e.getEnrolledAt().toLocalDate().toString() : "")).append("\n");
        });
        return sb.toString();
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

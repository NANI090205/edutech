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
                        Course course = courseRepository.findById(enrolment.getCourseId()).orElse(null);
                        if (course == null) return null;
                        return CourseDTO.builder()
                                .id(course.getId())
                                .title(course.getTitle())
                                .description(course.getDescription())
                                .duration(course.getDuration())
                                .instructor(course.getInstructor())
                                .createdAt(course.getCreatedAt())
                                .build();
                    })
                    .filter(Objects::nonNull)
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
        List<org.bson.Document> monthly = enrolmentRepository.findMonthlyEnrolmentCounts();
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (org.bson.Document doc : monthly) {
            org.bson.Document idDoc = (org.bson.Document) doc.get("_id");
            if (idDoc == null) continue;
            int month = idDoc.getInteger("month");
            int year = idDoc.getInteger("year");
            long count = ((Number) doc.get("count")).longValue();
            String label = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
            Map<String, Object> entry = new HashMap<>();
            entry.put("label", label);
            entry.put("count", count);
            monthlyData.add(entry);
        }

        List<org.bson.Document> popular = enrolmentRepository.findPopularCourses(PageRequest.of(0, 5));
        List<Map<String, Object>> popularData = new ArrayList<>();
        for (org.bson.Document doc : popular) {
            String courseId = doc.getString("_id");
            if (courseId == null) continue;
            Course course = courseRepository.findById(courseId).orElse(null);
            String courseTitle = (course != null) ? course.getTitle() : "Unknown Course";
            long enrollCount = ((Number) doc.get("enrollCount")).longValue();

            Map<String, Object> entry = new HashMap<>();
            entry.put("courseId", courseId);
            entry.put("courseTitle", courseTitle);
            entry.put("enrollCount", enrollCount);
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
            User student = userRepository.findById(e.getStudentId()).orElse(null);
            Course course = courseRepository.findById(e.getCourseId()).orElse(null);
            if (student != null && course != null) {
                sb.append(csvEscape(String.valueOf(e.getId()))).append(",")
                  .append(csvEscape(student.getName())).append(",")
                  .append(csvEscape(student.getEmail())).append(",")
                  .append(csvEscape(course.getTitle())).append(",")
                  .append(csvEscape(course.getInstructor())).append(",")
                  .append(csvEscape(e.getEnrolledAt() != null ? e.getEnrolledAt().toLocalDate().toString() : "")).append("\n");
            }
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

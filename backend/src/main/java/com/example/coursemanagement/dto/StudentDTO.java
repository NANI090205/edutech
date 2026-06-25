package com.example.coursemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
    private String college;
    private String branch;
    private String mobile;
    private String address;
    private String linkedinUrl;
    private List<CourseDTO> enrolledCourses;
}

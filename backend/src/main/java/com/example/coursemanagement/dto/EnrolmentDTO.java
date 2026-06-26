package com.example.coursemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrolmentDTO {
    private String id;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String courseId;
    private String courseTitle;
    private String courseInstructor;
    private LocalDateTime enrolledAt;
}

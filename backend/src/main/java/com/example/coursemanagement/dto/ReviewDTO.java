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
public class ReviewDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentProfileImage;
    private Long courseId;
    private String courseTitle;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}

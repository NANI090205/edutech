package com.example.coursemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {

    private String id;

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    private String description;

    @NotBlank(message = "Duration is required")
    @Size(max = 50, message = "Duration cannot exceed 50 characters")
    private String duration;

    @NotBlank(message = "Instructor name is required")
    @Size(max = 100, message = "Instructor name cannot exceed 100 characters")
    private String instructor;

    private String category;
    private String tags;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate deadline;

    private Double averageRating;
    private Long reviewCount;
    private Integer lessonCount;

    private LocalDateTime createdAt;
}

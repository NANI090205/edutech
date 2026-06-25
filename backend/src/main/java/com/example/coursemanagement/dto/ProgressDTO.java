package com.example.coursemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDTO {
    private Long courseId;
    private String courseTitle;
    private int totalLessons;
    private int completedLessons;
    private double progressPercentage;
    private boolean certificateEligible;
    private List<LessonDTO> lessons;
}

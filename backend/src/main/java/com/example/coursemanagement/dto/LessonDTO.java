package com.example.coursemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDTO {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer durationMinutes;
    private boolean completed; // set per-student context
}

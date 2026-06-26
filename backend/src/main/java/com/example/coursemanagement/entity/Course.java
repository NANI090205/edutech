package com.example.coursemanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    private String id;

    private String title;

    private String description;

    private String duration;

    private String instructor;

    private String category;

    private String tags;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate deadline;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

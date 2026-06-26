package com.example.coursemanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrolment {

    @Id
    private String id;

    private String studentId;

    private String courseId;

    @Builder.Default
    private LocalDateTime enrolledAt = LocalDateTime.now();
}

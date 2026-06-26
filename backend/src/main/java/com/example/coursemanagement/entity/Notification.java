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
public class Notification {

    public enum NotificationType {
        COURSE_ADDED, NEW_ENROLLMENT, COURSE_UPDATED, SYSTEM
    }

    @Id
    private String id;

    private String userId;

    private String message;

    private NotificationType type;

    @Builder.Default
    private boolean read = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

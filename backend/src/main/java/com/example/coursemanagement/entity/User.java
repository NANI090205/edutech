package com.example.coursemanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
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
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Role role;

    private String profileImage;

    private String mobile;

    private String address;

    private String college;

    private String branch;

    private String linkedinUrl;

    private String githubUrl;

    private String bio;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

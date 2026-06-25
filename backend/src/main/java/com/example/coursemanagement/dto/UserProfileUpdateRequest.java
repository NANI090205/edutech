package com.example.coursemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    private String password;

    private String profileImage;
    private String mobile;
    private String address;
    private String college;
    private String branch;
    private String linkedinUrl;
    private String githubUrl;
    private String bio;
}

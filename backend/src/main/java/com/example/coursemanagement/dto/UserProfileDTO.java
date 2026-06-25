package com.example.coursemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String profileImage;
    private String mobile;
    private String address;
    private String college;
    private String branch;
    private String linkedinUrl;
    private String githubUrl;
    private String bio;
}

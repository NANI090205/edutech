package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.UserProfileDTO;
import com.example.coursemanagement.dto.UserProfileUpdateRequest;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.BadRequestException;
import com.example.coursemanagement.exception.ResourceNotFoundException;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileDTO getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return convertToDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserProfile(String userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String trimmedEmail = request.getEmail().trim();
        // Check if email is already taken by another user
        if (!user.getEmail().equalsIgnoreCase(trimmedEmail) && userRepository.existsByEmail(trimmedEmail)) {
            throw new BadRequestException("Email is already in use by another account");
        }

        user.setName(request.getName().trim());
        user.setEmail(trimmedEmail);
        user.setProfileImage(request.getProfileImage());
        user.setMobile(request.getMobile());
        user.setAddress(request.getAddress());
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setLinkedinUrl(request.getLinkedinUrl());
        user.setGithubUrl(request.getGithubUrl());
        user.setBio(request.getBio());

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            if (request.getPassword().trim().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters long");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    private UserProfileDTO convertToDTO(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .mobile(user.getMobile())
                .address(user.getAddress())
                .college(user.getCollege())
                .branch(user.getBranch())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .bio(user.getBio())
                .build();
    }
}

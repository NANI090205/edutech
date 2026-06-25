package com.example.coursemanagement.controller;

import com.example.coursemanagement.dto.UserProfileDTO;
import com.example.coursemanagement.dto.UserProfileUpdateRequest;
import com.example.coursemanagement.security.UserDetailsImpl;
import com.example.coursemanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserProfileDTO profile = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        UserProfileDTO updatedProfile = userService.updateUserProfile(userDetails.getId(), request);
        return ResponseEntity.ok(updatedProfile);
    }
}

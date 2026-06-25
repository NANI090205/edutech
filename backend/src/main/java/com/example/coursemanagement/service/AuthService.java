package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.LoginRequest;
import com.example.coursemanagement.dto.LoginResponse;
import com.example.coursemanagement.dto.RegisterRequest;
import com.example.coursemanagement.entity.Role;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.BadRequestException;
import com.example.coursemanagement.repository.UserRepository;
import com.example.coursemanagement.security.JwtUtil;
import com.example.coursemanagement.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Email is already in use");
        }

        Role role = Role.STUDENT;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role. Role must be either STUDENT or ADMIN.");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userDetails.getUser();

        String jwt = jwtUtil.generateToken(userDetails, user.getRole().name());

        return LoginResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .build();
    }
}

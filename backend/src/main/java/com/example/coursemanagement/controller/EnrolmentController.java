package com.example.coursemanagement.controller;

import com.example.coursemanagement.dto.EnrolmentDTO;
import com.example.coursemanagement.exception.BadRequestException;
import com.example.coursemanagement.security.UserDetailsImpl;
import com.example.coursemanagement.service.EnrolmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrolments")
public class EnrolmentController {

    private final EnrolmentService enrolmentService;

    public EnrolmentController(EnrolmentService enrolmentService) {
        this.enrolmentService = enrolmentService;
    }

    @PostMapping("/enrol")
    public ResponseEntity<EnrolmentDTO> enrol(@RequestBody Map<String, String> payload,
                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String courseId = payload.get("courseId");
        if (courseId == null) {
            throw new BadRequestException("Course ID is required in the body");
        }
        EnrolmentDTO result = enrolmentService.enrol(userDetails.getId(), courseId);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @DeleteMapping("/drop/{courseId}")
    public ResponseEntity<Map<String, String>> drop(@PathVariable String courseId,
                                                   @AuthenticationPrincipal UserDetailsImpl userDetails) {
        enrolmentService.drop(userDetails.getId(), courseId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Course dropped successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<EnrolmentDTO>> getMyEnrolments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<EnrolmentDTO> enrolments = enrolmentService.getStudentEnrolments(userDetails.getId());
        return ResponseEntity.ok(enrolments);
    }
}

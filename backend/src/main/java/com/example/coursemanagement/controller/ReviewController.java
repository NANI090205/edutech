package com.example.coursemanagement.controller;

import com.example.coursemanagement.dto.ReviewDTO;
import com.example.coursemanagement.security.UserDetailsImpl;
import com.example.coursemanagement.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> submitReview(@RequestBody Map<String, Object> payload,
                                                  @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String courseId = payload.get("courseId").toString();
        Integer rating = Integer.valueOf(payload.get("rating").toString());
        String comment = payload.get("comment") != null ? payload.get("comment").toString() : "";
        ReviewDTO review = reviewService.submitReview(userDetails.getId(), courseId, rating, comment);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ReviewDTO>> getCourseReviews(@PathVariable String courseId) {
        return ResponseEntity.ok(reviewService.getCourseReviews(courseId));
    }

    @GetMapping("/my/{courseId}")
    public ResponseEntity<ReviewDTO> getMyReview(@PathVariable String courseId,
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(reviewService.getMyReview(userDetails.getId(), courseId));
    }
}

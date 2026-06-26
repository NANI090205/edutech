package com.example.coursemanagement.controller;

import com.example.coursemanagement.dto.LessonDTO;
import com.example.coursemanagement.dto.ProgressDTO;
import com.example.coursemanagement.security.UserDetailsImpl;
import com.example.coursemanagement.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    // Get all lessons for a course (with student completion flag)
    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<List<LessonDTO>> getLessons(@PathVariable String courseId) {
        return ResponseEntity.ok(progressService.getLessonsForCourse(courseId));
    }

    // Get full progress for a student in a course
    @GetMapping("/progress/{courseId}")
    public ResponseEntity<ProgressDTO> getProgress(@PathVariable String courseId,
                                                   @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(progressService.getCourseProgress(userDetails.getId(), courseId));
    }

    // Mark a lesson as complete
    @PostMapping("/progress/complete")
    public ResponseEntity<Map<String, String>> complete(@RequestBody Map<String, String> payload,
                                                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String lessonId = payload.get("lessonId");
        progressService.markLessonComplete(userDetails.getId(), lessonId);
        return ResponseEntity.ok(Map.of("message", "Lesson marked as complete"));
    }

    // Mark a lesson as incomplete (uncheck)
    @PostMapping("/progress/incomplete")
    public ResponseEntity<Map<String, String>> incomplete(@RequestBody Map<String, String> payload,
                                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String lessonId = payload.get("lessonId");
        progressService.markLessonIncomplete(userDetails.getId(), lessonId);
        return ResponseEntity.ok(Map.of("message", "Lesson marked as incomplete"));
    }

    // Admin: add lesson to a course
    @PostMapping("/admin/courses/{courseId}/lessons")
    public ResponseEntity<LessonDTO> addLesson(@PathVariable String courseId,
                                               @RequestBody LessonDTO lessonDTO) {
        return ResponseEntity.ok(progressService.addLesson(courseId, lessonDTO));
    }

    // Admin: delete a lesson
    @DeleteMapping("/admin/lessons/{lessonId}")
    public ResponseEntity<Map<String, String>> deleteLesson(@PathVariable String lessonId) {
        progressService.deleteLesson(lessonId);
        return ResponseEntity.ok(Map.of("message", "Lesson deleted"));
    }
}

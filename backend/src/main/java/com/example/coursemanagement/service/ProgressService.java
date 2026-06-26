package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.LessonDTO;
import com.example.coursemanagement.dto.ProgressDTO;
import com.example.coursemanagement.entity.Lesson;
import com.example.coursemanagement.entity.LessonProgress;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.BadRequestException;
import com.example.coursemanagement.exception.ResourceNotFoundException;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.repository.LessonProgressRepository;
import com.example.coursemanagement.repository.LessonRepository;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public ProgressService(LessonRepository lessonRepository,
                           LessonProgressRepository lessonProgressRepository,
                           CourseRepository courseRepository,
                           UserRepository userRepository) {
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProgressDTO getCourseProgress(String studentId, String courseId) {
        var course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndex(courseId);
        int total = lessons.size();

        List<LessonDTO> lessonDTOs = lessons.stream().map(lesson -> {
            boolean completed = lessonProgressRepository.existsByStudentIdAndLessonId(studentId, lesson.getId());
            return LessonDTO.builder()
                    .id(lesson.getId())
                    .courseId(courseId)
                    .title(lesson.getTitle())
                    .description(lesson.getDescription())
                    .orderIndex(lesson.getOrderIndex())
                    .durationMinutes(lesson.getDurationMinutes())
                    .completed(completed)
                    .build();
        }).collect(Collectors.toList());

        long completedCount = lessonDTOs.stream().filter(LessonDTO::isCompleted).count();
        double progressPct = total == 0 ? 0 : (completedCount * 100.0 / total);

        return ProgressDTO.builder()
                .courseId(courseId)
                .courseTitle(course.getTitle())
                .totalLessons(total)
                .completedLessons((int) completedCount)
                .progressPercentage(progressPct)
                .certificateEligible(total > 0 && completedCount == total)
                .lessons(lessonDTOs)
                .build();
    }

    @Transactional
    public void markLessonComplete(String studentId, String lessonId) {
        if (lessonProgressRepository.existsByStudentIdAndLessonId(studentId, lessonId)) {
            throw new BadRequestException("Lesson already marked as complete");
        }
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + lessonId));

        LessonProgress progress = LessonProgress.builder()
                .studentId(studentId)
                .lessonId(lessonId)
                .build();
        lessonProgressRepository.save(progress);
    }

    @Transactional
    public void markLessonIncomplete(String studentId, String lessonId) {
        lessonProgressRepository.findByStudentIdAndLessonId(studentId, lessonId)
                .ifPresent(lessonProgressRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<LessonDTO> getLessonsForCourse(String courseId) {
        return lessonRepository.findByCourseIdOrderByOrderIndex(courseId).stream()
                .map(lesson -> LessonDTO.builder()
                        .id(lesson.getId())
                        .courseId(courseId)
                        .title(lesson.getTitle())
                        .description(lesson.getDescription())
                        .orderIndex(lesson.getOrderIndex())
                        .durationMinutes(lesson.getDurationMinutes())
                        .completed(false)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonDTO addLesson(String courseId, LessonDTO dto) {
        var course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        long count = lessonRepository.countByCourseId(courseId);
        Lesson lesson = Lesson.builder()
                .courseId(courseId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .orderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : (int)(count + 1))
                .durationMinutes(dto.getDurationMinutes())
                .build();

        Lesson saved = lessonRepository.save(lesson);
        return LessonDTO.builder()
                .id(saved.getId())
                .courseId(courseId)
                .title(saved.getTitle())
                .description(saved.getDescription())
                .orderIndex(saved.getOrderIndex())
                .durationMinutes(saved.getDurationMinutes())
                .completed(false)
                .build();
    }

    @Transactional
    public void deleteLesson(String lessonId) {
        lessonProgressRepository.deleteByLessonId(lessonId);
        lessonRepository.deleteById(lessonId);
    }
}

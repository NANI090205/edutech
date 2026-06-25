package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.NotificationDTO;
import com.example.coursemanagement.entity.Notification;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.ResourceNotFoundException;
import com.example.coursemanagement.repository.NotificationRepository;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(Long userId, String message, Notification.NotificationType type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAllStudents(List<User> students, String message, Notification.NotificationType type) {
        for (User student : students) {
            Notification n = Notification.builder()
                    .user(student)
                    .message(message)
                    .type(type)
                    .read(false)
                    .build();
            notificationRepository.save(n);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(20)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (n.getUser().getId().equals(userId)) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : null)
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

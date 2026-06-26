package com.example.coursemanagement.service;

import com.example.coursemanagement.dto.NotificationDTO;
import com.example.coursemanagement.entity.Notification;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.exception.ResourceNotFoundException;
import com.example.coursemanagement.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(String userId, String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAllStudents(List<User> students, String message, Notification.NotificationType type) {
        List<Notification> notifications = students.stream().map(student -> Notification.builder()
                .userId(student.getId())
                .message(message)
                .type(type)
                .build()).collect(Collectors.toList());
        notificationRepository.saveAll(notifications);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(20)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(String notificationId, String userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (userId.equals(n.getUserId())) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    @Transactional
    public void markAllAsRead(String userId) {
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

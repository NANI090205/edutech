package com.example.coursemanagement.config;

import com.example.coursemanagement.entity.Course;
import com.example.coursemanagement.entity.Role;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, CourseRepository courseRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding users...");
            List<User> initialUsers = java.util.Arrays.asList(
                User.builder()
                        .name("Admin")
                        .email("admin@example.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.ADMIN)
                        .build(),
                User.builder()
                        .name("John Doe")
                        .email("john.doe@example.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.STUDENT)
                        .build(),
                User.builder()
                        .name("Alice Smith")
                        .email("alice.smith@example.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.STUDENT)
                        .build(),
                User.builder()
                        .name("Bob Johnson")
                        .email("bob.johnson@example.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.STUDENT)
                        .build()
            );
            userRepository.saveAll(initialUsers);
        }

        if (courseRepository.count() == 0) {
            System.out.println("Seeding courses...");
            List<Course> initialCourses = java.util.Arrays.asList(
                Course.builder()
                        .title("Java Programming Masterclass")
                        .description("Learn Java from scratch.")
                        .instructor("Jane Instructor")
                        .duration("12 weeks")
                        .category("Programming")
                        .build(),
                Course.builder()
                        .title("Spring Boot for Beginners")
                        .description("Master Spring Boot framework.")
                        .instructor("Jane Instructor")
                        .duration("8 weeks")
                        .category("Programming")
                        .build()
            );
            courseRepository.saveAll(initialCourses);
        }
    }
}

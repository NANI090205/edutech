-- Create database if not exists
CREATE DATABASE IF NOT EXISTS student_course_mgmt;
USE student_course_mgmt;

-- Drop tables if they exist
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- 1. Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create courses table
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration VARCHAR(50) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create enrolments table
CREATE TABLE enrolments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enrolment_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrolment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_course (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA (All passwords are BCrypt hashed version of 'password')
-- BCrypt Hash: $2a$10$gRsp2tS4B4/n4wWvL8mve.D0E2uQv2KjYn7v1Q1t3hE5dG3.yN5qG
-- =========================================================================

-- Seed Users (1 Admin, 3 Students)
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Admin', 'admin@example.com', '$2a$10$gRsp2tS4B4/n4wWvL8mve.D0E2uQv2KjYn7v1Q1t3hE5dG3.yN5qG', 'ADMIN'),
(2, 'John Doe', 'john.doe@example.com', '$2a$10$gRsp2tS4B4/n4wWvL8mve.D0E2uQv2KjYn7v1Q1t3hE5dG3.yN5qG', 'STUDENT'),
(3, 'Alice Smith', 'alice.smith@example.com', '$2a$10$gRsp2tS4B4/n4wWvL8mve.D0E2uQv2KjYn7v1Q1t3hE5dG3.yN5qG', 'STUDENT'),
(4, 'Bob Johnson', 'bob.johnson@example.com', '$2a$10$gRsp2tS4B4/n4wWvL8mve.D0E2uQv2KjYn7v1Q1t3hE5dG3.yN5qG', 'STUDENT');

-- Seed Courses (5 Courses)
INSERT INTO courses (id, title, description, duration, instructor) VALUES
(1, 'Introduction to Java', 'Learn the basics of Java programming language including syntax, variables, OOP concepts, and exception handling.', '6 Weeks', 'Dr. Sarah Connor'),
(2, 'Spring Boot Microservices', 'Master building enterprise-grade REST APIs and microservices using Spring Boot, Spring Cloud, and Hibernate.', '8 Weeks', 'Prof. Charles Xavier'),
(3, 'React.js Modern Frontend Development', 'Build dynamic, responsive web interfaces using React 18, React Router v6, context API, and hooks.', '6 Weeks', 'Jane Foster'),
(4, 'Database Systems with MySQL', 'Deep dive into relational database concepts, SQL queries, database design, indexing, and joins using MySQL.', '5 Weeks', 'Bruce Banner'),
(5, 'Full-Stack Web Development Integration', 'Learn how to connect a React.js frontend application with a Spring Boot secure backend using JWT.', '4 Weeks', 'Tony Stark');

-- Seed Enrolments (A few sample enrolments)
INSERT INTO enrolments (id, student_id, course_id) VALUES
(1, 2, 1), -- John Doe enrolled in Introduction to Java
(2, 2, 3), -- John Doe enrolled in React.js
(3, 3, 2), -- Alice Smith enrolled in Spring Boot
(4, 3, 3), -- Alice Smith enrolled in React.js
(5, 4, 1); -- Bob Johnson enrolled in Introduction to Java

# Student Course Management System

A production-ready, full-stack Student Course Management System built using Spring Boot (Java), React.js, and MySQL. It features JWT-based role authentication, course catalog management, student registration, enrolments tracking, and admin overview dashboards.

---

## 🚀 Tech Stack

### Backend
* **Language & Runtime**: Java 17
* **Framework**: Spring Boot 3.x, Spring Data JPA, Spring Security (Stateless JWT)
* **ORM**: Hibernate
* **Dependency Manager**: Maven
* **Libraries**: Lombok, Java validation API, JJWT (Json Web Token)

### Frontend
* **UI Library**: React.js 18
* **Styling**: Bootstrap 5 + Custom Modern Dark CSS Variables
* **API Client**: Axios (with interceptors for injecting JWT)
* **Routing**: React Router v6 (using Role-based route guard blocks)

### Database
* **Engine**: MySQL 8.x

---

## 📂 Project Structure

```
f:\resume projects\
├── backend\                # Spring Boot Maven Project
│   ├── pom.xml             # Dependencies file
│   └── src\main\
│       ├── java\com\example\coursemanagement\
│       │   ├── config\     # SecurityConfig & WebConfig (CORS)
│       │   ├── controller\ # REST Controllers (Auth, Course, Enrolment, Admin)
│       │   ├── dto\        # Request/Response Data Transfer Objects
│       │   ├── entity\     # Hibernate JPA Entities (User, Course, Enrolment, Role)
│       │   ├── exception\  # Custom exceptions & global @ControllerAdvice handler
│       │   ├── repository\ # JPA DB repositories
│       │   ├── security\   # JWT filters, Util keys and UserDetails implementations
│       │   └── service\    # Business logic layer
│       └── resources\
│           └── application.properties # Server port, DB URL & JWT secrets
├── frontend\               # React Frontend SPA
│   ├── package.json        # Node.js dependencies
│   ├── public\             # Index.html and static assets
│   └── src\
│       ├── api\            # Axios client with request/response interceptors
│       ├── components\     # Reusable components (e.g. Navbar)
│       ├── context\        # AuthContext for login/logout and session management
│       ├── pages\          # Page components (Login, Register, Dashboards, Manage)
│       ├── App.css         # Theme overrides (slate color variables, glassmorphic styles)
│       ├── App.jsx         # App router and Route guards
│       └── index.js        # React DOM mount point
├── schema.sql              # MySQL database setup and seed dataset script
└── postman_collection.json # API endpoints testing collection
```

---

## 🗄️ Database Schema & Seed Data

The database uses three tables. Check [schema.sql](file:///f:/resume%20projects/schema.sql) for details.

1. **`users`**:
   * Columns: `id` (PK), `name`, `email` (Unique), `password` (BCrypt), `role` (`ADMIN`, `STUDENT`), `created_at`
2. **`courses`**:
   * Columns: `id` (PK), `title`, `description` (Text), `duration`, `instructor`, `created_at`
3. **`enrolments`**:
   * Columns: `id` (PK), `student_id` (FK -> users.id), `course_id` (FK -> courses.id), `enrolled_at`
   * Unique constraint on `(student_id, course_id)` prevents double registration.

### 👥 Seed Accounts
All accounts use the password: `password`
* **Admin**: `admin@example.com`
* **Students**:
  * `john.doe@example.com`
  * `alice.smith@example.com`
  * `bob.johnson@example.com`

---

## 🛠️ Setup & Running Instructions

### Phase 1: Database Setup
1. Log in to your local MySQL server.
2. Run the SQL script from [schema.sql](file:///f:/resume%20projects/schema.sql):
   ```bash
   mysql -u root -p < schema.sql
   ```
   *Note: This creates the database `student_course_mgmt`, sets up the tables, and seeds the sample data.*

### Phase 2: Backend Setup
1. Navigate to the `backend` folder.
2. Open `src/main/resources/application.properties` and verify your MySQL connection settings:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/student_course_mgmt?...
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Run the Spring Boot application using Maven:
   ```bash
   mvn clean spring-boot:run
   ```
   *The backend server will launch on `http://localhost:8080`.*

### Phase 3: Frontend Setup
1. Navigate to the `frontend` folder.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm start
   ```
   *The React application will open automatically in your browser at `http://localhost:3000`.*

---

## 🔌 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | None | Open | Create student or admin account |
| **POST** | `/api/auth/login` | None | Open | Authenticate user, returns JWT and user roles |

### 📚 Course Catalog (`/api/courses`)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/courses` | JWT | `STUDENT`, `ADMIN` | List all available courses |
| **GET** | `/api/courses/{id}` | JWT | `STUDENT`, `ADMIN` | Retrieve single course by ID |
| **POST** | `/api/courses` | JWT | `ADMIN` | Add new course * |
| **PUT** | `/api/courses/{id}` | JWT | `ADMIN` | Update course details * |
| **DELETE**| `/api/courses/{id}` | JWT | `ADMIN` | Delete course from catalog * |

### 🎓 Enrolments Management (`/api/enrolments`)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/enrolments/enrol` | JWT | `STUDENT` | Enroll active student in a course |
| **DELETE**| `/api/enrolments/drop/{courseId}`| JWT | `STUDENT` | Drop course |
| **GET** | `/api/enrolments/my` | JWT | `STUDENT` | List active student's course enrolments |

### 💻 Admin Panel (`/api/admin`)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/admin/students` | JWT | `ADMIN` | List all students and their enrolments |
| **GET** | `/api/admin/dashboard` | JWT | `ADMIN` | Get counts (Total courses, enrolments, students) |

---

## 🧪 Testing with Postman
1. Open Postman.
2. Click **Import** and select the [postman_collection.json](file:///f:/resume%20projects/postman_collection.json) file.
3. Configure the `baseUrl` collection variable (defaults to `http://localhost:8080`).
4. Trigger the **Login User** request. The test script will automatically store the JWT in the global environment variable `jwt_token`.
5. Run the other endpoints; they will automatically pass the `{{jwt_token}}` header.

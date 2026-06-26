# Student Course Management System

A production-ready, full-stack Student Course Management System built using Spring Boot (Java), React.js, and MongoDB. It features JWT-based role authentication, course catalog management, student registration, enrolments tracking, and admin overview dashboards.

---

## 🚀 Tech Stack

### Backend
* **Language & Runtime**: Java 17
* **Framework**: Spring Boot 3.x, Spring Data MongoDB, Spring Security (Stateless JWT)
* **Dependency Manager**: Maven (Wrapper included)
* **Libraries**: Lombok, Java validation API, JJWT (Json Web Token)

### Frontend
* **UI Library**: React.js 18
* **Styling**: Bootstrap 5 + Custom Modern Dark CSS Variables
* **API Client**: Axios (with interceptors for injecting JWT)
* **Routing**: React Router v6 (using Role-based route guard blocks)

### Database
* **Engine**: MongoDB (Atlas)

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
└── postman_collection.json # API endpoints testing collection
```

---

## 🗄️ Database Collections & Seed Data

The database uses MongoDB collections. Data is automatically seeded on startup if the collections are empty.

1. **`users`**:
   * Fields: `id` (String PK), `name`, `email` (Unique), `password` (BCrypt), `role` (`ADMIN`, `STUDENT`), `createdAt`
2. **`courses`**:
   * Fields: `id` (String PK), `title`, `description`, `duration`, `instructor`, `createdAt`
3. **`enrolments`**:
   * Fields: `id` (String PK), `studentId` (String reference), `courseId` (String reference), `enrolledAt`
   * Checked in the service layer to prevent duplicate enrolments.
4. **`lessons`**:
   * Fields: `id` (String PK), `courseId` (String reference), `title`, `description`, `orderIndex`, `durationMinutes`
5. **`lessonProgress`**:
   * Fields: `id` (String PK), `studentId` (String reference), `lessonId` (String reference), `completedAt`
6. **`reviews`**:
   * Fields: `id` (String PK), `studentId` (String reference), `courseId` (String reference), `rating`, `comment`, `createdAt`
7. **`notifications`**:
   * Fields: `id` (String PK), `userId` (String reference), `message`, `type`, `read`, `createdAt`

### 👥 Seed Accounts
All accounts use the password: `password`
* **Admin**: `admin@example.com`
* **Students**:
  * `john.doe@example.com`
  * `alice.smith@example.com`
  * `bob.johnson@example.com`

---

## 🛠️ Setup & Running Instructions

The project uses a pure MongoDB database (configured for MongoDB Atlas) and includes a Maven Wrapper so that no global Maven installation is required.

### Step 1: Environment Configuration
1. Copy `.env.example` in the root folder to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure the variables inside `.env` with your MongoDB Atlas connection string (`MONGODB_URI`) and JWT configurations.

### Step 2: One-Command Startup
* **Windows**: Double-click [start.bat](file:///c:/Users/jagap/Downloads/edutech/start.bat) or run it from the command line:
  ```cmd
  start.bat
  ```
* **Linux / macOS**: Make the script executable and run it:
  ```bash
  chmod +x start.sh stop.sh
  ./start.sh
  ```
This script will check dependencies, install frontend packages, run the Spring Boot backend via the Maven Wrapper, verify connection readiness, and start the React frontend (opening your browser automatically).

### Step 3: Shutdown
* **Windows**: Run [stop.bat](file:///c:/Users/jagap/Downloads/edutech/stop.bat) to terminate backend and frontend servers:
  ```cmd
  stop.bat
  ```
* **Linux / macOS**: Run `./stop.sh`:
  ```bash
  ./stop.sh
  ```

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

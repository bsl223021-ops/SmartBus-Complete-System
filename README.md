# 🚌 SmartBus - Complete Attendance & Safety Monitoring System

A full-stack solution for school bus attendance tracking and safety monitoring, comprising:
- **Backend**: Spring Boot 3.3.5 REST API with JWT authentication
- **Admin Portal**: React.js web application for administrators
- **Driver App**: React Native (Expo) mobile app for bus drivers
- **Parent App**: React Native (Expo) mobile app for parents

---

## 📁 Project Structure

```
SmartBus-Complete-System/
├── backend/                          # Spring Boot backend
│   ├── build.gradle
│   └── src/
│       └── main/
│           ├── java/com/smartbus/
│           │   ├── SmartBusApplication.java
│           │   ├── models/           # Entity models
│           │   ├── repositories/     # Spring Data JPA repositories
│           │   ├── services/         # Business logic
│           │   ├── controllers/      # REST controllers
│           │   ├── dto/              # Data Transfer Objects
│           │   ├── config/           # Security & JWT config
│           │   ├── exceptions/       # Exception handling
│           │   └── utils/            # Utilities (QR, Location, Notifications)
│           └── resources/
│               └── application.properties
├── admin-portal/                     # React.js admin web app
│   ├── public/
│   ├── src/
│   │   ├── pages/                   # Dashboard, Students, Buses, Routes, Attendance
│   │   ├── components/              # Navigation
│   │   ├── services/                # API service layer
│   │   └── styles/                  # Global CSS
│   └── package.json
├── driver-app/                       # React Native driver app
│   ├── src/
│   │   ├── screens/                 # Login, Home, QRScanner, AttendanceHistory, Profile
│   │   ├── navigation/              # App navigation
│   │   ├── services/                # API, Location tracking
│   │   └── theme/                   # Design system
│   └── package.json
└── parent-app/                       # React Native parent app
    ├── src/
    │   ├── screens/                 # Login, Tracking, Notifications, History, Profile
    │   ├── navigation/              # App navigation
    │   ├── services/                # API service
    │   └── theme/                   # Design system
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Gradle 9+
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL (production) or H2 (development, included)

---

## 🖥️ Backend Setup

```bash
cd backend

# Run with H2 in-memory database (development)
gradle bootRun

# Run tests
gradle test
```

The backend starts on `http://localhost:8080`.

### Production Database (PostgreSQL)

Edit `backend/src/main/resources/application.properties` or set environment variables:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartbus
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## 🌐 Admin Portal Setup

```bash
cd admin-portal
npm install
npm start
```

Opens at `http://localhost:3000`. Set `REACT_APP_API_URL` to point to the backend.

---

## 📱 Driver App Setup

```bash
cd driver-app
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in your `.env` file.

---

## 📱 Parent App Setup

```bash
cd parent-app
npm install
npx expo start
```

---

## 🔐 API Authentication

All API endpoints (except `/api/auth/**`) require a JWT Bearer token.

```
Authorization: Bearer <token>
```

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/validate` | Validate token |

### Login Request

```json
{
  "email": "admin@smartbus.com",
  "password": "password"
}
```

### Login Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "admin@smartbus.com",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

---

## 📋 API Reference

### Students `/api/students`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students (optional: `?name=search`) |
| GET | `/api/students/{id}` | Get student by ID |
| POST | `/api/students` | Create student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |
| GET | `/api/students/{id}/qr` | Get student QR code (Base64 PNG) |

### Buses `/api/buses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buses` | Get all buses (optional: `?status=ACTIVE`) |
| GET | `/api/buses/{id}` | Get bus by ID |
| POST | `/api/buses` | Create bus |
| PUT | `/api/buses/{id}` | Update bus |
| DELETE | `/api/buses/{id}` | Delete bus |
| GET | `/api/buses/{id}/location` | Get bus location |
| PUT | `/api/buses/{id}/location` | Update bus location |

### Routes `/api/routes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | Get all routes |
| GET | `/api/routes/{id}` | Get route by ID |
| POST | `/api/routes` | Create route |
| PUT | `/api/routes/{id}` | Update route |
| DELETE | `/api/routes/{id}` | Delete route |
| GET | `/api/routes/{id}/stoppages` | Get route stoppages |

### Attendance `/api/attendance`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/mark` | Mark attendance manually |
| POST | `/api/attendance/mark/qr` | Mark attendance by QR scan |
| GET | `/api/attendance` | Get attendance (`?date=2024-01-01&busId=1`) |
| GET | `/api/attendance/history` | Get history (`?studentId=1&startDate=...&endDate=...`) |
| GET | `/api/attendance/stats` | Get stats by student and date range |

### GPS Logs `/api/gps`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gps/log` | Log bus GPS location |
| GET | `/api/gps/current/{busId}` | Get current location |
| GET | `/api/gps/history/{busId}` | Get location history |

---

## 🗄️ Data Models

### User
```json
{
  "id": 1,
  "email": "driver@smartbus.com",
  "fullName": "John Driver",
  "phoneNumber": "0501234567",
  "role": "DRIVER",
  "active": true
}
```

### Student
```json
{
  "id": 1,
  "rollNumber": "STU001",
  "fullName": "Alice Smith",
  "parentEmail": "parent@example.com",
  "parentPhone": "0501234567",
  "grade": "Grade 5",
  "section": "A",
  "boardingPoint": "Main Gate",
  "busId": 1,
  "busNumber": "BUS-001"
}
```

### Bus
```json
{
  "id": 1,
  "busNumber": "BUS-001",
  "busModel": "Toyota Coaster",
  "capacity": 30,
  "driverId": 2,
  "driverName": "John Driver",
  "status": "ACTIVE",
  "routeId": 1,
  "routeName": "Route A",
  "currentLatitude": 24.7136,
  "currentLongitude": 46.6753
}
```

### Attendance
```json
{
  "id": 1,
  "studentId": 1,
  "studentName": "Alice Smith",
  "rollNumber": "STU001",
  "busId": 1,
  "busNumber": "BUS-001",
  "status": "PRESENT",
  "attendanceDate": "2024-01-15",
  "timestamp": "2024-01-15T07:30:00",
  "latitude": 24.7136,
  "longitude": 46.6753
}
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USERNAME` | Database username | `sa` (H2) |
| `DB_PASSWORD` | Database password | (empty) |
| `JWT_SECRET` | JWT signing secret | Built-in default |
| `JWT_EXPIRATION` | Token expiry in ms | `86400000` (24h) |
| `REACT_APP_API_URL` | Admin portal API URL | `http://localhost:8080/api` |
| `EXPO_PUBLIC_API_URL` | Mobile app API URL | `http://localhost:8080/api` |

---

## 🏗️ Technology Stack

### Backend
- **Java 17** with **Spring Boot 3.3.5**
- **Spring Data JPA** - database access
- **Spring Security + JWT** - authentication & authorization
- **H2** - in-memory database for development
- **PostgreSQL** - production database
- **ZXing** - QR code generation
- **Lombok** - boilerplate reduction

### Admin Portal
- **React 18** with **React Router v6**
- **Axios** - HTTP client
- **CSS Variables** - theming

### Mobile Apps
- **React Native** with **Expo SDK 51**
- **React Navigation v6** - bottom tabs + stack
- **expo-camera** - QR code scanning (driver app)
- **expo-location** - GPS tracking (driver app)
- **AsyncStorage** - token persistence

---

## 👥 User Roles

| Role | Description | App |
|------|-------------|-----|
| `ADMIN` | Full system access, manages students, buses, routes | Admin Portal |
| `DRIVER` | Scans QR codes, tracks GPS location | Driver App |
| `PARENT` | Views child tracking, attendance history | Parent App |

---

## 📸 Features

### Admin Portal
- 📊 Dashboard with real-time statistics
- 🎒 Student CRUD with QR code generation
- 🚌 Bus fleet management with status tracking
- 🗺️ Route management with stoppage configuration
- ✅ Attendance tracking with date/bus filters

### Driver App
- 📱 QR code scanning for student attendance
- 📍 Background GPS location tracking (updates every 30s)
- 📋 Today's attendance records
- 🔔 Push notification support

### Parent App
- 🗺️ Live bus location tracking (updates every 30s)
- ✅ Child attendance history with statistics
- 🔔 Real-time push notifications
- 🚨 Emergency alert capability

---

## 🔐 Security

- JWT tokens for all authenticated requests
- BCrypt password hashing
- Role-based access control (RBAC)
- CORS configured for frontend/mobile
- Stateless session management

---

## 📄 License

MIT License - see LICENSE file for details.

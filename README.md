# SmartBus Complete System

A complete school bus management and tracking system built with **Firebase** as the backend.

## Architecture

```
SmartBus-Complete-System/
├── admin-portal/     # React.js web admin dashboard
├── driver-app/       # React Native (Expo) driver mobile app
├── parent-app/       # React Native (Expo) parent mobile app
└── firebase/         # Firebase configuration and security rules
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | Firebase Firestore (NoSQL, real-time) |
| Authentication | Firebase Authentication (email/password) |
| Storage | Firebase Storage |
| Push Notifications | Firebase Cloud Messaging + Expo Notifications |
| Admin Portal | React.js + Tailwind CSS + Chart.js |
| Mobile Apps | React Native + Expo |
| QR Codes | `qrcode` library (admin) + `expo-camera` (driver) |
| GPS Tracking | `expo-location` |

## Features

### Admin Portal (Web)
- 📊 Dashboard with real-time stats and charts
- 👨‍🎓 Student management with QR code generation
- 🚌 Bus management with driver assignment
- 🗺️ Route management with stoppages
- 👨‍✈️ Driver management
- 📋 Attendance tracking with date/bus filters

### Driver App (React Native)
- 🔐 Firebase Auth login/signup
- 🏠 Home screen with assigned bus and student list
- 📷 QR Scanner to record student attendance
- 📍 GPS tracking (updates Firestore every 30 seconds)
- 📋 Attendance history (past 14 days)
- 👤 Driver profile

### Parent App (React Native)
- 🔐 Firebase Auth login/signup with student roll number linking
- 🚌 Real-time bus location tracking
- ⏱ ETA calculation
- �� Push notifications and alerts
- 👧 Student profile with attendance history
- 🚨 SOS/emergency alert to administration

## Firebase Collections

| Collection | Description |
|-----------|-------------|
| `users` | All authenticated users with roles |
| `students` | Student records with bus/route assignments |
| `buses` | Bus fleet information |
| `routes` | Route definitions with stoppages |
| `drivers` | Driver profiles |
| `attendance` | Daily attendance records |
| `gpsLocations` | Real-time bus locations (keyed by busId) |
| `notifications` | Push notifications for parents |
| `alerts` | Emergency alerts from parents |

## Quick Start

### 1. Firebase Setup
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for full Firebase project setup instructions.

### 2. Admin Portal
```bash
cd admin-portal
cp .env.example .env
npm install
npm start
```

### 3. Driver App
```bash
cd driver-app
npm install
npx expo start
```

### 4. Parent App
```bash
cd parent-app
npm install
npx expo start
```

## Firebase Credentials

| Key | Value |
|-----|-------|
| Project ID | `smartbus-project-ed975` |
| Auth Domain | `smartbus-project-ed975.firebaseapp.com` |
| Storage Bucket | `smartbus-project-ed975.appspot.com` |
| API Key | `AIzaSyCbTpfzysWKldwr2PLkt6bO1zZAwpbHxY4` |

> Update `messagingSenderId` and `appId` in all config files with your actual values from the Firebase Console.

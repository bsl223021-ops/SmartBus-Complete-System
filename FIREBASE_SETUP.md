# Firebase Setup Guide for SmartBus

## Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Expo CLI: `npm install -g expo-cli`

## Step 1: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open project **smartbus-project-ed975**

## Step 2: Enable Authentication

1. Console → Authentication → Sign-in method
2. Enable **Email/Password**
3. Save

## Step 3: Create Firestore Database

1. Console → Firestore Database → Create database
2. Choose **production mode** (security rules are in `firebase/firestore.rules`)
3. Select a region close to your users

## Step 4: Deploy Security Rules

```bash
firebase login
firebase use smartbus-project-ed975
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Step 5: Enable Firebase Storage

1. Console → Storage → Get started
2. Choose the same region as Firestore

## Step 6: Set Up Firebase Cloud Messaging (FCM)

1. Console → Project Settings → Cloud Messaging
2. Copy the **Server Key** for server-side notification sending
3. Copy **Sender ID** — replace `YOUR_MESSAGING_SENDER_ID` in all config files

## Step 7: Get Your App IDs

1. Console → Project Settings → General → Your apps
2. Add Web app for the admin portal → Copy `appId`
3. Add Android app for driver: package `com.smartbus.driver`
4. Add Android app for parent: package `com.smartbus.parent`
5. Add iOS apps similarly if needed
6. Replace `YOUR_APP_ID` in all config files

## Step 8: Create Initial Admin User

Run in browser console at your admin portal URL (after deploying):
```javascript
// After signing up the first admin, set their role manually in Firestore:
// users/{uid} → { role: "admin", email: "...", displayName: "..." }
```
Or use Firebase Console → Firestore → users → Add document manually.

## Step 9: Firestore Indexes

Create composite indexes as needed when you see index errors in the console:
- `attendance`: `studentId ASC, date DESC`
- `attendance`: `busId ASC, date ASC`
- `notifications`: `userId ASC, createdAt DESC`

## Step 10: Environment Variables (Admin Portal)

Copy `.env.example` to `.env` and fill in all values:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyCbTpfzysWKldwr2PLkt6bO1zZAwpbHxY4
REACT_APP_FIREBASE_AUTH_DOMAIN=smartbus-project-ed975.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=smartbus-project-ed975
REACT_APP_FIREBASE_STORAGE_BUCKET=smartbus-project-ed975.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
REACT_APP_FIREBASE_APP_ID=<your-app-id>
```

## Step 11: EAS Build (Mobile Apps)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build driver app
cd driver-app
eas build --platform android --profile preview

# Build parent app
cd ../parent-app
eas build --platform android --profile preview
```

## Firestore Data Structure

### Student document (`students/{id}`)
```json
{
  "name": "John Doe",
  "rollNumber": "STU001",
  "grade": "10A",
  "busId": "<bus-doc-id>",
  "routeId": "<route-doc-id>",
  "parentEmail": "parent@example.com",
  "parentPhone": "+91 98765 43210",
  "parentUid": "<parent-user-uid>",
  "createdAt": "<timestamp>"
}
```

### Bus document (`buses/{id}`)
```json
{
  "number": "BUS-01",
  "plateNumber": "GJ01AB1234",
  "capacity": 40,
  "driverId": "<driver-uid>",
  "routeId": "<route-doc-id>",
  "status": "active",
  "lastLocation": { "latitude": 23.0225, "longitude": 72.5714 }
}
```

### GPS Location document (`gpsLocations/{busId}`)
```json
{
  "busId": "<bus-id>",
  "driverId": "<driver-uid>",
  "latitude": 23.0225,
  "longitude": 72.5714,
  "timestamp": "<server-timestamp>"
}
```

### Attendance document (`attendance/{id}`)
```json
{
  "studentId": "<student-id>",
  "studentName": "John Doe",
  "rollNumber": "STU001",
  "busId": "<bus-id>",
  "driverId": "<driver-uid>",
  "date": "2024-01-15",
  "status": "present",
  "boardTime": "07:45",
  "dropTime": "14:30"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `FirebaseError: Missing or insufficient permissions` | Deploy Firestore rules from `firebase/firestore.rules` |
| `auth/user-not-found` | User hasn't registered; check email spelling |
| GPS not updating | Check location permissions in device settings |
| QR scan not working | Grant camera permissions to the app |
| Push notifications not received | Verify FCM Sender ID and token registration |

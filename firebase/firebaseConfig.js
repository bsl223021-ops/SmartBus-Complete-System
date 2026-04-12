import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Firebase API key is a client-side identifier, safe to include in source code.
// Access is protected by Firestore Security Rules.
// Before deploying, update messagingSenderId and appId from Firebase Console:
//   Project Settings → General → Your apps → Web app → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbTpfzysWKldwr2PLkt6bO1zZAwpbHxY4",
  authDomain: "smartbus-project-ed975.firebaseapp.com",
  projectId: "smartbus-project-ed975",
  storageBucket: "smartbus-project-ed975.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default firebaseConfig;

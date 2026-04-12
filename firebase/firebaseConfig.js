import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Update messagingSenderId and appId with values from Firebase Console:
// Project Settings → General → Your apps → Web/Android app
const firebaseConfig = {
  apiKey: "AIzaSyCbTpfzysWKldwr2PLkt6bO1zZAwpbHxY4",
  authDomain: "smartbus-project-ed975.firebaseapp.com",
  projectId: "smartbus-project-ed975",
  storageBucket: "smartbus-project-ed975.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default firebaseConfig;

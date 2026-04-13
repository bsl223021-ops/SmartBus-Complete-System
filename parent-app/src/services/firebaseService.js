import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  limit,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Update messagingSenderId and appId with values from Firebase Console:
// Project Settings → General → Your apps → Android/iOS app
const firebaseConfig = {
  apiKey: "AIzaSyCbTpfzysWKldwr2PLkt6bO1zZAwpbHxY4",
  authDomain: "smartbus-project-ed975.firebaseapp.com",
  projectId: "smartbus-project-ed975",
  storageBucket: "smartbus-project-ed975.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const loginParent = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerParent = async (email, password, name, phone, studentRollNumber) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  let linkedStudentId = null;

  if (studentRollNumber) {
    const q = query(
      collection(db, "students"),
      where("rollNumber", "==", studentRollNumber.trim())
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      linkedStudentId = snap.docs[0].id;
      await updateDoc(doc(db, "students", linkedStudentId), {
        parentEmail: email,
        parentUid: cred.user.uid,
        updatedAt: serverTimestamp(),
      });
    }
  }

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    name,
    phone,
    role: "parent",
    linkedStudentId,
    createdAt: serverTimestamp(),
  });

  return { cred, linkedStudentId };
};

export const logoutParent = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── Parent Profile ───────────────────────────────────────────────────────────
export const getParentProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── Student ─────────────────────────────────────────────────────────────────
export const getLinkedStudent = async (studentId) => {
  const snap = await getDoc(doc(db, "students", studentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getStudentAttendance = async (studentId, days = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const q = query(
    collection(db, "attendance"),
    where("studentId", "==", studentId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a) => a.date >= cutoffStr);
};

// ─── Bus Location ─────────────────────────────────────────────────────────────
export const subscribeToBusLocation = (busId, callback) => {
  return onSnapshot(doc(db, "gpsLocations", busId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  });
};

export const getBusDetails = async (busId) => {
  if (!busId) return null;
  const snap = await getDoc(doc(db, "buses", busId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getRoute = async (routeId) => {
  if (!routeId) return null;
  const snap = await getDoc(doc(db, "routes", routeId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getDriver = async (driverId) => {
  if (!driverId) return null;
  const snap = await getDoc(doc(db, "drivers", driverId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const subscribeToNotifications = (userId, callback) => {
  return onSnapshot(
    query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    ),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

export const markNotificationRead = async (notifId) => {
  return updateDoc(doc(db, "notifications", notifId), { read: true });
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const sendAlert = async (parentUid, studentId, busId, type, message, parentName, studentName) => {
  return addDoc(collection(db, "alerts"), {
    parentUid,
    parentId: parentUid,
    parentName: parentName || null,
    studentId,
    studentName: studentName || null,
    busId,
    type,
    message,
    status: "active",
    resolved: false,
    seenByDriver: false,
    resolvedAt: null,
    createdAt: serverTimestamp(),
  });
};

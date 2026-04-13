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
export const loginDriver = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerDriver = async (email, password, name, phone) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    name,
    phone,
    role: "driver",
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, "drivers", cred.user.uid), {
    email,
    name,
    phone,
    status: "active",
    createdAt: serverTimestamp(),
  });
  return cred;
};

export const logoutDriver = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── Driver Profile ───────────────────────────────────────────────────────────
export const getDriverProfile = async (uid) => {
  const snap = await getDoc(doc(db, "drivers", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateDriverProfile = async (uid, data) =>
  updateDoc(doc(db, "drivers", uid), { ...data, updatedAt: serverTimestamp() });

// ─── Assigned Route & Students ────────────────────────────────────────────────
export const getAssignedBus = async (driverId) => {
  console.log("[getAssignedBus] Searching for bus with driverId:", driverId);
  console.log("[getAssignedBus] Query: collection=buses, where driverId ==", driverId);
  try {
    const q = query(collection(db, "buses"), where("driverId", "==", driverId));
    const snap = await getDocs(q);
    console.log("[getAssignedBus] Query returned", snap.size, "result(s)");
    if (snap.empty) {
      console.log("[getAssignedBus] No bus found for driverId:", driverId);
      return null;
    }
    const bus = { id: snap.docs[0].id, ...snap.docs[0].data() };
    console.log("[getAssignedBus] Found bus:", bus.id, bus.number);
    return bus;
  } catch (err) {
    console.error("[getAssignedBus] Error executing query:", err.message, err.code);
    throw err;
  }
};

export const getStudentsForBus = async (busId) => {
  const q = query(collection(db, "students"), where("busId", "==", busId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToStudentsForBus = (busId, callback) => {
  return onSnapshot(
    query(collection(db, "students"), where("busId", "==", busId), orderBy("name")),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

// ─── Attendance ────────────────────────────────────────────────────────────────
export const recordAttendance = async ({ studentId, studentName, rollNumber, busId, driverId, status }) => {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);
  const q = query(
    collection(db, "attendance"),
    where("studentId", "==", studentId),
    where("date", "==", today),
    where("busId", "==", busId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    return updateDoc(doc(db, "attendance", existing.docs[0].id), {
      status,
      updatedAt: serverTimestamp(),
      boardTime: status === "present" ? now : null,
    });
  }
  return addDoc(collection(db, "attendance"), {
    studentId,
    studentName,
    rollNumber,
    busId,
    driverId,
    date: today,
    status,
    boardTime: status === "present" ? now : null,
    dropTime: null,
    createdAt: serverTimestamp(),
  });
};

export const getAttendanceHistory = async (driverId, days = 7) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const results = [];
  for (const date of dates) {
    const q = query(
      collection(db, "attendance"),
      where("driverId", "==", driverId),
      where("date", "==", date)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      results.push({ date, records: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
    }
  }
  return results;
};

// ─── GPS ──────────────────────────────────────────────────────────────────────
export const updateBusLocation = async (busId, driverId, latitude, longitude) => {
  const locationData = {
    busId,
    driverId,
    latitude,
    longitude,
    timestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, "gpsLocations", busId), locationData);
  await updateDoc(doc(db, "buses", busId), {
    lastLocation: { latitude, longitude },
    lastLocationUpdate: serverTimestamp(),
  });
};

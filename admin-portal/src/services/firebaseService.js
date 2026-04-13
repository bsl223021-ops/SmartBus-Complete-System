import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCbTpfzysWKldwr2PLkt6bO1zZAwpbHxY4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "smartbus-project-ed975.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "smartbus-project-ed975",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "smartbus-project-ed975.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── Students ───────────────────────────────────────────────────────────────
export const getStudents = async () => {
  const snap = await getDocs(collection(db, "students"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getStudent = async (id) => {
  const snap = await getDoc(doc(db, "students", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addStudent = async (data) => {
  return addDoc(collection(db, "students"), { ...data, createdAt: serverTimestamp() });
};

export const updateStudent = async (id, data) => {
  return updateDoc(doc(db, "students", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteStudent = async (id) => {
  return deleteDoc(doc(db, "students", id));
};

export const subscribeToStudents = (callback) => {
  return onSnapshot(query(collection(db, "students"), orderBy("name")), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── Buses ──────────────────────────────────────────────────────────────────
export const getBuses = async () => {
  const snap = await getDocs(collection(db, "buses"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addBus = async (data) => {
  return addDoc(collection(db, "buses"), { ...data, createdAt: serverTimestamp() });
};

export const updateBus = async (id, data) => {
  const batch = writeBatch(db);
  const busRef = doc(db, "buses", id);

  // Get current bus data to determine the previous driverId
  const busSnap = await getDoc(busRef);
  const oldDriverId = busSnap.exists() ? busSnap.data().driverId : null;
  const newDriverId = data.driverId;

  // Update the bus document
  batch.update(busRef, { ...data, updatedAt: serverTimestamp() });

  // Remove busId from the old driver if the driver is being changed or removed
  if (oldDriverId && oldDriverId !== newDriverId) {
    const oldDriverRef = doc(db, "drivers", oldDriverId);
    batch.set(oldDriverRef, { busId: deleteField(), updatedAt: serverTimestamp() }, { merge: true });
  }

  // Set busId on the new driver if a new driver is being assigned
  if (newDriverId && newDriverId !== oldDriverId) {
    const newDriverRef = doc(db, "drivers", newDriverId);
    batch.set(newDriverRef, { busId: id, updatedAt: serverTimestamp() }, { merge: true });
  }

  return batch.commit();
};

export const deleteBus = async (id) => {
  return deleteDoc(doc(db, "buses", id));
};

export const subscribeToBuses = (callback) => {
  return onSnapshot(collection(db, "buses"), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── Routes ─────────────────────────────────────────────────────────────────
export const getRoutes = async () => {
  const snap = await getDocs(collection(db, "routes"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addRoute = async (data) => {
  return addDoc(collection(db, "routes"), { ...data, createdAt: serverTimestamp() });
};

export const updateRoute = async (id, data) => {
  return updateDoc(doc(db, "routes", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteRoute = async (id) => {
  return deleteDoc(doc(db, "routes", id));
};

// ─── Drivers ─────────────────────────────────────────────────────────────────
export const getDrivers = async () => {
  const snap = await getDocs(collection(db, "drivers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addDriver = async (data, uid) => {
  if (uid) {
    console.log("[addDriver] Using provided Auth UID as document ID:", uid);
    return setDoc(doc(db, "drivers", uid), { ...data, createdAt: serverTimestamp() });
  }
  return addDoc(collection(db, "drivers"), { ...data, createdAt: serverTimestamp() });
};

export const updateDriver = async (id, data) => {
  return updateDoc(doc(db, "drivers", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteDriver = async (id) => {
  return deleteDoc(doc(db, "drivers", id));
};

// ─── Attendance ──────────────────────────────────────────────────────────────
export const getAttendanceByDate = async (date) => {
  const snap = await getDocs(
    query(collection(db, "attendance"), where("date", "==", date))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAttendanceByBusAndDate = async (busId, date) => {
  const snap = await getDocs(
    query(
      collection(db, "attendance"),
      where("busId", "==", busId),
      where("date", "==", date)
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToAttendance = (date, busId, callback) => {
  let q = query(collection(db, "attendance"), where("date", "==", date));
  if (busId) {
    q = query(
      collection(db, "attendance"),
      where("date", "==", date),
      where("busId", "==", busId)
    );
  }
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── GPS Locations ───────────────────────────────────────────────────────────
export const subscribeToBusLocation = (busId, callback) => {
  return onSnapshot(
    query(collection(db, "gpsLocations"), where("busId", "==", busId)),
    (snap) => {
      if (!snap.empty) {
        callback({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    }
  );
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const sendNotification = async (data) => {
  return addDoc(collection(db, "notifications"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
};

// ─── Stats ───────────────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [students, buses, drivers, routes] = await Promise.all([
    getDocs(collection(db, "students")),
    getDocs(collection(db, "buses")),
    getDocs(collection(db, "drivers")),
    getDocs(collection(db, "routes")),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const attendance = await getDocs(
    query(collection(db, "attendance"), where("date", "==", today))
  );
  const present = attendance.docs.filter((d) => d.data().status === "present").length;
  return {
    totalStudents: students.size,
    totalBuses: buses.size,
    totalDrivers: drivers.size,
    totalRoutes: routes.size,
    presentToday: present,
    absentToday: students.size - present,
  };
};

// ─── File Upload ─────────────────────────────────────────────────────────────
export const uploadFile = async (file, path) => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

// ─── User Profile ─────────────────────────────────────────────────────────────
export const setUserProfile = async (uid, data) => {
  return setDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── Trips ───────────────────────────────────────────────────────────────────
export const getTrips = async () => {
  const snap = await getDocs(query(collection(db, "trips"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToTrips = (callback) => {
  return onSnapshot(
    query(collection(db, "trips"), orderBy("createdAt", "desc")),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

export const addTrip = async (data) => {
  return addDoc(collection(db, "trips"), { ...data, createdAt: serverTimestamp() });
};

export const updateTrip = async (id, data) => {
  return updateDoc(doc(db, "trips", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteTrip = async (id) => {
  return deleteDoc(doc(db, "trips", id));
};

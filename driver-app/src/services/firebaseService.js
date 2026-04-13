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
  deleteDoc,
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

// ─── Bus Driver Sync ──────────────────────────────────────────────────────────
export const syncBusDriverId = async (oldDriverEmail, newAuthUid) => {
  if (!oldDriverEmail || !newAuthUid) return;

  console.log("[syncBusDriverId] Looking for buses to sync for driver:", oldDriverEmail);
  try {
    // Find any driver documents with this email that have a different (old) ID
    const driverQuery = query(collection(db, "drivers"), where("email", "==", oldDriverEmail));
    const driverSnap = await getDocs(driverQuery);

    const oldDriverIds = driverSnap.docs
      .filter((d) => d.id !== newAuthUid)
      .map((d) => d.id);

    if (oldDriverIds.length === 0) {
      console.log("[syncBusDriverId] No old driver IDs found for email:", oldDriverEmail);
      return;
    }

    console.log("[syncBusDriverId] Found old driver IDs to migrate:", oldDriverIds);

    // For each old driver ID, find and update buses that still reference it
    for (const oldId of oldDriverIds) {
      const busQuery = query(collection(db, "buses"), where("driverId", "==", oldId));
      const busSnap = await getDocs(busQuery);

      if (busSnap.empty) {
        console.log("[syncBusDriverId] No buses found with old driverId:", oldId);
        continue;
      }

      console.log("[syncBusDriverId] Found", busSnap.size, "bus(es) with old driverId:", oldId);
      for (const busDoc of busSnap.docs) {
        try {
          await updateDoc(doc(db, "buses", busDoc.id), {
            driverId: newAuthUid,
            updatedAt: serverTimestamp(),
          });
          console.log("[syncBusDriverId] Updated bus", busDoc.id, "driverId:", oldId, "→", newAuthUid);
        } catch (err) {
          console.error("[syncBusDriverId] Failed to update bus", busDoc.id, ":", err.message);
        }
      }
    }

    console.log("[syncBusDriverId] Bus driverId sync complete for:", oldDriverEmail);
  } catch (err) {
    console.error("[syncBusDriverId] Error during bus sync:", err.message);
  }
};

// ─── Driver Sync ─────────────────────────────────────────────────────────────
export const syncDriverDocument = async (firebaseUser) => {
  if (!firebaseUser) return;
  const { uid, email } = firebaseUser;

  // Check if a driver doc already exists with the correct UID
  const uidDocRef = doc(db, "drivers", uid);
  const uidSnap = await getDoc(uidDocRef);

  if (uidSnap.exists()) {
    // Document already exists with the correct UID — nothing to do
    return;
  }

  // Look for an existing driver document that has the same email (old/manual ID)
  const emailQuery = query(collection(db, "drivers"), where("email", "==", email), limit(1));
  const emailSnap = await getDocs(emailQuery);

  if (!emailSnap.empty) {
    const oldDoc = emailSnap.docs[0];
    // Guard: skip if the found doc is already the UID-keyed document
    if (oldDoc.id !== uid) {
      // Sync bus documents to use the new Auth UID before the old driver doc is removed
      await syncBusDriverId(email, uid);
      // Preserve all existing fields from the old document
      const oldData = oldDoc.data();
      await setDoc(uidDocRef, {
        ...oldData,
        email,
        uid,
        syncedAt: serverTimestamp(),
      });
      // Remove the old document to avoid data duplication
      await deleteDoc(doc(db, "drivers", oldDoc.id));
    }
  } else {
    // No existing document — create a minimal one with the Auth UID
    await setDoc(uidDocRef, {
      email,
      uid,
      status: "active",
      createdAt: serverTimestamp(),
    });
  }
};

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
  console.log("[subscribeToStudentsForBus] Subscribing for busId:", busId);

  let activeUnsub = onSnapshot(
    query(collection(db, "students"), where("busId", "==", busId), orderBy("name")),
    (snap) => {
      console.log("[subscribeToStudentsForBus] Snapshot received, count:", snap.size);
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (err) => {
      console.error("[subscribeToStudentsForBus] Snapshot error:", err.message, err.code);
      // Only fall back when the composite index is missing (failed-precondition)
      if (err.code === "failed-precondition") {
        // Original listener is already terminated by Firestore after the error callback;
        // start a fallback subscription without orderBy and sort client-side.
        activeUnsub = onSnapshot(
          query(collection(db, "students"), where("busId", "==", busId)),
          (snap) => {
            console.log("[subscribeToStudentsForBus] Fallback snapshot received, count:", snap.size);
            const sorted = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            callback(sorted);
          },
          (fallbackErr) => {
            console.error("[subscribeToStudentsForBus] Fallback error:", fallbackErr.message);
          }
        );
      }
    }
  );

  // Return a stable unsubscribe that always cancels whichever listener is currently active.
  return () => activeUnsub && activeUnsub();
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

// ─── Trips ────────────────────────────────────────────────────────────────────
export const endTrip = async ({ busId, driverId, totalStudents }) => {
  console.log("[endTrip] Starting end trip for busId:", busId, "driverId:", driverId);

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);

  // Fetch all attendance records for today for this bus
  const q = query(
    collection(db, "attendance"),
    where("busId", "==", busId),
    where("date", "==", today)
  );
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log("[endTrip] Attendance records today:", records.length);

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;

  // Determine startTime from the earliest boardTime across all attendance records
  let startTime = now;
  const boardTimes = records.map((r) => r.boardTime).filter(Boolean);
  if (boardTimes.length > 0) {
    startTime = boardTimes.slice().sort()[0];
  }

  const tripData = {
    busId,
    driverId,
    date: today,
    startTime,
    endTime: now,
    totalStudents: totalStudents ?? 0,
    presentCount,
    absentCount,
    createdAt: serverTimestamp(),
  };

  const tripRef = await addDoc(collection(db, "trips"), tripData);
  console.log("[endTrip] Trip document created:", tripRef.id);

  // Send notifications to all parents on this bus
  await sendTripCompletionNotifications(busId, driverId, {
    tripId: tripRef.id,
    presentCount,
    absentCount,
    totalStudents: totalStudents ?? 0,
    endTime: now,
    date: today,
  });

  return { id: tripRef.id, ...tripData };
};

// ─── Trip Completion Notifications ────────────────────────────────────────────
export const sendTripCompletionNotifications = async (busId, driverId, tripSummary) => {
  try {
    console.log("[sendTripCompletionNotifications] Starting for busId:", busId);

    // Get all students on this bus
    const studentsQuery = query(
      collection(db, "students"),
      where("busId", "==", busId)
    );
    const studentsSnap = await getDocs(studentsQuery);
    const students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    console.log("[sendTripCompletionNotifications] Found", students.length, "students");

    if (students.length === 0) {
      console.log("[sendTripCompletionNotifications] No students found, skipping notifications");
      return;
    }

    const notificationPromises = students.map(async (student) => {
      const parentId = student.parentUid || student.parentId;
      if (!parentId) {
        console.warn("[sendTripCompletionNotifications] Student has no parentId:", student.id);
        return;
      }

      const notification = {
        type: "trip_completed",
        parentId,
        parentUid: parentId,
        studentId: student.id,
        studentName: student.name || "Your child",
        busId,
        tripId: tripSummary.tripId,
        title: "🚌 Trip Completed",
        message: `${student.name || "Your child"} has been safely dropped at school`,
        details: {
          presentCount: tripSummary.presentCount,
          absentCount: tripSummary.absentCount,
          totalStudents: tripSummary.totalStudents,
          endTime: tripSummary.endTime,
          date: tripSummary.date,
        },
        read: false,
        createdAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, "notifications"), notification);
        console.log("[sendTripCompletionNotifications] Notification sent to parent:", parentId);
      } catch (err) {
        console.error("[sendTripCompletionNotifications] Failed for student:", student.id, err.message);
      }
    });

    await Promise.all(notificationPromises);
    console.log("[sendTripCompletionNotifications] All notifications sent successfully");
  } catch (err) {
    console.error("[sendTripCompletionNotifications] Error:", err.message);
    // Don't throw — trip completion succeeded even if notifications fail
  }
};

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const subscribeToAlertsForBus = (busId, callback) => {
  return onSnapshot(
    query(
      collection(db, "alerts"),
      where("busId", "==", busId),
      orderBy("createdAt", "desc")
    ),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error("[subscribeToAlertsForBus] Error:", err.message);
      // Fallback without orderBy if index is missing
      if (err.code === "failed-precondition") {
        onSnapshot(
          query(collection(db, "alerts"), where("busId", "==", busId)),
          (snap) => {
            const sorted = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() ?? 0;
                const tb = b.createdAt?.toMillis?.() ?? 0;
                return tb - ta;
              });
            callback(sorted);
          }
        );
      }
    }
  );
};

export const markAlertSeen = async (alertId) => {
  return updateDoc(doc(db, "alerts", alertId), { seenByDriver: true });
};

export const getAlertCount = async (busId) => {
  const q = query(
    collection(db, "alerts"),
    where("busId", "==", busId),
    where("seenByDriver", "==", false)
  );
  const snap = await getDocs(q);
  return snap.size;
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

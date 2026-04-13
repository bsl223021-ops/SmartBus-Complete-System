import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Camera } from "expo-camera";
import { useAuth } from "../../context/AuthContext";
import { getAssignedBus, getStudentsForBus, recordAttendance } from "../../services/firebaseService";

export default function QRScannerScreen({ navigation }) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [bus, setBus] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      const assignedBus = await getAssignedBus(user.uid);
      setBus(assignedBus);
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);
    try {
      const parsed = JSON.parse(data);
      const { id: studentId, rollNumber, name: studentName } = parsed;
      if (!studentId || !rollNumber) {
        Alert.alert("Invalid QR", "This QR code is not a valid SmartBus student QR.", [
          { text: "Scan Again", onPress: () => setScanned(false) },
        ]);
        return;
      }
      if (!bus) {
        Alert.alert("Error", "No bus assigned. Contact admin.");
        return;
      }
      await recordAttendance({
        studentId,
        studentName,
        rollNumber,
        busId: bus.id,
        driverId: user.uid,
        status: "present",
      });
      setLastResult({ studentName, rollNumber, status: "present" });
      Alert.alert(
        "✅ Attendance Recorded",
        `${studentName} (${rollNumber}) marked as Present.`,
        [{ text: "Scan Next", onPress: () => { setScanned(false); setLastResult(null); } }]
      );
    } catch (err) {
      if (err instanceof SyntaxError) {
        Alert.alert("Invalid QR", "QR code format is not recognised.", [
          { text: "Scan Again", onPress: () => setScanned(false) },
        ]);
      } else {
        Alert.alert("Error", err.message, [{ text: "Retry", onPress: () => setScanned(false) }]);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Camera access denied.</Text>
        <Text style={styles.errorSub}>Enable camera permission in device settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scan Student QR</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.frame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.bottomBar}>
          {processing ? (
            <View style={styles.statusCard}>
              <ActivityIndicator color="#1D4ED8" />
              <Text style={styles.statusText}>Recording attendance…</Text>
            </View>
          ) : scanned ? (
            <View style={styles.statusCard}>
              <Text style={styles.successText}>✅ Attendance recorded!</Text>
              <TouchableOpacity style={styles.scanAgainBtn} onPress={() => setScanned(false)}>
                <Text style={styles.scanAgainText}>Scan Next Student</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statusCard}>
              <Text style={styles.instructionText}>Point camera at student QR code</Text>
              <Text style={styles.busText}>{bus ? `Bus: ${bus.number}` : "Loading bus…"}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_BORDER = 4;
const CORNER_COLOR = "#1D4ED8";

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6" },
  loadingText: { color: "#6B7280", marginTop: 12 },
  errorText: { fontSize: 16, fontWeight: "bold", color: "#EF4444" },
  errorSub: { color: "#6B7280", marginTop: 6, textAlign: "center", paddingHorizontal: 24 },
  overlay: { flex: 1, justifyContent: "space-between" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "rgba(0,0,0,0.5)" },
  backBtn: { padding: 6 },
  backText: { color: "#fff", fontSize: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  frame: { width: 240, height: 240, alignSelf: "center", position: "relative" },
  corner: { position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderColor: CORNER_COLOR },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderColor: CORNER_COLOR },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderColor: CORNER_COLOR },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderColor: CORNER_COLOR },
  bottomBar: { backgroundColor: "rgba(0,0,0,0.5)", padding: 20 },
  statusCard: { alignItems: "center" },
  statusText: { color: "#fff", marginTop: 8 },
  successText: { color: "#34D399", fontSize: 18, fontWeight: "bold" },
  scanAgainBtn: { marginTop: 12, backgroundColor: "#1D4ED8", borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  scanAgainText: { color: "#fff", fontWeight: "600" },
  instructionText: { color: "#fff", fontSize: 15, textAlign: "center" },
  busText: { color: "rgba(255,255,255,0.7)", marginTop: 6 },
});

import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getAssignedBus } from "../../services/firebaseService";
import {
  startLocationTracking,
  stopLocationTracking,
  requestLocationPermission,
} from "../../services/locationService";

export default function GPSTrackingScreen() {
  const { user } = useAuth();
  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);
  const stopRef = useRef(null);

  useEffect(() => {
    getAssignedBus(user.uid)
      .then(setBus)
      .catch(() => Alert.alert("Error", "Could not load assigned bus."))
      .finally(() => setLoading(false));
    return () => {
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const startTracking = async () => {
    if (!bus) {
      Alert.alert("No Bus", "You don't have an assigned bus.");
      return;
    }
    try {
      await requestLocationPermission();
      const stop = await startLocationTracking(bus.id, user.uid, (loc) => {
        setLocation(loc);
        setUpdateCount((c) => c + 1);
      });
      stopRef.current = stop;
      setTracking(true);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const endTracking = () => {
    stopLocationTracking();
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    setTracking(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GPS Tracking</Text>
        <Text style={styles.subtitle}>{bus ? `Bus ${bus.number}` : "No bus assigned"}</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: tracking ? "#10B981" : "#D1D5DB" }]} />
          <Text style={styles.statusText}>{tracking ? "Tracking Active" : "Tracking Off"}</Text>
        </View>
        {location && (
          <View style={styles.coordsBox}>
            <Text style={styles.coordLabel}>Current Position</Text>
            <Text style={styles.coord}>Lat: {location.latitude?.toFixed(6)}</Text>
            <Text style={styles.coord}>Lng: {location.longitude?.toFixed(6)}</Text>
            {location.speed != null && (
              <Text style={styles.coord}>Speed: {(location.speed * 3.6).toFixed(1)} km/h</Text>
            )}
            <Text style={styles.updateCount}>Updates sent: {updateCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ How it works</Text>
        <Text style={styles.infoText}>• Location updates every 30 seconds to Firestore</Text>
        <Text style={styles.infoText}>• Parents can see real-time bus position</Text>
        <Text style={styles.infoText}>• Keep app open while driving for continuous tracking</Text>
      </View>

      <View style={styles.btnContainer}>
        {!tracking ? (
          <TouchableOpacity style={styles.startBtn} onPress={startTracking}>
            <Text style={styles.startBtnText}>▶ Start GPS Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={endTracking}>
            <Text style={styles.stopBtnText}>⏹ Stop Tracking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#1D4ED8", padding: 20, paddingTop: 50 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },
  statusCard: { margin: 16, backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  statusText: { fontSize: 17, fontWeight: "600", color: "#1F2937" },
  coordsBox: { backgroundColor: "#F9FAFB", borderRadius: 10, padding: 12 },
  coordLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  coord: { fontSize: 14, color: "#374151", marginBottom: 3 },
  updateCount: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  infoCard: { marginHorizontal: 16, backgroundColor: "#EFF6FF", borderRadius: 16, padding: 16 },
  infoTitle: { fontSize: 15, fontWeight: "600", color: "#1D4ED8", marginBottom: 8 },
  infoText: { fontSize: 13, color: "#374151", marginBottom: 4 },
  btnContainer: { position: "absolute", bottom: 40, left: 16, right: 16 },
  startBtn: { backgroundColor: "#1D4ED8", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  startBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  stopBtn: { backgroundColor: "#DC2626", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  stopBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});

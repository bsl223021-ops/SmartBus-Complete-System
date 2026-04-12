import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  getLinkedStudent,
  getBusDetails,
  subscribeToBusLocation,
} from "../../services/firebaseService";
import { calculateDistance } from "../../services/locationService";

const AVG_SPEED_KMH = 30;

function etaMinutes(busLat, busLng, destLat, destLng) {
  if (!busLat || !destLat) return null;
  const dist = calculateDistance(busLat, busLng, destLat, destLng);
  return Math.round((dist / AVG_SPEED_KMH) * 60);
}

export default function TrackingScreen() {
  const { user, parentProfile } = useAuth();
  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!parentProfile?.linkedStudentId) {
      setLoading(false);
      return;
    }
    let locationUnsub;
    const init = async () => {
      try {
        const s = await getLinkedStudent(parentProfile.linkedStudentId);
        setStudent(s);
        if (s?.busId) {
          const b = await getBusDetails(s.busId);
          setBus(b);
          locationUnsub = subscribeToBusLocation(s.busId, (loc) => {
            setLocation(loc);
            setLastUpdate(new Date());
          });
        }
      } catch (err) {
        console.error("Tracking init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => locationUnsub && locationUnsub();
  }, [parentProfile]);

  const eta = location
    ? etaMinutes(location.latitude, location.longitude, 23.0225, 72.5714)
    : null;

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#059669" /></View>;
  }

  if (!parentProfile?.linkedStudentId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noStudentEmoji}>🔗</Text>
        <Text style={styles.noStudentTitle}>No Student Linked</Text>
        <Text style={styles.noStudentSub}>Contact admin to link your child's account using their roll number.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Bus Tracking</Text>
        <Text style={styles.subtitle}>{student?.name || "Your Child"}'s Bus</Text>
      </View>

      <View style={styles.busCard}>
        <Text style={styles.busTitle}>🚌 Bus {bus?.number || "—"}</Text>
        <Text style={styles.busInfo}>Plate: {bus?.plateNumber || "N/A"}</Text>
        <Text style={styles.busInfo}>Route: {bus?.route || "N/A"}</Text>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationTitle}>📍 Current Location</Text>
          <View style={[styles.liveDot, { backgroundColor: location ? "#10B981" : "#D1D5DB" }]} />
        </View>
        {location ? (
          <>
            <Text style={styles.coord}>Latitude: {location.latitude?.toFixed(6)}</Text>
            <Text style={styles.coord}>Longitude: {location.longitude?.toFixed(6)}</Text>
            {lastUpdate && (
              <Text style={styles.updated}>Updated: {lastUpdate.toLocaleTimeString()}</Text>
            )}
          </>
        ) : (
          <Text style={styles.noLocation}>Bus location not available yet.</Text>
        )}
      </View>

      {eta !== null && (
        <View style={styles.etaCard}>
          <Text style={styles.etaEmoji}>⏱</Text>
          <Text style={styles.etaLabel}>Estimated Arrival</Text>
          <Text style={styles.etaValue}>{eta} minutes</Text>
        </View>
      )}

      <View style={styles.studentCard}>
        <Text style={styles.sectionTitle}>Student Info</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{student?.name}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Roll No</Text><Text style={styles.infoValue}>{student?.rollNumber}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Grade</Text><Text style={styles.infoValue}>{student?.grade || "—"}</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  noStudentEmoji: { fontSize: 56, marginBottom: 12 },
  noStudentTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937", marginBottom: 8 },
  noStudentSub: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  header: { backgroundColor: "#059669", padding: 20, paddingTop: 50 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  busCard: { margin: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  busTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 8 },
  busInfo: { fontSize: 14, color: "#6B7280", marginBottom: 3 },
  locationCard: { marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12 },
  locationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  locationTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  liveDot: { width: 12, height: 12, borderRadius: 6 },
  coord: { fontSize: 14, color: "#374151", marginBottom: 3 },
  updated: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  noLocation: { color: "#9CA3AF", fontSize: 14 },
  etaCard: { marginHorizontal: 16, backgroundColor: "#ECFDF5", borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 12 },
  etaEmoji: { fontSize: 36, marginBottom: 4 },
  etaLabel: { fontSize: 13, color: "#059669", fontWeight: "500" },
  etaValue: { fontSize: 28, fontWeight: "bold", color: "#059669", marginTop: 2 },
  studentCard: { marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 12, textTransform: "uppercase" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  infoLabel: { fontSize: 14, color: "#6B7280" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#1F2937" },
});

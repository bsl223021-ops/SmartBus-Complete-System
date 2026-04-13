import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getAssignedBus, subscribeToStudentsForBus, subscribeToAlertsForBus } from "../../services/firebaseService";

export default function HomeScreen({ navigation }) {
  const { user, driverProfile } = useAuth();
  const [bus, setBus] = useState(null);
  const [students, setStudents] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loadingBus, setLoadingBus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBus = async () => {
    console.log("[HomeScreen] loadBus called");
    console.log("[HomeScreen] user.uid:", user?.uid);
    try {
      const assignedBus = await getAssignedBus(user.uid);
      console.log("[HomeScreen] getAssignedBus returned:", assignedBus ? `bus id=${assignedBus.id}` : "null");
      setBus(assignedBus);
      return assignedBus;
    } catch (err) {
      console.error("[HomeScreen] loadBus error:", err.message);
      Alert.alert("Error", "Could not load your assigned bus.");
      return null;
    } finally {
      setLoadingBus(false);
    }
  };

  useEffect(() => {
    let unsubStudents;
    let unsubAlerts;
    loadBus().then((assignedBus) => {
      if (assignedBus) {
        unsubStudents = subscribeToStudentsForBus(assignedBus.id, setStudents);
        unsubAlerts = subscribeToAlertsForBus(assignedBus.id, (alerts) => {
          const unread = alerts.filter((a) => !a.viewedByDriver).length;
          setUnreadAlerts(unread);
        });
      }
    });
    return () => {
      unsubStudents && unsubStudents();
      unsubAlerts && unsubAlerts();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBus();
    setRefreshing(false);
  };

  if (loadingBus) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {driverProfile?.name || "Driver"} 👋</Text>
        {bus ? (
          <View style={styles.busCard}>
            <Text style={styles.busTitle}>🚌 Bus {bus.number}</Text>
            <Text style={styles.busInfo}>Plate: {bus.plateNumber || "N/A"}</Text>
            <Text style={styles.busInfo}>Capacity: {bus.capacity || "N/A"} students</Text>
            <Text style={styles.busInfo}>Students Assigned: {students.length}</Text>
          </View>
        ) : (
          <View style={styles.noBusCard}>
            <Text style={styles.noBusText}>No bus assigned yet.</Text>
            <Text style={styles.noBusSubText}>Contact admin for bus assignment.</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#1D4ED8" }]}
          onPress={() => navigation.navigate("QRScanner")}
        >
          <Text style={styles.actionEmoji}>📷</Text>
          <Text style={styles.actionText}>Scan QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#059669" }]}
          onPress={() => navigation.navigate("GPSTracking")}
        >
          <Text style={styles.actionEmoji}>📍</Text>
          <Text style={styles.actionText}>GPS Track</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#7C3AED" }]}
          onPress={() => navigation.navigate("AttendanceHistory")}
        >
          <Text style={styles.actionEmoji}>📋</Text>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#DC2626" }]}
          onPress={() => navigation.navigate("Alerts")}
        >
          <View>
            <Text style={styles.actionEmoji}>🔔</Text>
            {unreadAlerts > 0 && (
              <View style={styles.alertDot}>
                <Text style={styles.alertDotText}>{unreadAlerts}</Text>
              </View>
            )}
          </View>
          <Text style={styles.actionText}>Alerts</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Students ({students.length})</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No students assigned to this bus.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentRoll}>Roll: {item.rollNumber}</Text>
              <Text style={styles.studentGrade}>Grade: {item.grade || "N/A"}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#1D4ED8", padding: 20, paddingTop: 50 },
  greeting: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  busCard: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14 },
  busTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  busInfo: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 2 },
  noBusCard: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14, alignItems: "center" },
  noBusText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  noBusSubText: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 },
  actionsRow: { flexDirection: "row", justifyContent: "space-around", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  actionBtn: { alignItems: "center", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  actionEmoji: { fontSize: 24 },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "600", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#374151", padding: 16, paddingBottom: 8 },
  studentCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#1D4ED8" },
  studentName: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  studentRoll: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  studentGrade: { fontSize: 13, color: "#6B7280" },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#9CA3AF", fontSize: 15 },
  alertDot: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  alertDotText: { color: "#DC2626", fontSize: 9, fontWeight: "bold" },
});

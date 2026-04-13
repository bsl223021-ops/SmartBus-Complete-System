import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  getLinkedStudent,
  getStudentAttendance,
  getBusDetails,
  getRoute,
  getDriver,
} from "../../services/firebaseService";

export default function StudentProfileScreen() {
  const { parentProfile } = useAuth();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [driver, setDriver] = useState(null);
  const [busLoading, setBusLoading] = useState(false);

  useEffect(() => {
    if (!parentProfile?.linkedStudentId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const s = await getLinkedStudent(parentProfile.linkedStudentId);
        setStudent(s);
        if (s) {
          const att = await getStudentAttendance(s.id, 30);
          setAttendance(att);

          if (s.busId) {
            setBusLoading(true);
            try {
              const b = await getBusDetails(s.busId);
              setBus(b);
              if (b) {
                const [r, d] = await Promise.all([
                  b.routeId ? getRoute(b.routeId) : Promise.resolve(null),
                  b.driverId ? getDriver(b.driverId) : Promise.resolve(null),
                ]);
                setRoute(r);
                setDriver(d);
              }
            } catch (busErr) {
              console.error("Failed to load bus/route/driver info:", busErr);
            } finally {
              setBusLoading(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load student profile:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [parentProfile]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#059669" /></View>;
  }

  if (!student) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noStudentEmoji}>🔗</Text>
        <Text style={styles.noStudentTitle}>No Student Linked</Text>
        <Text style={styles.noStudentSub}>Contact admin to link your child's account.</Text>
      </View>
    );
  }

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const statusColor = (status) => {
    return status === "present" ? "#10B981" : "#EF4444";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.name?.[0]?.toUpperCase() || "?"}</Text>
        </View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.roll}>Roll No: {student.rollNumber}</Text>
        <Text style={styles.grade}>{student.grade || "N/A"} Grade</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#EF4444" }]}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#059669" }]}>{attendanceRate}%</Text>
          <Text style={styles.statLabel}>Rate</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bus & Route</Text>
        {busLoading ? (
          <ActivityIndicator size="small" color="#059669" style={{ paddingVertical: 12 }} />
        ) : !student.busId ? (
          <View style={styles.busInfoRow}>
            <Text style={styles.busInfoEmoji}>🚌</Text>
            <Text style={styles.busInfoValue}>Not Assigned</Text>
          </View>
        ) : (
          <>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>🚌</Text>
              <Text style={styles.busInfoLabel}>Bus Number</Text>
              <Text style={styles.busInfoValue}>{bus?.number || "—"}</Text>
            </View>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>🚗</Text>
              <Text style={styles.busInfoLabel}>License Plate</Text>
              <Text style={styles.busInfoValue}>{bus?.plateNumber || bus?.licensePlate || "—"}</Text>
            </View>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>👤</Text>
              <Text style={styles.busInfoLabel}>Driver</Text>
              <Text style={styles.busInfoValue}>{driver?.name || "—"}</Text>
            </View>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>📞</Text>
              <Text style={styles.busInfoLabel}>Driver Phone</Text>
              <Text style={styles.busInfoValue}>{driver?.phone || "—"}</Text>
            </View>
            <View style={styles.busDivider} />
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>🗺️</Text>
              <Text style={styles.busInfoLabel}>Route</Text>
              <Text style={styles.busInfoValue}>{route?.name || "N/A"}</Text>
            </View>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>📍</Text>
              <Text style={styles.busInfoLabel}>From → To</Text>
              <Text style={styles.busInfoValue}>
                {route ? `${route.startPoint || "—"} → ${route.endPoint || "—"}` : "N/A"}
              </Text>
            </View>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>🛑</Text>
              <Text style={styles.busInfoLabel}>Stoppages</Text>
              <Text style={styles.busInfoValue}>
                {route?.stoppages?.length > 0 ? route.stoppages.join(", ") : "—"}
              </Text>
            </View>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>⏱️</Text>
              <Text style={styles.busInfoLabel}>Duration</Text>
              <Text style={styles.busInfoValue}>
                {route?.duration ? `${route.duration} min` : "—"}
              </Text>
            </View>
            <View style={styles.busInfoRow}>
              <Text style={styles.busInfoEmoji}>📏</Text>
              <Text style={styles.busInfoLabel}>Distance</Text>
              <Text style={styles.busInfoValue}>
                {route?.distance ? `${route.distance} km` : "—"}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance History (30 days)</Text>
        {attendance.length === 0 ? (
          <Text style={styles.noData}>No attendance records available.</Text>
        ) : (
          attendance.slice(0, 20).map((a) => (
            <View key={a.id} style={styles.attRow}>
              <Text style={styles.attDate}>{a.date}</Text>
              <Text style={styles.attTime}>{a.boardTime ? `Board: ${a.boardTime}` : "—"}</Text>
              <View style={[styles.attDot, { backgroundColor: statusColor(a.status) }]} />
              <Text style={[styles.attStatus, { color: statusColor(a.status) }]}>
                {a.status}
              </Text>
            </View>
          ))
        )}
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
  header: { backgroundColor: "#059669", alignItems: "center", paddingVertical: 36, paddingTop: 56 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  roll: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 3 },
  grade: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  statsRow: { flexDirection: "row", margin: 16, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 18, borderRightWidth: 1, borderRightColor: "#F3F4F6" },
  statValue: { fontSize: 26, fontWeight: "bold", color: "#1F2937" },
  statLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 3 },
  section: { marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 12, textTransform: "uppercase" },
  noData: { color: "#9CA3AF", fontSize: 14, textAlign: "center", paddingVertical: 12 },
  attRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  attDate: { flex: 1, fontSize: 14, color: "#374151" },
  attTime: { fontSize: 12, color: "#9CA3AF", marginRight: 10 },
  attDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  attStatus: { fontSize: 13, fontWeight: "600", width: 56, textAlign: "right" },
  busInfoRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  busInfoEmoji: { fontSize: 16, width: 26 },
  busInfoLabel: { flex: 1, fontSize: 13, color: "#6B7280" },
  busInfoValue: { fontSize: 13, fontWeight: "600", color: "#1F2937", flexShrink: 1, textAlign: "right", maxWidth: "55%" },
  busDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
});

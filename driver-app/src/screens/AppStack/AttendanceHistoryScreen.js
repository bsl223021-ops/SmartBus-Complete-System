import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getAttendanceHistory } from "../../services/firebaseService";

export default function AttendanceHistoryScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAttendanceHistory(user.uid, 14);
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        <Text style={styles.title}>Attendance History</Text>
        <Text style={styles.subtitle}>Last 14 days</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>No attendance records found.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isExpanded = expandedDate === item.date;
            const present = item.records.filter((r) => r.status === "present").length;
            const absent = item.records.filter((r) => r.status === "absent").length;
            return (
              <TouchableOpacity
                style={styles.dateCard}
                onPress={() => setExpandedDate(isExpanded ? null : item.date)}
              >
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: "#D1FAE5" }]}>
                      <Text style={[styles.badgeText, { color: "#059669" }]}>✅ {present}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
                      <Text style={[styles.badgeText, { color: "#DC2626" }]}>❌ {absent}</Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
                </View>
                {isExpanded && (
                  <View style={styles.records}>
                    {item.records.map((r) => (
                      <View key={r.id} style={styles.recordRow}>
                        <Text style={styles.recordName}>{r.studentName}</Text>
                        <Text style={styles.recordRoll}>{r.rollNumber}</Text>
                        <View style={[styles.statusDot, { backgroundColor: r.status === "present" ? "#10B981" : "#EF4444" }]} />
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#1D4ED8", padding: 20, paddingTop: 50 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
  dateCard: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, overflow: "hidden" },
  dateRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  dateText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#1F2937" },
  badgeRow: { flexDirection: "row", gap: 6, marginRight: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  chevron: { color: "#9CA3AF", fontSize: 12 },
  records: { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingHorizontal: 14, paddingBottom: 8 },
  recordRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  recordName: { flex: 1, fontSize: 14, color: "#374151" },
  recordRoll: { fontSize: 13, color: "#9CA3AF", marginRight: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});

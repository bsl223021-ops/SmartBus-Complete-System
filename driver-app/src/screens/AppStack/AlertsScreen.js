import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  getAssignedBus,
  subscribeToAlertsForBus,
  markAlertSeen,
} from "../../services/firebaseService";

const ALERT_TYPE_META = {
  emergency: { emoji: "🚨", label: "Emergency", color: "#DC2626", bg: "#FEF2F2" },
  delay:     { emoji: "⏰", label: "Bus Delay",  color: "#D97706", bg: "#FFFBEB" },
  absent:    { emoji: "🏠", label: "Child Absent", color: "#6B7280", bg: "#F9FAFB" },
  other:     { emoji: "📝", label: "Other",       color: "#4B5563", bg: "#F3F4F6" },
};

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertsScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bus, setBus] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const loadBusAndSubscribe = useCallback(async () => {
    try {
      const assignedBus = await getAssignedBus(user.uid);
      setBus(assignedBus);
      return assignedBus;
    } catch (err) {
      console.error("[AlertsScreen] loadBus error:", err.message);
      return null;
    }
  }, [user.uid]);

  useEffect(() => {
    let unsub;
    loadBusAndSubscribe().then((assignedBus) => {
      setLoading(false);
      if (assignedBus) {
        unsub = subscribeToAlertsForBus(assignedBus.id, (data) => {
          setAlerts(data);
        });
      }
    });
    return () => unsub && unsub();
  }, [loadBusAndSubscribe]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusAndSubscribe();
    setRefreshing(false);
  };

  const handleMarkSeen = async (alertId) => {
    setMarkingId(alertId);
    try {
      await markAlertSeen(alertId);
    } catch (err) {
      console.error("[AlertsScreen] markAlertSeen error:", err.message);
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  const unseenCount = alerts.filter((a) => !a.seenByDriver).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Parent Alerts</Text>
        {bus ? (
          <Text style={styles.subtitle}>Bus {bus.number} · {alerts.length} alert{alerts.length !== 1 ? "s" : ""}</Text>
        ) : (
          <Text style={styles.subtitle}>No bus assigned</Text>
        )}
        {unseenCount > 0 && (
          <View style={styles.unseenBadge}>
            <Text style={styles.unseenBadgeText}>{unseenCount} unseen</Text>
          </View>
        )}
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={alerts.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptyText}>No parent alerts for your bus yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = ALERT_TYPE_META[item.type] || ALERT_TYPE_META.other;
          const isSeen = !!item.seenByDriver;
          return (
            <View style={[styles.card, { borderLeftColor: meta.color, backgroundColor: isSeen ? "#fff" : meta.bg }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.typeEmoji}>{meta.emoji}</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.typeBadge, { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
                </View>
                {isSeen ? (
                  <View style={styles.seenTag}>
                    <Text style={styles.seenTagText}>Seen</Text>
                  </View>
                ) : (
                  <View style={styles.newTag}>
                    <Text style={styles.newTagText}>New</Text>
                  </View>
                )}
              </View>

              {(item.studentName || item.studentId) && (
                <Text style={styles.studentName}>
                  👦 {item.studentName || item.studentId}
                </Text>
              )}

              {item.parentName && (
                <Text style={styles.parentName}>👤 Parent: {item.parentName}</Text>
              )}

              {item.message ? (
                <Text style={styles.message}>"{item.message}"</Text>
              ) : null}

              {!isSeen && (
                <TouchableOpacity
                  style={styles.markSeenBtn}
                  onPress={() => handleMarkSeen(item.id)}
                  disabled={markingId === item.id}
                >
                  {markingId === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.markSeenText}>✓ Mark as Seen</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#DC2626", padding: 20, paddingTop: 50 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  unseenBadge: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  unseenBadgeText: { color: "#DC2626", fontWeight: "700", fontSize: 12 },
  listContent: { padding: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#374151", marginBottom: 6 },
  emptyText: { fontSize: 14, color: "#9CA3AF", textAlign: "center" },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  typeEmoji: { fontSize: 24, marginRight: 10 },
  cardHeaderText: { flex: 1 },
  typeBadge: { fontSize: 14, fontWeight: "700" },
  cardTime: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  seenTag: { backgroundColor: "#D1FAE5", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  seenTagText: { color: "#059669", fontSize: 11, fontWeight: "600" },
  newTag: { backgroundColor: "#FEE2E2", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  newTagText: { color: "#DC2626", fontSize: 11, fontWeight: "600" },
  studentName: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
  parentName: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  message: { fontSize: 14, color: "#374151", fontStyle: "italic", marginBottom: 10, lineHeight: 20 },
  markSeenBtn: {
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  markSeenText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});

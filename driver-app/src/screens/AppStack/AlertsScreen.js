import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  getAssignedBus,
  subscribeToAlertsForBus,
  markAlertAsViewed,
} from "../../services/firebaseService";

const TYPE_META = {
  emergency: { label: "Emergency", emoji: "🚨", color: "#DC2626", bg: "#FEE2E2" },
  delay: { label: "Delay", emoji: "⏰", color: "#D97706", bg: "#FEF3C7" },
  absent: { label: "Absence", emoji: "🏠", color: "#2563EB", bg: "#DBEAFE" },
  other: { label: "Other", emoji: "📢", color: "#6B7280", bg: "#F3F4F6" },
};

function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

export default function AlertsScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busId, setBusId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadBusAndSubscribe = useCallback(async () => {
    if (!user?.uid) return null;
    try {
      const bus = await getAssignedBus(user.uid);
      if (bus) {
        setBusId(bus.id);
        return bus.id;
      }
    } catch (err) {
      console.error("[AlertsScreen] loadBus error:", err.message);
    }
    return null;
  }, [user]);

  useEffect(() => {
    let unsub;
    loadBusAndSubscribe().then((id) => {
      setLoading(false);
      if (id) {
        unsub = subscribeToAlertsForBus(id, (data) => {
          setAlerts(data);
        });
      }
    });
    return () => unsub && unsub();
  }, [loadBusAndSubscribe]);

  const onRefresh = async () => {
    setRefreshing(true);
    const id = await loadBusAndSubscribe();
    if (!id) setRefreshing(false);
    // unsub is managed in the effect, just refresh bus info
    setRefreshing(false);
  };

  const handleExpand = async (alert) => {
    const isOpen = expandedId === alert.id;
    setExpandedId(isOpen ? null : alert.id);
    if (!isOpen && !alert.viewedByDriver) {
      try {
        await markAlertAsViewed(alert.id);
      } catch (err) {
        // silent
      }
    }
  };

  const handleCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Could not open phone dialer.")
    );
  };

  const unviewedCount = alerts.filter((a) => !a.viewedByDriver).length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!busId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>🚌</Text>
        <Text style={styles.emptyText}>No bus assigned</Text>
        <Text style={styles.emptySubText}>Contact admin for bus assignment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Alerts</Text>
        {unviewedCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unviewedCount} new</Text>
          </View>
        )}
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={alerts.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>No alerts for your bus</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type] || TYPE_META.other;
          const isExpanded = expandedId === item.id;
          const isNew = !item.viewedByDriver;
          const isResolved = item.status === "resolved" || item.resolved === true;

          return (
            <TouchableOpacity
              style={[styles.card, isNew && styles.cardNew]}
              onPress={() => handleExpand(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.typeIcon, { backgroundColor: meta.bg }]}>
                  <Text style={styles.typeEmoji}>{meta.emoji}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.typeBadge, { color: meta.color }]}>{meta.label}</Text>
                    {isNew && <Text style={styles.newBadge}>NEW</Text>}
                    <Text
                      style={[
                        styles.statusBadge,
                        isResolved ? styles.statusResolved : styles.statusOpen,
                      ]}
                    >
                      {isResolved ? "Resolved" : "Open"}
                    </Text>
                  </View>
                  <Text style={styles.message} numberOfLines={isExpanded ? undefined : 2}>
                    {item.message || "No message"}
                  </Text>
                  <View style={styles.metaRow}>
                    {item.studentName && (
                      <Text style={styles.metaText}>👤 {item.studentName}</Text>
                    )}
                    <Text style={styles.metaText}>⏱ {formatTime(item.createdAt)}</Text>
                  </View>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.details}>
                  {item.parentEmail && (
                    <Text style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Parent Email: </Text>
                      {item.parentEmail}
                    </Text>
                  )}
                  {item.parentPhone && (
                    <Text style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Phone: </Text>
                      {item.parentPhone}
                    </Text>
                  )}
                  {item.busId && (
                    <Text style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Bus ID: </Text>
                      {item.busId}
                    </Text>
                  )}
                  {item.parentPhone && (
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(item.parentPhone)}
                    >
                      <Text style={styles.callBtnText}>📞 Contact Parent</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  header: {
    backgroundColor: "#DC2626",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1 },
  badge: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: "#DC2626", fontSize: 12, fontWeight: "bold" },
  listContent: { padding: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 4 },
  emptySubText: { fontSize: 13, color: "#9CA3AF" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardNew: {
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  typeEmoji: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" },
  typeBadge: { fontSize: 12, fontWeight: "700" },
  newBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#DC2626",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "600",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  statusOpen: { color: "#DC2626", backgroundColor: "#FEE2E2" },
  statusResolved: { color: "#059669", backgroundColor: "#D1FAE5" },
  message: { fontSize: 14, color: "#1F2937", lineHeight: 20 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  metaText: { fontSize: 12, color: "#6B7280" },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  detailRow: { fontSize: 13, color: "#374151", marginBottom: 4 },
  detailLabel: { fontWeight: "600" },
  callBtn: {
    marginTop: 10,
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  callBtnText: { color: "#2563EB", fontSize: 14, fontWeight: "600" },
});

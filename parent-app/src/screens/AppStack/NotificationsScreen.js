import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToNotifications, markNotificationRead } from "../../services/firebaseService";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const typeIcon = (type) => {
    const icons = {
      attendance: "📋",
      alert: "🚨",
      info: "ℹ️",
      location: "📍",
      trip_completed: "🚌",
    };
    return icons[type] || "🔔";
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#059669" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>{notifications.filter((n) => !n.read).length} unread</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifCard, !item.read && styles.unread]}
              onPress={() => !item.read && handleMarkRead(item.id)}
            >
              <View style={styles.notifRow}>
                <Text style={styles.notifIcon}>{typeIcon(item.type)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>{item.title || "Notification"}</Text>
                  <Text style={styles.notifBody}>{item.message || item.body}</Text>
                  {item.type === "trip_completed" && item.details && (
                    <View style={styles.tripDetails}>
                      <Text style={styles.tripDetailText}>
                        🕐 Drop-off: {item.details.endTime}  •  📅 {item.details.date}
                      </Text>
                      <Text style={styles.tripDetailText}>
                        ✅ Present: {item.details.presentCount}  •  ❌ Absent: {item.details.absentCount}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#059669", padding: 20, paddingTop: 50 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
  notifCard: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, padding: 14 },
  unread: { backgroundColor: "#F0FDF4", borderLeftWidth: 4, borderLeftColor: "#059669" },
  notifRow: { flexDirection: "row", alignItems: "flex-start" },
  notifIcon: { fontSize: 26, marginRight: 12 },
  notifTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937", marginBottom: 3 },
  notifBody: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  notifTime: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#059669", marginTop: 4 },
  tripDetails: { marginTop: 6, padding: 8, backgroundColor: "#ECFDF5", borderRadius: 6 },
  tripDetailText: { fontSize: 12, color: "#065F46", marginBottom: 2 },
});

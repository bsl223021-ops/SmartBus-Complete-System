import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { logoutParent } from "../../services/firebaseService";

export default function ProfileScreen() {
  const { user, parentProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await logoutParent();
          } catch (err) {
            Alert.alert("Error", err.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const infoRow = (label, value) => (
    <View style={styles.infoRow} key={label}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{parentProfile?.name?.[0]?.toUpperCase() || "P"}</Text>
        </View>
        <Text style={styles.name}>{parentProfile?.name || "Parent"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>👨‍👩‍👧 Parent</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        {infoRow("Full Name", parentProfile?.name)}
        {infoRow("Email", parentProfile?.email || user?.email)}
        {infoRow("Phone", parentProfile?.phone)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {infoRow("User ID", user?.uid)}
        {infoRow("Member Since", user?.metadata?.creationTime
          ? new Date(user.metadata.creationTime).toLocaleDateString()
          : "—")}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={styles.logoutText}>🚪 Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { backgroundColor: "#059669", alignItems: "center", paddingVertical: 40, paddingTop: 60 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  email: { color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 },
  roleBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 10 },
  roleText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  section: { margin: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 12, textTransform: "uppercase" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  infoLabel: { fontSize: 14, color: "#6B7280" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#1F2937", maxWidth: "60%", textAlign: "right" },
  logoutBtn: { borderWidth: 1, borderColor: "#FCA5A5", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  logoutText: { color: "#DC2626", fontSize: 16, fontWeight: "600" },
});

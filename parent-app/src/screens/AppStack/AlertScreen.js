import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { sendAlert, getLinkedStudent } from "../../services/firebaseService";

const ALERT_TYPES = [
  { key: "emergency", label: "🚨 Emergency", color: "#DC2626", desc: "Immediate danger or serious incident" },
  { key: "delay", label: "⏰ Bus Delay", color: "#D97706", desc: "Bus is significantly delayed" },
  { key: "absent", label: "🏠 Child Absent", color: "#6B7280", desc: "My child will not be taking the bus today" },
  { key: "other", label: "📝 Other", color: "#4B5563", desc: "Other issue or concern" },
];

export default function AlertScreen() {
  const { user, parentProfile } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [studentBusId, setStudentBusId] = useState(null);
  const [studentName, setStudentName] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    if (!parentProfile?.linkedStudentId) return;
    setStudentLoading(true);
    getLinkedStudent(parentProfile.linkedStudentId)
      .then((student) => {
        if (student?.busId) setStudentBusId(student.busId);
        if (student?.name) setStudentName(student.name);
      })
      .catch((err) => {
        console.error("Failed to load student bus info:", err);
        Alert.alert("Warning", "Could not load your child's bus information. The alert will still be sent, but without bus details.");
      })
      .finally(() => setStudentLoading(false));
  }, [parentProfile?.linkedStudentId]);

  const handleSendAlert = async () => {
    if (!selectedType) {
      Alert.alert("Select Alert Type", "Please select the type of alert to send.");
      return;
    }
    if (!parentProfile?.linkedStudentId) {
      Alert.alert("No Student Linked", "Your account is not linked to a student. Please contact school administration.");
      return;
    }
    Alert.alert(
      "Send Alert",
      `Are you sure you want to send a "${selectedType}" alert to the school administration?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await sendAlert(
                user.uid,
                parentProfile.linkedStudentId,
                studentBusId,
                selectedType,
                message || ALERT_TYPES.find((t) => t.key === selectedType)?.desc || "",
                parentProfile?.name || null,
                studentName
              );
              setSent(true);
            } catch (err) {
              Alert.alert(
                "Failed to Send Alert",
                err.code?.includes("permission-denied")
                  ? "You do not have permission to send alerts. Please ensure you are logged in."
                  : err.message || "An unexpected error occurred. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.successTitle}>Alert Sent</Text>
        <Text style={styles.successSub}>Administration has been notified and will respond shortly.</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={() => { setSent(false); setSelectedType(null); setMessage(""); }}>
          <Text style={styles.resetText}>Send Another Alert</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Alert</Text>
        <Text style={styles.subtitle}>Notify administration immediately</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Alert Type</Text>
        {ALERT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.alertTypeBtn, selectedType === type.key && { borderColor: type.color, backgroundColor: `${type.color}15` }]}
            onPress={() => setSelectedType(type.key)}
          >
            <View style={styles.alertTypeRow}>
              <Text style={styles.alertTypeLabel}>{type.label}</Text>
              {selectedType === type.key && <Text>✓</Text>}
            </View>
            <Text style={styles.alertTypeDesc}>{type.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Message (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Provide any additional details..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.sendBtn, (!selectedType || studentLoading) && styles.sendBtnDisabled]}
          onPress={handleSendAlert}
          disabled={loading || !selectedType || studentLoading}
        >
          {loading || studentLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>🚨 Send Alert to Administration</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.contactTitle}>📞 Emergency Contact</Text>
        <Text style={styles.contactLine}>School Office: <Text style={styles.contactPhone}>+91 98765 43210</Text></Text>
        <Text style={styles.contactLine}>Transport Head: <Text style={styles.contactPhone}>+91 87654 32109</Text></Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  successContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6", padding: 24 },
  successEmoji: { fontSize: 72, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: "bold", color: "#1F2937", marginBottom: 8 },
  successSub: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20 },
  resetBtn: { marginTop: 28, backgroundColor: "#059669", borderRadius: 12, paddingHorizontal: 28, paddingVertical: 13 },
  resetText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  header: { backgroundColor: "#DC2626", padding: 20, paddingTop: 50 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  section: { margin: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 0, marginTop: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 12, textTransform: "uppercase" },
  alertTypeBtn: { borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12, padding: 13, marginBottom: 10 },
  alertTypeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  alertTypeLabel: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  alertTypeDesc: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  textArea: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 12, fontSize: 14, color: "#374151", minHeight: 90 },
  sendBtn: { backgroundColor: "#DC2626", borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  sendBtnDisabled: { backgroundColor: "#FCA5A5" },
  sendBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  contactTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginBottom: 10 },
  contactLine: { fontSize: 14, color: "#6B7280", marginBottom: 5 },
  contactPhone: { color: "#059669", fontWeight: "600" },
});

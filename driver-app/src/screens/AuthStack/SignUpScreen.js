import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { registerDriver } from "../../services/firebaseService";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await registerDriver(email.trim(), password, name.trim(), phone.trim());
    } catch (err) {
      Alert.alert("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🚌</Text>
          <Text style={styles.title}>Create Driver Account</Text>
          <Text style={styles.subtitle}>Join SmartBus as a driver</Text>

          {[
            { value: name, setter: setName, placeholder: "Full Name", type: "default" },
            { value: email, setter: setEmail, placeholder: "Email Address", type: "email-address" },
            { value: phone, setter: setPhone, placeholder: "Phone Number", type: "phone-pad" },
          ].map(({ value, setter, placeholder, type }) => (
            <TextInput
              key={placeholder}
              style={styles.input}
              placeholder={placeholder}
              value={value}
              onChangeText={setter}
              keyboardType={type}
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          ))}

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1D4ED8" },
  scroll: { padding: 20, paddingVertical: 40 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center" },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1F2937", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 28 },
  input: {
    width: "100%", borderWidth: 1, borderColor: "#D1D5DB",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#1F2937", marginBottom: 14,
  },
  button: {
    width: "100%", backgroundColor: "#1D4ED8", borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginTop: 6,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 16 },
  linkText: { color: "#1D4ED8", fontSize: 14 },
});

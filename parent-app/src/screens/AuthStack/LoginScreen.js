import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { loginParent } from "../../services/firebaseService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginParent(email.trim(), password);
    } catch (err) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <Text style={styles.emoji}>👨‍👩‍👧</Text>
        <Text style={styles.title}>SmartBus Parent</Text>
        <Text style={styles.subtitle}>Track your child's bus in real time</Text>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")} style={styles.link}>
          <Text style={styles.linkText}>New parent? Create account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#059669", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center" },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "bold", color: "#1F2937", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#6B7280", marginBottom: 28, textAlign: "center" },
  input: { width: "100%", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1F2937", marginBottom: 14 },
  button: { width: "100%", backgroundColor: "#059669", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 16 },
  linkText: { color: "#059669", fontSize: 14 },
});

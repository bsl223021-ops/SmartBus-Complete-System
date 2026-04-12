import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attendanceAPI } from '../services/api';
import theme from '../theme/theme';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busId, setBusId] = useState(null);

  useEffect(() => {
    requestCameraPermission();
    loadBusId();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadBusId = async () => {
    try {
      const busStr = await AsyncStorage.getItem('currentBusId');
      if (busStr) setBusId(parseInt(busStr));
    } catch (err) {
      console.error('Failed to load bus ID:', err);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      const response = await attendanceAPI.markByQR(data, busId);
      Alert.alert(
        '✅ Attendance Marked',
        `${response.data.studentName} marked as ${response.data.status}`,
        [{ text: 'Scan Next', onPress: () => setScanned(false) }]
      );
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to mark attendance';
      Alert.alert(
        '❌ Error',
        message,
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>📷 Camera permission denied</Text>
        <TouchableOpacity style={styles.btn} onPress={requestCameraPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
      </View>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanHint}>
            {loading ? 'Processing...' : scanned ? 'Scanned! Processing...' : 'Align QR code within the frame'}
          </Text>
        </View>
      </CameraView>

      {scanned && !loading && (
        <TouchableOpacity style={styles.resetBtn} onPress={() => setScanned(false)}>
          <Text style={styles.resetBtnText}>📱 Scan Another Student</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: theme.spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, paddingTop: 50, backgroundColor: theme.colors.primary },
  backBtn: { marginRight: theme.spacing.md },
  backBtnText: { color: theme.colors.white, fontSize: 16 },
  headerTitle: { color: theme.colors.white, fontSize: 18, fontWeight: '600' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanArea: {
    width: 250, height: 250, borderWidth: 2, borderColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md, backgroundColor: 'transparent',
  },
  scanHint: { color: theme.colors.white, fontSize: 14, marginTop: theme.spacing.lg, textAlign: 'center', paddingHorizontal: theme.spacing.xl },
  resetBtn: { backgroundColor: theme.colors.secondary, padding: theme.spacing.lg, alignItems: 'center' },
  resetBtnText: { color: theme.colors.white, fontSize: 16, fontWeight: '600' },
  btn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginTop: theme.spacing.md },
  btnText: { color: theme.colors.white, fontWeight: '600' },
  infoText: { marginTop: theme.spacing.md, color: theme.colors.textSecondary },
  errorText: { fontSize: 16, color: theme.colors.danger, marginBottom: theme.spacing.md },
});

export default QRScannerScreen;

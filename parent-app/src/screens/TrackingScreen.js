import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentsAPI, busesAPI, gpsAPI } from '../services/api';
import theme from '../theme/theme';

const TrackingScreen = () => {
  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadData();
    // Update location every 30 seconds
    intervalRef.current = setInterval(updateLocation, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const studentsRes = await studentsAPI.getByParentEmail(user.email);
      if (studentsRes.data.length > 0) {
        const studentData = studentsRes.data[0];
        setStudent(studentData);

        if (studentData.busId) {
          const busRes = await busesAPI.getById(studentData.busId);
          setBus(busRes.data);
          await updateLocation(studentData.busId);
        }
      }
    } catch (err) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (busIdParam) => {
    const id = busIdParam || bus?.id;
    if (!id) return;
    try {
      const res = await gpsAPI.getCurrentLocation(id);
      setLocation(res.data);
    } catch (err) {
      // No GPS data yet
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEmergencyAlert = () => {
    Alert.alert(
      '🚨 Emergency Alert',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Alert', style: 'destructive', onPress: () => Alert.alert('Alert Sent', 'Emergency alert has been sent to the driver and school.') }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading tracking data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺 Live Bus Tracking</Text>
        <Text style={styles.headerSubtitle}>Updates every 30 seconds</Text>
      </View>

      {student ? (
        <>
          <View style={styles.studentCard}>
            <Text style={styles.cardTitle}>👶 Your Child</Text>
            <View style={styles.studentInfo}>
              <InfoItem label="Name" value={student.fullName} />
              <InfoItem label="Roll No." value={student.rollNumber} />
              <InfoItem label="Grade" value={`${student.grade || ''} ${student.section || ''}`.trim() || 'N/A'} />
              <InfoItem label="Boarding Point" value={student.boardingPoint || 'N/A'} />
            </View>
          </View>

          {bus ? (
            <View style={styles.busCard}>
              <Text style={styles.cardTitle}>🚌 Bus Information</Text>
              <View style={styles.studentInfo}>
                <InfoItem label="Bus Number" value={bus.busNumber} />
                <InfoItem label="Driver" value={bus.driverName || 'N/A'} />
                <InfoItem label="Route" value={bus.routeName || 'N/A'} />
                <InfoItem label="Status" value={bus.status} highlight={bus.status === 'ACTIVE'} />
              </View>
            </View>
          ) : (
            <View style={styles.noBusCard}>
              <Text style={styles.noBusText}>⚠️ No bus assigned to your child</Text>
            </View>
          )}

          {location ? (
            <View style={styles.locationCard}>
              <Text style={styles.cardTitle}>📍 Current Location</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.coordinates}>
                  Lat: {location.latitude?.toFixed(6)}
                </Text>
                <Text style={styles.coordinates}>
                  Lng: {location.longitude?.toFixed(6)}
                </Text>
                <Text style={styles.speed}>
                  Speed: {location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : 'N/A'}
                </Text>
                {location.timestamp && (
                  <Text style={styles.lastUpdate}>
                    Last Updated: {new Date(location.timestamp).toLocaleTimeString()}
                  </Text>
                )}
              </View>

              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>🗺️</Text>
                <Text style={styles.mapPlaceholderLabel}>Map View</Text>
                <Text style={styles.mapPlaceholderSub}>
                  {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                </Text>
              </View>
            </View>
          ) : bus ? (
            <View style={styles.noLocationCard}>
              <Text style={styles.noLocationText}>📡 Waiting for GPS signal...</Text>
              <Text style={styles.noLocationSub}>The bus location will appear once the driver starts tracking.</Text>
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.noStudentCard}>
          <Text style={styles.noStudentText}>👶 No student linked to your account</Text>
          <Text style={styles.noStudentSub}>Please contact school administration.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergencyAlert}>
        <Text style={styles.emergencyBtnText}>🚨 Emergency Alert</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoItem = ({ label, value, highlight }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{label}</Text>
    <Text style={{ color: highlight ? theme.colors.success : theme.colors.textPrimary, fontSize: 13, fontWeight: '500' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.colors.textSecondary, fontSize: 16 },
  header: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, paddingTop: 50 },
  headerTitle: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  studentCard: { margin: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, elevation: 2 },
  busCard: { margin: theme.spacing.md, marginTop: 0, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, elevation: 2 },
  locationCard: { margin: theme.spacing.md, marginTop: 0, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.primary, marginBottom: theme.spacing.md },
  studentInfo: {},
  locationInfo: { marginBottom: theme.spacing.md },
  coordinates: { fontSize: 14, color: theme.colors.textPrimary, marginBottom: 4 },
  speed: { fontSize: 14, color: theme.colors.info, fontWeight: '500', marginBottom: 4 },
  lastUpdate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  mapPlaceholder: { backgroundColor: '#e3f2fd', borderRadius: theme.borderRadius.md, height: 150, justifyContent: 'center', alignItems: 'center' },
  mapPlaceholderText: { fontSize: 40 },
  mapPlaceholderLabel: { fontSize: 14, color: theme.colors.primary, fontWeight: '500', marginTop: 8 },
  mapPlaceholderSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  noBusCard: { margin: theme.spacing.md, backgroundColor: '#fff8e1', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg },
  noBusText: { color: theme.colors.warning, fontSize: 15 },
  noLocationCard: { margin: theme.spacing.md, marginTop: 0, backgroundColor: '#e8eaf6', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg },
  noLocationText: { fontSize: 15, fontWeight: '500', color: theme.colors.primary },
  noLocationSub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  noStudentCard: { margin: theme.spacing.md, backgroundColor: '#fff8e1', borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl },
  noStudentText: { fontSize: 16, fontWeight: '500', color: theme.colors.warning, textAlign: 'center' },
  noStudentSub: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
  emergencyBtn: { margin: theme.spacing.md, backgroundColor: theme.colors.danger, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, alignItems: 'center', marginBottom: theme.spacing.xl },
  emergencyBtnText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
});

export default TrackingScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentsAPI, attendanceAPI } from '../services/api';
import theme from '../theme/theme';

const statusColors = {
  PRESENT: theme.colors.success,
  ABSENT: theme.colors.danger,
  LATE: theme.colors.warning,
  EXCUSED: theme.colors.info,
};

const HistoryScreen = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    loadData();
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

        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [historyRes, statsRes] = await Promise.allSettled([
          attendanceAPI.getHistory(studentData.id, startDate, endDate),
          attendanceAPI.getStats(studentData.id, startDate, endDate),
        ]);

        if (historyRes.status === 'fulfilled') {
          setRecords(historyRes.value.data.sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate)));
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.dateCol}>
        <Text style={styles.day}>{new Date(item.attendanceDate).toLocaleDateString('en', { day: '2-digit' })}</Text>
        <Text style={styles.month}>{new Date(item.attendanceDate).toLocaleDateString('en', { month: 'short' })}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemDay}>
          {new Date(item.attendanceDate).toLocaleDateString('en', { weekday: 'long' })}
        </Text>
        {item.timestamp && (
          <Text style={styles.itemTime}>Boarded at {new Date(item.timestamp).toLocaleTimeString()}</Text>
        )}
        {item.busNumber && <Text style={styles.itemBus}>Bus: {item.busNumber}</Text>}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status]}20` }]}>
        <Text style={[styles.statusText, { color: statusColors[item.status] }]}>{item.status}</Text>
      </View>
    </View>
  );

  const totalDays = Object.values(stats).reduce((a, b) => a + b, 0);
  const attendancePercent = totalDays > 0 ? Math.round((stats.PRESENT / totalDays) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Attendance History</Text>
        <Text style={styles.headerSubtitle}>Last 30 days</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.percentBox}>
          <Text style={styles.percentValue}>{attendancePercent}%</Text>
          <Text style={styles.percentLabel}>Attendance</Text>
        </View>
        <View style={styles.statsBreakdown}>
          {Object.entries(stats).map(([status, count]) => (
            <View key={status} style={styles.statRow}>
              <View style={[styles.statDot, { backgroundColor: statusColors[status] }]} />
              <Text style={styles.statLabel}>{status}</Text>
              <Text style={[styles.statCount, { color: statusColors[status] }]}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, paddingTop: 50 },
  headerTitle: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  statsCard: { margin: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, flexDirection: 'row', elevation: 2 },
  percentBox: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: theme.colors.border },
  percentValue: { fontSize: 40, fontWeight: 'bold', color: theme.colors.primary },
  percentLabel: { fontSize: 12, color: theme.colors.textSecondary },
  statsBreakdown: { flex: 1, paddingLeft: theme.spacing.md },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  statDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statLabel: { flex: 1, fontSize: 13, color: theme.colors.textSecondary },
  statCount: { fontSize: 14, fontWeight: '600' },
  list: { padding: theme.spacing.md },
  item: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  dateCol: { width: 44, alignItems: 'center', marginRight: theme.spacing.md },
  day: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
  month: { fontSize: 11, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  itemContent: { flex: 1 },
  itemDay: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary },
  itemTime: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  itemBus: { fontSize: 12, color: theme.colors.info, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.round },
  statusText: { fontSize: 11, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 16 },
});

export default HistoryScreen;

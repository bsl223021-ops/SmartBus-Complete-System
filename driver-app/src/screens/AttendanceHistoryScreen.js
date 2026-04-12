import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attendanceAPI, busesAPI } from '../services/api';
import theme from '../theme/theme';

const statusColors = {
  PRESENT: theme.colors.success,
  ABSENT: theme.colors.danger,
  LATE: theme.colors.warning,
  EXCUSED: theme.colors.info,
};

const AttendanceHistoryScreen = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busId, setBusId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const busRes = await busesAPI.getAll();
        const driverBus = busRes.data.find(b => b.driverId === user.id);
        if (driverBus) {
          setBusId(driverBus.id);
          const attRes = await attendanceAPI.getTodayAttendance(driverBus.id);
          setRecords(attRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
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
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.studentName}</Text>
        <Text style={styles.itemRoll}>Roll: {item.rollNumber}</Text>
        {item.timestamp && (
          <Text style={styles.itemTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status]}20` }]}>
        <Text style={[styles.statusText, { color: statusColors[item.status] }]}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Attendance</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.colors.success }]}>
            {records.filter(r => r.status === 'PRESENT').length}
          </Text>
          <Text style={styles.statLbl}>Present</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.colors.danger }]}>
            {records.filter(r => r.status === 'ABSENT').length}
          </Text>
          <Text style={styles.statLbl}>Absent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.colors.warning }]}>
            {records.filter(r => r.status === 'LATE').length}
          </Text>
          <Text style={styles.statLbl}>Late</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.colors.primary }]}>{records.length}</Text>
          <Text style={styles.statLbl}>Total</Text>
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
              <Text style={styles.emptyText}>No attendance records for today</Text>
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
  headerTitle: { color: theme.colors.white, fontSize: 20, fontWeight: 'bold' },
  headerDate: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  stats: { flexDirection: 'row', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLbl: { fontSize: 11, color: theme.colors.textSecondary },
  list: { padding: theme.spacing.md },
  item: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary },
  itemRoll: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  itemTime: { fontSize: 12, color: theme.colors.info, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.borderRadius.round },
  statusText: { fontSize: 12, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 16 },
});

export default AttendanceHistoryScreen;

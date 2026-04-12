import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../theme/theme';

const SAMPLE_NOTIFICATIONS = [
  { id: '1', title: '✅ Boarded Bus', message: 'Your child has boarded Bus #B-001', time: new Date(Date.now() - 1800000).toISOString(), read: false, type: 'boarding' },
  { id: '2', title: '🚌 Bus Arriving', message: 'Bus #B-001 will arrive at your stop in 5 minutes', time: new Date(Date.now() - 3600000).toISOString(), read: true, type: 'arrival' },
  { id: '3', title: '🏫 Arrived at School', message: 'Your child has arrived at school safely', time: new Date(Date.now() - 7200000).toISOString(), read: true, type: 'arrival' },
];

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'boarding': return '🎒';
      case 'arrival': return '🚌';
      case 'absence': return '⚠️';
      case 'emergency': return '🚨';
      default: return '🔔';
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => markRead(item.id)}
    >
      <View style={styles.notifIcon}>
        <Text style={styles.notifIconText}>{getNotificationIcon(item.type)}</Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>
        <Text style={styles.notifMessage}>{item.message}</Text>
        <Text style={styles.notifTime}>{new Date(item.time).toLocaleString()}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold' },
  markAllBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  markAllText: { color: theme.colors.white, fontSize: 12 },
  unreadBanner: { backgroundColor: '#e3f2fd', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  unreadBannerText: { color: theme.colors.info, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  notificationItem: { backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'flex-start', elevation: 1 },
  unreadItem: { backgroundColor: '#e8eaf6', borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  notifIconText: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary, marginBottom: 4 },
  unreadTitle: { fontWeight: '700', color: theme.colors.primary },
  notifMessage: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4 },
  notifTime: { fontSize: 11, color: theme.colors.textSecondary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginTop: 6 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 16 },
});

export default NotificationsScreen;

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useAuth } from "../../context/AuthContext";
import {
  getLinkedStudent,
  getBusDetails,
  subscribeToBusLocation,
} from "../../services/firebaseService";
import {
  calculateDistance,
  getBearing,
  getDirectionLabel,
  getBusStatus,
} from "../../services/locationService";

const AVG_SPEED_KMH = 30;
const MAX_TRAIL_POINTS = 20;

// School coordinates — update to match your school's actual location
const SCHOOL_LATITUDE = 23.0225;
const SCHOOL_LONGITUDE = 72.5714;

function etaMinutes(busLat, busLng, destLat, destLng, speedKmh) {
  if (!busLat || !destLat) return null;
  const dist = calculateDistance(busLat, busLng, destLat, destLng);
  if (dist < 0.05) return 0; // already at school
  const effectiveSpeed = speedKmh && speedKmh > 2 ? speedKmh : AVG_SPEED_KMH;
  return Math.max(1, Math.round((dist / effectiveSpeed) * 60));
}

const STATUS_CONFIG = {
  arriving: { label: "🚨 Bus is Arriving!", color: "#EF4444", bg: "#FEF2F2" },
  nearby:   { label: "📍 Bus is Nearby",   color: "#F59E0B", bg: "#FFFBEB" },
  on_way:   { label: "🚌 Bus is On the Way", color: "#059669", bg: "#ECFDF5" },
  stopped:  { label: "⏸ Bus is Stopped",   color: "#6B7280", bg: "#F3F4F6" },
  inactive: { label: "📡 Tracking Inactive", color: "#9CA3AF", bg: "#F9FAFB" },
};

export default function TrackingScreen() {
  const { parentProfile } = useAuth();
  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState(null);
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const mapRef = useRef(null);
  const locationUnsubRef = useRef(null);
  const refreshingRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for the live bus marker
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const subscribeToLocation = useCallback(
    (busId) => {
      if (locationUnsubRef.current) locationUnsubRef.current();
      locationUnsubRef.current = subscribeToBusLocation(busId, (loc) => {
        if (!loc) return;
        setLocation(loc);
        setLastUpdate(new Date());
        setTrail((prev) => {
          const next = [
            ...prev,
            { latitude: loc.latitude, longitude: loc.longitude },
          ].slice(-MAX_TRAIL_POINTS);
          return next;
        });
        // Clear refresh spinner once we receive new data
        if (refreshingRef.current) {
          refreshingRef.current = false;
          setRefreshing(false);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (!parentProfile?.linkedStudentId) {
      setLoading(false);
      return;
    }
    const init = async () => {
      try {
        const s = await getLinkedStudent(parentProfile.linkedStudentId);
        setStudent(s);
        if (s?.busId) {
          const b = await getBusDetails(s.busId);
          setBus(b);
          subscribeToLocation(s.busId);
        }
      } catch (err) {
        console.error("Tracking init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      if (locationUnsubRef.current) locationUnsubRef.current();
    };
  }, [parentProfile, subscribeToLocation]);

  // Center map on bus location when it first appears or changes significantly
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        600
      );
    }
  }, [location?.latitude, location?.longitude]);

  const handleRefresh = () => {
    if (!bus?.id || refreshing) return;
    refreshingRef.current = true;
    setRefreshing(true);
    subscribeToLocation(bus.id);
    // Fallback: clear spinner after 5s if no callback fires (e.g. no bus data)
    setTimeout(() => {
      if (refreshingRef.current) {
        refreshingRef.current = false;
        setRefreshing(false);
      }
    }, 5000);
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const distanceKm =
    location
      ? calculateDistance(
          location.latitude,
          location.longitude,
          SCHOOL_LATITUDE,
          SCHOOL_LONGITUDE
        )
      : null;

  const speedMs = location?.speed ?? null;
  const speedKmh = speedMs != null && speedMs >= 0 ? speedMs * 3.6 : null;

  const bearing =
    trail.length >= 2
      ? getBearing(
          trail[trail.length - 2].latitude,
          trail[trail.length - 2].longitude,
          trail[trail.length - 1].latitude,
          trail[trail.length - 1].longitude
        )
      : location?.heading ?? null;

  const directionLabel = bearing != null ? getDirectionLabel(bearing) : null;

  const busStatus = location
    ? getBusStatus(distanceKm, speedMs)
    : "inactive";

  const eta = location
    ? etaMinutes(
        location.latitude,
        location.longitude,
        SCHOOL_LATITUDE,
        SCHOOL_LONGITUDE,
        speedKmh
      )
    : null;

  const statusCfg = STATUS_CONFIG[busStatus] ?? STATUS_CONFIG.inactive;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  // ── No student linked ────────────────────────────────────────────────────────
  if (!parentProfile?.linkedStudentId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noStudentEmoji}>🔗</Text>
        <Text style={styles.noStudentTitle}>No Student Linked</Text>
        <Text style={styles.noStudentSub}>
          Contact admin to link your child's account using their roll number.
        </Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: location?.latitude ?? SCHOOL_LATITUDE,
    longitude: location?.longitude ?? SCHOOL_LONGITUDE,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Bus Tracking</Text>
          <Text style={styles.subtitle}>{student?.name || "Your Child"}'s Bus</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, refreshing && styles.refreshBtnDisabled]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshBtnText}>{refreshing ? "..." : "⟳"}</Text>
        </TouchableOpacity>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg, borderColor: statusCfg.color }]}>
        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        {lastUpdate && (
          <Text style={styles.updatedText}>Updated: {lastUpdate.toLocaleTimeString()}</Text>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* Trail polyline */}
          {trail.length >= 2 && (
            <Polyline
              coordinates={trail}
              strokeColor="#059669"
              strokeWidth={3}
              lineDashPattern={[6, 3]}
            />
          )}

          {/* Bus marker */}
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={`Bus ${bus?.number || ""}`}
              description={distanceKm != null ? `${distanceKm.toFixed(1)} km from school` : ""}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.busMarkerContainer}>
                <Animated.View
                  style={[
                    styles.busMarkerPulse,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={styles.busMarkerIcon}>
                  <Text style={styles.busMarkerEmoji}>🚌</Text>
                </View>
              </View>
            </Marker>
          )}

          {/* School marker */}
          <Marker
            coordinate={{ latitude: SCHOOL_LATITUDE, longitude: SCHOOL_LONGITUDE }}
            title="School"
            description="Destination"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.schoolMarker}>
              <Text style={styles.schoolMarkerEmoji}>🏫</Text>
            </View>
          </Marker>
        </MapView>

        {/* Live indicator overlay */}
        <View style={styles.liveOverlay}>
          <View style={[styles.liveDot, { backgroundColor: location ? "#10B981" : "#D1D5DB" }]} />
          <Text style={styles.liveText}>{location ? "LIVE" : "OFFLINE"}</Text>
        </View>
      </View>

      {/* Info cards row */}
      <View style={styles.infoRow}>
        {/* Distance */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardEmoji}>📏</Text>
          <Text style={styles.infoCardValue}>
            {distanceKm != null ? `${distanceKm.toFixed(1)} km` : "—"}
          </Text>
          <Text style={styles.infoCardLabel}>Distance</Text>
        </View>

        {/* ETA */}
        <View style={[styles.infoCard, styles.infoCardHighlight]}>
          <Text style={styles.infoCardEmoji}>⏱</Text>
          <Text style={[styles.infoCardValue, { color: "#059669" }]}>
            {eta != null ? (eta === 0 ? "Arrived" : `${eta} min`) : "—"}
          </Text>
          <Text style={styles.infoCardLabel}>ETA</Text>
        </View>

        {/* Speed */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardEmoji}>⚡</Text>
          <Text style={styles.infoCardValue}>
            {speedKmh != null ? `${Math.round(speedKmh)} km/h` : "—"}
          </Text>
          <Text style={styles.infoCardLabel}>Speed</Text>
        </View>
      </View>

      {/* Direction card */}
      {directionLabel && (
        <View style={styles.directionCard}>
          <Text style={styles.directionLabel}>
            Heading <Text style={styles.directionValue}>{directionLabel}</Text>
            {bearing != null ? ` (${Math.round(bearing)}°)` : ""}
          </Text>
        </View>
      )}

      {/* Bus info */}
      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Bus Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bus Number</Text>
          <Text style={styles.detailValue}>{bus?.number || "—"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plate</Text>
          <Text style={styles.detailValue}>{bus?.plateNumber || "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Route</Text>
          <Text style={styles.detailValue}>{bus?.route || "N/A"}</Text>
        </View>
      </View>

      {/* Student info */}
      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Student Info</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={styles.detailValue}>{student?.name || "—"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Roll No</Text>
          <Text style={styles.detailValue}>{student?.rollNumber || "—"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Grade</Text>
          <Text style={styles.detailValue}>{student?.grade || "—"}</Text>
        </View>
      </View>

      {/* No location fallback */}
      {!location && (
        <View style={styles.noLocationCard}>
          <Text style={styles.noLocationEmoji}>📡</Text>
          <Text style={styles.noLocationTitle}>No Location Data</Text>
          <Text style={styles.noLocationSub}>
            The bus hasn't started tracking yet. Tap ⟳ to refresh.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },

  // No-student state
  noStudentEmoji: { fontSize: 56, marginBottom: 12 },
  noStudentTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937", marginBottom: 8 },
  noStudentSub: { fontSize: 14, color: "#6B7280", textAlign: "center" },

  // Header
  header: {
    backgroundColor: "#059669",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  refreshBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  refreshBtnDisabled: { opacity: 0.5 },
  refreshBtnText: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  // Status banner
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: { fontSize: 15, fontWeight: "700" },
  updatedText: { fontSize: 11, color: "#9CA3AF" },

  // Map
  mapContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 260,
    backgroundColor: "#E5E7EB",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  map: { flex: 1 },
  liveOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  liveText: { fontSize: 11, fontWeight: "700", color: "#374151" },

  // Bus marker
  busMarkerContainer: { alignItems: "center", justifyContent: "center", width: 48, height: 48 },
  busMarkerPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(5, 150, 105, 0.25)",
  },
  busMarkerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  busMarkerEmoji: { fontSize: 18 },
  schoolMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1D4ED8",
  },
  schoolMarkerEmoji: { fontSize: 18 },

  // Info cards row
  infoRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  infoCardHighlight: { borderWidth: 1.5, borderColor: "#059669" },
  infoCardEmoji: { fontSize: 20, marginBottom: 4 },
  infoCardValue: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  infoCardLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  // Direction
  directionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  directionLabel: { fontSize: 14, color: "#6B7280" },
  directionValue: { fontWeight: "700", color: "#1F2937" },

  // Detail cards
  detailCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: { fontSize: 14, color: "#6B7280" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#1F2937" },

  // No location fallback
  noLocationCard: {
    marginHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: 12,
  },
  noLocationEmoji: { fontSize: 36, marginBottom: 8 },
  noLocationTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 4 },
  noLocationSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
});

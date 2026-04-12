import * as Location from "expo-location";
import { updateBusLocation } from "./firebaseService";

let locationSubscription = null;
let gpsInterval = null;

export const requestLocationPermission = async () => {
  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== "granted") {
    throw new Error("Foreground location permission denied.");
  }
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  return { foreground: fgStatus === "granted", background: bgStatus === "granted" };
};

export const getCurrentLocation = async () => {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    heading: location.coords.heading,
    speed: location.coords.speed,
  };
};

export const startLocationTracking = async (busId, driverId, onUpdate) => {
  const perms = await requestLocationPermission();
  if (!perms.foreground) throw new Error("Location permission required.");

  const currentLoc = await getCurrentLocation();
  onUpdate && onUpdate(currentLoc);

  gpsInterval = setInterval(async () => {
    try {
      const loc = await getCurrentLocation();
      await updateBusLocation(busId, driverId, loc.latitude, loc.longitude);
      onUpdate && onUpdate(loc);
    } catch (err) {
      console.warn("GPS update failed:", err.message);
    }
  }, 30000);

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      onUpdate &&
        onUpdate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
    }
  );

  return () => stopLocationTracking();
};

export const stopLocationTracking = () => {
  if (gpsInterval) {
    clearInterval(gpsInterval);
    gpsInterval = null;
  }
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

import * as Location from 'expo-location';
import { gpsAPI } from './api';

class LocationService {
  constructor() {
    this.watchId = null;
    this.busId = null;
  }

  async requestPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    const bgStatus = await Location.requestBackgroundPermissionsAsync();
    return bgStatus.status === 'granted';
  }

  async startTracking(busId) {
    this.busId = busId;
    try {
      await this.requestPermissions();
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000,
          distanceInterval: 50,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          const speed = location.coords.speed || 0;
          try {
            await gpsAPI.logLocation(busId, latitude, longitude, speed);
          } catch (err) {
            console.error('Failed to log location:', err.message);
          }
        }
      );
    } catch (err) {
      console.error('Failed to start location tracking:', err.message);
    }
  }

  async stopTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  async getCurrentLocation() {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location.coords;
  }
}

export default new LocationService();

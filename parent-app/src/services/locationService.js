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

// Returns compass bearing in degrees (0–360) from point 1 → point 2
export const getBearing = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

// Returns a human-readable compass direction label from a bearing in degrees
export const getDirectionLabel = (bearing) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(bearing / 45) % 8];
};

// Returns a status string based on distance (km) and optional speed (m/s)
const ARRIVING_DISTANCE_KM = 0.2;  // bus is "arriving" when within 200 m of school
const NEARBY_DISTANCE_KM = 1.0;    // bus is "nearby" when within 1 km of school
const STOPPED_SPEED_KMH = 1;       // bus considered stopped below 1 km/h

export const getBusStatus = (distanceKm, speedMs) => {
  const speedKmh = speedMs != null ? speedMs * 3.6 : null;
  if (distanceKm < ARRIVING_DISTANCE_KM) return "arriving";
  if (distanceKm < NEARBY_DISTANCE_KM) return "nearby";
  if (speedKmh != null && speedKmh < STOPPED_SPEED_KMH) return "stopped";
  return "on_way";
};

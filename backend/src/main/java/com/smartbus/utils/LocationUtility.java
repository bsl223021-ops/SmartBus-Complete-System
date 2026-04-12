package com.smartbus.utils;

import org.springframework.stereotype.Component;

@Component
public class LocationUtility {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculate distance between two GPS coordinates using Haversine formula.
     * @return distance in kilometers
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Estimate arrival time based on distance and average speed.
     * @param distanceKm distance in km
     * @param speedKmh average speed in km/h
     * @return estimated time in minutes
     */
    public int estimateArrivalMinutes(double distanceKm, double speedKmh) {
        if (speedKmh <= 0) {
            return -1;
        }
        return (int) Math.ceil((distanceKm / speedKmh) * 60);
    }

    /**
     * Check if a location is within a given radius of a reference point.
     */
    public boolean isWithinRadius(double lat1, double lon1, double lat2, double lon2, double radiusKm) {
        return calculateDistance(lat1, lon1, lat2, lon2) <= radiusKm;
    }
}

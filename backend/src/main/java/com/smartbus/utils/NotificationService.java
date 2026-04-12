package com.smartbus.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public void sendBoardingNotification(String parentEmail, String studentName, String busNumber) {
        logger.info("Sending boarding notification to {} - Student: {} boarded bus {}", parentEmail, studentName, busNumber);
    }

    public void sendAbsenceAlert(String parentEmail, String studentName) {
        logger.info("Sending absence alert to {} for student: {}", parentEmail, studentName);
    }

    public void sendBusArrivalAlert(String parentEmail, String busNumber, int etaMinutes) {
        logger.info("Sending bus arrival alert to {} - Bus {} arriving in {} minutes", parentEmail, busNumber, etaMinutes);
    }

    public void sendEmergencyAlert(String parentEmail, String message) {
        logger.info("Sending emergency alert to {}: {}", parentEmail, message);
    }

    public void sendPushNotification(String deviceToken, String title, String body) {
        logger.info("Sending push notification to device {}: {} - {}", deviceToken, title, body);
    }
}

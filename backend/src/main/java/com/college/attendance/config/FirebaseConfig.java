package com.college.attendance.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${notification.fcm.enabled:false}")
    private boolean fcmEnabled;

    @Value("${notification.fcm.credentials-path:}")
    private String credentialsPath;

    @PostConstruct
    public void initialize() {
        if (!fcmEnabled) {
            logger.info("FCM is disabled. Skipping Firebase initialization.");
            return;
        }

        if (credentialsPath == null || credentialsPath.isEmpty()) {
            logger.warn("FCM is enabled but credentials path is not configured. FCM will not work.");
            return;
        }

        try {
            FileInputStream serviceAccount = new FileInputStream(credentialsPath);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                logger.info("Firebase initialized successfully for FCM notifications.");
            }
        } catch (IOException e) {
            logger.error("Failed to initialize Firebase: {}. FCM notifications will not work.", e.getMessage());
        }
    }
}

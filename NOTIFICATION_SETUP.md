# Notification Setup Guide

This guide explains how to configure Email and Firebase Cloud Messaging (FCM) for the attendance system.

## Overview

The system supports two notification channels:
- **Email** - For student monthly attendance reports
- **FCM (Firebase Cloud Messaging)** - For teacher attendance reminders on mobile devices

Both are **optional** and disabled by default. The system will fall back to logging if not configured.

---

## Email Configuration (Student Reports)

### 1. Get Gmail App Password

If using Gmail:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to **App Passwords** section
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### 2. Update `application.properties`

```properties
# Enable Email
notification.email.enabled=true
notification.email.from=your-email@gmail.com

# SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=YOUR_16_CHAR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 3. Test Email

Restart the backend and check logs for:
```
Email sent to student: John Doe (john@college.edu)
```

---

## FCM Configuration (Teacher Reminders)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name (e.g., "Attendance System")
4. Disable Google Analytics (optional)
5. Click **Create Project**

### 2. Get Service Account JSON

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file as `firebase-service-account.json`
5. Place it in the **backend root directory** (same level as `pom.xml`)

### 3. Update `application.properties`

```properties
# Enable FCM
notification.fcm.enabled=true
notification.fcm.credentials-path=firebase-service-account.json
```

### 4. Register Device Tokens

Teachers need to register their device tokens via the mobile app.

**API Endpoint:**
```
POST /api/notifications/register-fcm
Authorization: Bearer <teacher_jwt_token>
Content-Type: application/json

{
  "fcmToken": "device_token_from_firebase_sdk"
}
```

**Example (from mobile app):**
```javascript
// React Native / Flutter
const token = await messaging().getToken();

fetch('http://your-backend/api/notifications/register-fcm', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${teacherToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ fcmToken: token })
});
```

### 5. Test FCM

1. Register a test device token
2. Wait for a scheduled class reminder
3. Check device for push notification

---

## Verification

### Check Configuration Status

On backend startup, look for these logs:

**Email Enabled:**
```
Email sent to student: ...
```

**FCM Enabled:**
```
Firebase initialized successfully for FCM notifications.
FCM notification sent to teacher: ...
```

**Fallback (Not Configured):**
```
=================================================
NOTIFICATION TO TEACHER: Jane Smith
MESSAGE: Reminder: Your class for...
=================================================
```

---

## Troubleshooting

### Email Not Sending

**Error:** `Authentication failed`
- ✅ Verify 2-Step Verification is enabled
- ✅ Use App Password, not regular password
- ✅ Check username matches the email

**Error:** `Connection refused`
- ✅ Check firewall allows port 587
- ✅ Verify SMTP host is correct

### FCM Not Working

**Error:** `Failed to initialize Firebase`
- ✅ Verify JSON file path is correct
- ✅ Check JSON file is valid (not corrupted)
- ✅ Ensure file is in backend root directory

**No notifications received:**
- ✅ Verify teacher has registered FCM token
- ✅ Check token is not expired (re-register if needed)
- ✅ Verify Firebase project is active

---

## Security Notes

1. **Never commit** `application.properties` or `firebase-service-account.json` to Git
2. Use **environment variables** in production:
   ```bash
   export MAIL_USERNAME=your-email@gmail.com
   export MAIL_PASSWORD=your-app-password
   export FCM_CREDENTIALS_PATH=/path/to/firebase-service-account.json
   ```
3. Rotate credentials periodically
4. Use different credentials for dev/staging/production

---

## Production Recommendations

### Email
- Use a dedicated email service (SendGrid, AWS SES, Mailgun)
- Set up SPF/DKIM records to avoid spam
- Monitor bounce rates

### FCM
- Implement token refresh logic in mobile app
- Handle token expiration gracefully
- Monitor FCM quota limits (free tier: 1M messages/month)

---

## Disabling Notifications

To disable temporarily, set in `application.properties`:

```properties
notification.email.enabled=false
notification.fcm.enabled=false
```

The system will fall back to logging.

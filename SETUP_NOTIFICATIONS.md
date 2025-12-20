# Email Notification Setup Instructions

## Overview
The application now supports email notifications via Resend API when new alerts are posted. This guide will help you set up the email service.

## Prerequisites
- Node.js backend running
- MongoDB connected
- Frontend React app running

## Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Navigate to the **API Keys** section in the dashboard
4. Click **Create API Key**
5. Give it a name (e.g., "Khoj Development")
6. Copy the API key (it starts with `re_`)

## Step 2: Add API Key to Environment

1. Open `backend/.env` file
2. Add the following line:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```
3. Save the file

## Step 3: Restart Backend Server

```bash
cd backend
npm start
```

## Step 4: Testing Email Notifications

### Using Development Email
For development/testing, Resend provides a default sender email: `onboarding@resend.dev`

This doesn't require domain verification and works immediately!

### What Happens When Alert is Posted:
1. **In-app notifications** created for all users in the system
2. **Email notifications** sent to up to 50 users/police in the same district
3. **Real-time notification** via Socket.IO to update notification bell badge

### Email Content:
- Alert title
- Alert description  
- District and Upazila
- Location details
- Contact information (if provided)
- "View Alert Details" button linking to the alert

## Step 5: Verify Notifications Work

### Backend Verification:
1. Check backend console for:
   ```
   Email sent successfully to: user@example.com
   ```
   
2. If you see errors like "Invalid API key", double-check the `.env` file

### Frontend Verification:
1. Log in to the app
2. Look for the **bell icon** 🔔 in the navbar (next to chat icon)
3. The badge will show unread notification count
4. Click the bell to view all notifications
5. Click any notification to navigate to the alert details
6. Notification will be marked as read automatically

## Features

### In-App Notifications:
- ✅ Bell icon in navbar with unread badge
- ✅ Notifications page listing all notifications
- ✅ Click notification to view alert details
- ✅ Mark individual notification as read
- ✅ Mark all notifications as read button
- ✅ Real-time updates via Socket.IO
- ✅ Pagination for large notification lists

### Email Notifications:
- ✅ Professional HTML email template
- ✅ Alert details included in email
- ✅ Direct link to view alert
- ✅ Limited to 50 recipients per district to prevent spam
- ✅ Async sending (doesn't block API response)
- ✅ Error handling for failed emails

## Troubleshooting

### Emails Not Sending
1. Check if `RESEND_API_KEY` is set in `.env`
2. Verify API key is valid (starts with `re_`)
3. Check backend console for error messages
4. Ensure backend server was restarted after adding env variable

### Notifications Not Appearing
1. Ensure you're logged in
2. Check browser console for errors
3. Verify backend notification routes are accessible:
   ```
   GET http://localhost:5001/api/notifications
   GET http://localhost:5001/api/notifications/unread-count
   ```

### Badge Not Updating
1. Check Socket.IO connection in browser console
2. Verify Socket.IO server is running (check backend console)
3. Try refreshing the page

## Production Deployment

For production, you should:
1. Verify your domain with Resend
2. Use your own email address as sender (e.g., `alerts@yourdomain.com`)
3. Update `from` field in `backend/src/services/emailService.js`
4. Consider implementing email rate limiting
5. Add email preferences for users (opt-in/opt-out)

## API Endpoints

### Notification Endpoints:
- `GET /api/notifications` - Get paginated notifications (with ?page=1&limit=20)
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark single notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Socket Events:
- `new-notification` - Emitted when new alert is posted
- Client listens to update badge in real-time

## Notes

- Free tier: 100 emails per day, 3,000 per month
- Emails are sent asynchronously to not block alert creation
- Email sending errors are logged but don't prevent alert creation
- In-app notifications are always created regardless of email status

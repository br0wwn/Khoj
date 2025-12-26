# Quick Start Guide - Direct Messaging

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Dependencies already installed (socket.io added)
# Start the backend server
npm run dev
```

**Expected output:**
```
Server is running on port 5000
MongoDB connected successfully
Socket.IO initialized
```

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Dependencies already installed (socket.io-client added)
# Start the frontend
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

## 🧪 Testing the Chat Feature

### Test Scenario 1: Start a Conversation

1. **Login** with two different accounts in separate browsers
2. **User A**: Navigate to Feed (/)
3. **User A**: Find an alert created by User B
4. **User A**: Click the **"Message"** button on the alert card
5. **Expected**: Redirects to chat window with User B
6. **User A**: Send a message: "Hello, I saw your alert!"
7. **User B**: Navigate to Chat (/chat)
8. **Expected**: See conversation with unread badge
9. **User B**: Click conversation
10. **Expected**: See User A's message in real-time

### Test Scenario 2: Real-time Messaging

1. **Both users** open the same conversation
2. **User A**: Start typing
3. **Expected**: User B sees "typing..." indicator
4. **User A**: Send message
5. **Expected**: Message appears instantly for both users
6. **User B**: Send reply
7. **Expected**: User A sees message instantly with read receipt (✓)

### Test Scenario 3: Unread Count

1. **User B**: Navigate away from chat (go to Feed)
2. **User A**: Send 3 messages
3. **Expected**: User B sees badge "3" on chat icon in navbar
4. **User B**: Click chat icon
5. **Expected**: See conversation with unread count
6. **User B**: Open conversation
7. **Expected**: Badge disappears, messages marked as read

### Test Scenario 4: Contact from Alert Details

1. Navigate to any alert details page
2. Look for "Contact Creator" or "Message" button (if not self)
3. Click button
4. **Expected**: Opens/creates conversation with alert creator

## 🔍 Verification Points

### Backend Verification

Check terminal logs for:
- ✅ `Socket.IO initialized`
- ✅ `User connected: <socket-id>`
- ✅ `User <userId> registered with socket <socket-id>`
- ✅ `Socket <socket-id> joined conversation <conversationId>`

### Frontend Verification

Open browser console (F12) and check for:
- ✅ `Socket connected: <socket-id>`
- ✅ No connection errors
- ✅ Socket events firing (new-message, typing, etc.)

### Database Verification

Use MongoDB Compass or CLI:

```bash
# Check conversations collection
db.conversations.find({}).pretty()

# Check messages collection
db.messages.find({}).pretty()

# Verify indexes
db.conversations.getIndexes()
db.messages.getIndexes()
```

## 📋 API Testing (Postman/Insomnia)

### 1. Start Conversation
```http
POST http://localhost:5000/api/chat/conversation
Content-Type: application/json

{
  "alertId": "your_alert_id",
  "receiverId": "receiver_user_id",
  "receiverType": "User"
}
```

### 2. Get Conversations
```http
GET http://localhost:5000/api/chat/conversations
```

### 3. Send Message
```http
POST http://localhost:5000/api/chat/conversation/:conversationId/message
Content-Type: application/json

{
  "messageText": "Hello, this is a test message!"
}
```

### 4. Get Messages
```http
GET http://localhost:5000/api/chat/conversation/:conversationId/messages?page=1&limit=50
```

### 5. Mark as Read
```http
PUT http://localhost:5000/api/chat/conversation/:conversationId/read
```

### 6. Get Unread Count
```http
GET http://localhost:5000/api/chat/unread-count
```

**Important:** Make sure to include credentials (cookies) in all requests!

## 🐛 Common Issues & Solutions

### Issue 1: Socket Not Connecting
**Symptom:** No real-time updates
**Solution:**
- Check if backend is running on port 5000
- Verify CORS settings in server.js
- Check browser console for connection errors
- Try clearing browser cache

### Issue 2: Messages Not Sending
**Symptom:** "Failed to send message" error
**Solution:**
- Verify user is authenticated (check session)
- Confirm conversation exists
- Check if user is a participant
- Verify MongoDB connection

### Issue 3: Unread Count Not Updating
**Symptom:** Badge shows wrong number
**Solution:**
- Check Socket.IO connection
- Verify `message-notification` event listener
- Refresh the page
- Check backend logs for errors

### Issue 4: Cannot Start Conversation
**Symptom:** Error when clicking "Message" button
**Solution:**
- Verify alert has valid creator info
- Check if user is logged in
- Confirm user is not trying to message themselves
- Check backend logs for validation errors

## 🎯 Key Features to Test

- [x] Start conversation from alert card
- [x] Send and receive messages in real-time
- [x] Typing indicators
- [x] Read receipts (✓ and ✓✓)
- [x] Unread count badge in navbar
- [x] Conversation list sorting by recent activity
- [x] Message pagination (load older messages)
- [x] Auto-scroll to bottom on new message
- [x] Timestamp formatting
- [x] User profile pictures in chat

## 📱 UI Elements

### Navbar
- **Chat Icon**: Message bubble icon
- **Badge**: Red circle with unread count (shows 9+ if more than 9)

### Chat List (/chat)
- **Profile Picture**: User avatar or initial
- **Name**: Other user's name
- **Alert Title**: "Re: [Alert Title]"
- **Last Message**: Preview of last message
- **Timestamp**: Relative time (e.g., "5m ago")
- **Unread Badge**: Number of unread messages

### Chat Window (/chat/:conversationId)
- **Header**: Back button, profile pic, name, alert reference
- **Messages**: Speech bubbles (blue for sent, white for received)
- **Typing Indicator**: Animated dots
- **Read Status**: ✓ (sent) or ✓✓ (read)
- **Input**: Text field with send button
- **Auto-scroll**: Jumps to latest message

## 🔒 Security Reminders

1. **Never expose sensitive data** in messages
2. **Validate all inputs** on backend
3. **Check authorization** on every action
4. **Use HTTPS** in production
5. **Sanitize user inputs** to prevent XSS
6. **Rate limit** message sending (future enhancement)

## 📞 Support

If you encounter issues:
1. Check backend logs: `npm run dev` output
2. Check frontend console: Browser DevTools (F12)
3. Verify MongoDB connection
4. Review CHAT_IMPLEMENTATION.md for detailed docs
5. Check Socket.IO connection status

---

**Happy Chatting! 💬**

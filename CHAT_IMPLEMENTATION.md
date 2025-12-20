# Direct Messaging System - Implementation Guide

## 📋 Overview

This document describes the secure direct messaging system implemented for the Khoj project. The system allows users to communicate privately with alert creators through real-time chat.

## 🏗️ Architecture

### Database Models

#### 1. Conversation Model (`backend/src/models/Conversation.js`)
- Tracks 1-on-1 conversations between two users
- Links conversations to specific alerts
- Maintains unread message counts per participant
- Supports both User and Police participants

**Key Fields:**
- `participants`: Array of two users with their IDs and types
- `alertId`: Reference to the alert that initiated the conversation
- `lastMessage`: Cached last message for quick display
- `unreadCount`: Map of unread counts for each participant
- `isActive`: Soft delete flag

#### 2. Message Model (`backend/src/models/Message.js`)
- Stores individual messages
- Tracks read status and timestamps
- Supports soft deletion

**Key Fields:**
- `conversationId`: Reference to parent conversation
- `sender`/`receiver`: User info with polymorphic references
- `messageText`: Message content (max 2000 chars)
- `isRead`: Read status flag
- `readAt`: Timestamp when message was read

### Backend Implementation

#### Routes (`backend/src/routes/chatRoutes.js`)
All routes require authentication via `isAuthenticated` middleware.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/conversation` | Start or get existing conversation |
| GET | `/api/chat/conversations` | Get all user's conversations |
| GET | `/api/chat/conversation/:id/messages` | Get messages (paginated) |
| POST | `/api/chat/conversation/:id/message` | Send a message |
| PUT | `/api/chat/conversation/:id/read` | Mark messages as read |
| DELETE | `/api/chat/conversation/:id` | Delete conversation (soft) |
| GET | `/api/chat/unread-count` | Get total unread count |

#### Controller (`backend/src/controllers/chatController.js`)
Handles all chat operations with validation and authorization checks.

**Security Features:**
- Participant verification on every action
- Input sanitization (max 2000 chars per message)
- Prevents duplicate conversations
- Authorization checks before accessing messages

#### Socket.IO Integration (`backend/server.js`)
Real-time events for instant message delivery and notifications.

**Events:**
- `register`: Register user's socket connection
- `join-conversation`: Join a conversation room
- `leave-conversation`: Leave a conversation room
- `typing` / `stop-typing`: Typing indicators
- `new-message`: Real-time message delivery
- `message-notification`: Notify users of new messages
- `messages-read`: Update read status in real-time

### Frontend Implementation

#### Pages

**1. Chat Page (`frontend/src/pages/Chat.jsx`)**
- Lists all user's conversations
- Shows last message preview
- Displays unread count badges
- Real-time updates via Socket.IO

**2. Chat Window (`frontend/src/pages/ChatWindow.jsx`)**
- Full chat interface with message history
- Real-time message sending/receiving
- Typing indicators
- Read receipts (double check marks)
- Auto-scrolling to latest message

#### Services (`frontend/src/services/chatService.js`)
Axios-based API client for all chat endpoints with credential support.

#### Context (`frontend/src/context/SocketContext.js`)
Manages Socket.IO connection lifecycle:
- Connects when user logs in
- Disconnects when user logs out
- Provides socket instance to components
- Handles connection errors

#### Components

**Modified Components:**
- `AlertCard.jsx`: Added "Message" button to contact alert creators
- `Navbar.jsx`: Added chat icon with unread count badge
- `App.jsx`: Added chat routes and SocketProvider

## 🔐 Security Features

### Authentication & Authorization
- ✅ Session-based authentication (existing system)
- ✅ Participant validation on every action
- ✅ Cannot message yourself
- ✅ Only conversation participants can access messages

### Input Validation
- ✅ Message length limit (2000 characters)
- ✅ Text trimming and sanitization
- ✅ Required field validation

### Rate Limiting & Performance
- ✅ Pagination for message history (50 per page)
- ✅ Efficient database indexes
- ✅ Cached last message in conversation
- ✅ Socket.IO room-based broadcasting

### Data Protection
- ✅ Soft delete for conversations
- ✅ No sensitive data in messages
- ✅ CORS properly configured
- ✅ HTTP-only cookies

## 📦 Dependencies

### Backend
```json
"socket.io": "^4.x.x"
```

### Frontend
```json
"socket.io-client": "^4.x.x"
```

## 🚀 Usage Flow

### Starting a Conversation

1. **User views an alert** → Sees "Message" button
2. **Clicks "Message"** → `startConversation()` API call
3. **System checks** for existing conversation
4. **Navigates to chat** → Opens conversation in ChatWindow

### Sending Messages

1. **User types message** → Emits `typing` event
2. **User sends message** → POST to `/api/chat/conversation/:id/message`
3. **Socket.IO broadcasts** → `new-message` event to conversation room
4. **Recipient receives** → Message appears instantly
5. **Unread count updates** → Badge updates in navbar

### Real-time Updates

```javascript
// Frontend listens for events:
socket.on('new-message', (data) => {
  // Add message to UI
  // Play notification sound (optional)
});

socket.on('user-typing', (data) => {
  // Show "User is typing..." indicator
});

socket.on('messages-read', (data) => {
  // Update read status (✓✓)
});
```

## 🧪 Testing Checklist

- [ ] Start conversation from alert
- [ ] Send messages back and forth
- [ ] Test typing indicators
- [ ] Verify read receipts
- [ ] Check unread count badge
- [ ] Test message pagination
- [ ] Verify cannot message self
- [ ] Test offline message delivery
- [ ] Check conversation list sorting
- [ ] Verify soft delete functionality

## 🔧 Configuration

### Environment Variables (.env)
```env
# Existing variables
MONGODB_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret

# Socket.IO (uses same port as Express)
PORT=5000
```

### CORS Configuration
Already configured in `server.js`:
```javascript
origin: 'http://localhost:3000'
credentials: true
```

## 📊 Database Indexes

### Conversation Indexes
```javascript
{ 'participants.userId': 1 }          // Find user's conversations
{ alertId: 1 }                        // Find conversations by alert
{ updatedAt: -1 }                     // Sort by recent activity
{ 'participants.0.userId': 1, 
  'participants.1.userId': 1, 
  alertId: 1 }                        // Prevent duplicates (unique)
```

### Message Indexes
```javascript
{ conversationId: 1, createdAt: -1 } // Get messages for conversation
{ 'sender.userId': 1 }                // Find sent messages
{ 'receiver.userId': 1, isRead: 1 }  // Count unread messages
```

## 🐛 Troubleshooting

### Messages not appearing in real-time
- Check Socket.IO connection in browser console
- Verify user registered with socket (`register` event)
- Confirm joined conversation room

### Unread count not updating
- Check `message-notification` event listener
- Verify `getUnreadCount()` API call
- Check NavBar's useEffect dependencies

### Cannot start conversation
- Verify alert creator info is populated
- Check authentication status
- Confirm user is not trying to message themselves

## 🚀 Future Enhancements

1. **Message Encryption** - End-to-end encryption using crypto library
2. **File Attachments** - Image/video sharing via Cloudinary
3. **Message Search** - Full-text search in messages
4. **Notifications** - Push notifications for new messages
5. **Message Reactions** - Emoji reactions to messages
6. **Voice Messages** - Audio recording and playback
7. **Block/Report Users** - Safety features
8. **Message Threading** - Reply to specific messages

## 📝 Notes

- Conversations are automatically created when user clicks "Message" button
- Messages persist in database even if users are offline
- Socket.IO falls back to polling if WebSocket unavailable
- Conversation list sorted by most recent activity
- All timestamps use ISO 8601 format

---

**Implementation Date:** December 20, 2025  
**Project:** Khoj - Community Safety Platform  
**Team Member:** Mridul (Direct Messaging Feature)

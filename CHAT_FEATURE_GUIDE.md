# 📱 Chat Feature Implementation Guide

## Overview
Tính năng chat cho phép customers, dealers, và admins giao tiếp với nhau theo thời gian thực.

## Architecture

### Backend (NestJS + Socket.io)
```
api/src/modules/chat/
├── chat.module.ts        - Module config
├── chat.service.ts       - Business logic
├── chat.controller.ts    - HTTP endpoints
└── chat.gateway.ts       - WebSocket events
```

**Key Endpoints:**
- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/start` - Start new conversation
- `POST /api/chat/conversations/:id/messages` - Send message
- `GET /api/chat/conversations/:id/messages` - Get messages

### Frontend (React + Chakra UI)

**Components:**
```
frontend/src/components/chat/
├── ChatWindow.tsx        - Main chat interface
├── ChatList.tsx          - List of conversations
└── ChatWidget.tsx        - Floating chat button widget
```

**Pages:**
```
frontend/src/pages/chat/
└── chat.page.tsx         - Full chat page
```

### Admin (React + Tailwind CSS)

**Components:**
```
admin/src/views/admin/chat/
├── AdminChatWindow.tsx   - Chat interface for admin
├── AdminChatList.tsx     - Conversations list
└── index.tsx             - Main chat page
```

## Features

✅ **Real-time Messaging** - Socket.io WebSocket connection
✅ **Conversation Management** - Create and manage conversations
✅ **Search & Filter** - Find conversations by name
✅ **Online Status** - See when users are typing
✅ **Message History** - Load previous messages
✅ **Read Status** - Track read messages

## Database Schema

### Models in Prisma

```prisma
model Conversation {
  id                 Int
  customer_id        Int
  dealer_or_admin_id Int
  Customer           User      @relation("CustomerConversations")
  DealerOrAdmin      User      @relation("DealerAdminConversations")
  messages           Message[]
  created_at         DateTime
  updated_at         DateTime

  @@unique([customer_id, dealer_or_admin_id])
}

model Message {
  id              Int
  conversation_id Int
  sender_id       Int
  content         String
  attachment      String?
  is_read         Boolean
  Conversation    Conversation
  Sender          User
  created_at      DateTime
}
```

## WebSocket Events

**Server Events:**
- `join-conversation` - User joins a conversation room
- `send-message` - User sends a message
- `typing` - User is typing
- `stop-typing` - User stopped typing

**Client Events:**
- `new-message` - New message received
- `user-joined` - User joined conversation
- `user-typing` - Another user is typing
- `user-stop-typing` - User stopped typing

## Usage

### Frontend Integration

**1. Add ChatWidget to main layout:**
```tsx
import ChatWidget from '@/components/chat/ChatWidget';

function App() {
  return (
    <div>
      {/* Your layout */}
      <ChatWidget />
    </div>
  );
}
```

**2. Access full chat page:**
Navigate to `/chat` route

**3. Start conversation with dealer:**
```tsx
// From bike details page
import { useNavigate } from 'react-router-dom';

const handleContactDealer = async (dealerId: number) => {
  const response = await fetch('/api/chat/start', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ recipientId: dealerId })
  });
  navigate(`/chat?conversation=${response.id}`);
};
```

### Admin Integration

**1. Admin has access via sidebar menu**
- Navigate to Admin Dashboard → Chat
- Manager can see all conversations
- Real-time message updates

### Environment Variables

Make sure files have:

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3300
```

**Backend (.env):**
```
API_PORT=3300
CORS_ALLOW_URL=http://localhost:3000,http://localhost:3002,etc
```

## WebSocket Connection

The chat uses Socket.io with automatic reconnection:

```typescript
const socket = io(API_URL, {
  path: '/socket.io',
  namespace: '/chat',
  auth: { token },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## Security

✅ **JWT Authentication** - All routes protected with JWT tokens
✅ **User Isolation** - Users can only see their own conversations
✅ **Authorization** - Verify user belongs to conversation before allowing message

## Testing

### Manual Testing

1. **Start Backend:**
   ```bash
   cd api
   npm run start:dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Chat:**
   - Login as customer
   - Navigate to dealer profile
   - Click "Chat" button
   - Send message
   - Check real-time update in admin panel

### WebSocket Testing

Use Socket.io client to test events:
```typescript
const socket = io('localhost:3300', {
  namespace: '/chat',
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  socket.emit('join-conversation', { conversationId: 1, userId: 2 });
});

socket.on('new-message', (msg) => console.log(msg));
```

## Future Enhancements

- 📎 File/Image uploads
- 🔔 Push notifications
- 👥 Group chats
- 📌 Pin important messages
- 🔍 Message search
- 🎤 Voice messages
- 🎥 Video calls

## Troubleshooting

**Issue: WebSocket connection fails**
- Check CORS_ALLOW_URL in backend .env
- Verify Socket.io namespace is `/chat`
- Check browser console for connection errors

**Issue: Messages not sending**
- Verify JWT token is valid
- Check conversation_id is correct
- Look for 401/403 errors in network tab

**Issue: Real-time updates not working**
- Check WebSocket connection in DevTools
- Verify both users are in same conversation room
- Check namespace path is `/api/socket.io`

---

For more info, check:
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Socket.io Documentation](https://socket.io/docs/)
- [Prisma Relations](https://www.prisma.io/docs/concepts/relations)

# Quick Start Guide

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## App Flow

### 1. Home Page (`/`)
- Welcome page visible to all users
- Feature overview
- Login/Get started buttons

### 2. Authentication (`/login`)
- Combined login and signup interface
- Toggle between login and signup modes
- Error handling and loading states
- Backend-driven authentication
- Token stored in localStorage
- Redirects to dashboard on success

### 3. Protected Routes (Requires Login)

#### Dashboard (`/dashboard`)
- Stats overview (files, chats, messages)
- Recent activity
- Navigation to other features

#### Files (`/files`)
- Upload new files
- View list of uploaded files
- Download files
- Delete files
- File metadata display

#### Chatbot (`/chatbot`)
- Create multiple chat sessions
- Send messages to AI
- View conversation history
- Manage sessions

## How It Works

### Authentication
1. Backend handles Firebase auth (not exposed to frontend)
2. Frontend sends email/password to backend API
3. Backend returns JWT token + user data
4. Token stored in localStorage and AuthContext
5. Token auto-included in all API requests
6. Invalid token triggers logout and redirect

### API Calls
- All API calls through centralized Axios client
- Automatic bearer token injection
- Error handling with 401 redirect
- TypeScript support

### State Management
- React Context for auth state
- Custom hooks (`useAuth`)
- Persistent storage in localStorage
- Client-side validation and error handling

## Key Files to Understand

| File | Purpose |
|------|---------|
| `src/api/config.ts` | Axios setup with interceptors |
| `src/context/AuthContext.tsx` | Global auth state |
| `src/hooks/useAuth.ts` | Auth hook |
| `src/components/ProtectedRoute.tsx` | Route protection |
| `src/components/Navbar.tsx` | Navigation |
| `app/layout.tsx` | Root layout with providers |

## Development Tips

### Using Auth in Components
```typescript
'use client';
import { useAuth } from '@/src/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return <div>{user?.name}</div>;
}
```

### Making API Calls
```typescript
import { filesApi } from '@/src/api';

async function loadFiles() {
  try {
    const files = await filesApi.getFiles();
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

### Creating New API Module
1. Create `src/api/newfeature.ts`
2. Define types/interfaces
3. Export async functions using `apiClient`
4. Export from `src/api/index.ts`

## Build & Deploy

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

## Troubleshooting

### 401 Unauthorized
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Clear localStorage and login again

### File Upload Failed
- Check file size limits
- Verify backend file upload endpoint
- Check CORS configuration

### Components Not Rendering
- Ensure client components use `'use client'`
- Check if wrapped with AuthProvider
- Verify auth state with useAuth hook

## Backend API Endpoints

These endpoints should exist on your backend:

```
POST /auth/login
POST /auth/signup
POST /auth/logout
GET /auth/verify

GET /files
POST /files/upload
GET /files/:id
DELETE /files/:id

GET /chatbot/sessions
POST /chatbot/sessions
GET /chatbot/sessions/:id
POST /chatbot/sessions/:id/messages
DELETE /chatbot/sessions/:id
```

## Next Steps

1. ✅ Frontend skeleton setup
2. 🔄 Integrate with backend API
3. 🎨 Customize styling and branding
4. 🧪 Add unit and integration tests
5. 📱 Add mobile optimizations
6. 🔐 Add advanced auth features (2FA, OAuth)
7. 🚀 Deploy to production

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

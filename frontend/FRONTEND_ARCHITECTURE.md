# Frontend Architecture

This is a Next.js frontend application structured with industry best practices for scalability and maintainability.

## 📁 Folder Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (public)
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx          # Login/Signup page
│   ├── (protected)/              # Protected routes (requires login)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── files/
│   │   │   └── page.tsx
│   │   └── chatbot/
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── src/
│   ├── api/                      # API client layer
│   │   ├── config.ts             # Axios instance with interceptors
│   │   ├── auth.ts               # Authentication endpoints
│   │   ├── files.ts              # File management endpoints
│   │   ├── chatbot.ts            # Chatbot endpoints
│   │   └── index.ts              # Barrel export
│   ├── context/                  # React Context
│   │   ├── AuthContext.tsx       # Auth state management
│   │   └── index.ts              # Barrel export
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Auth hook
│   │   └── index.ts              # Barrel export
│   ├── components/               # Reusable components
│   │   ├── Navbar.tsx            # Navigation component
│   │   ├── ProtectedRoute.tsx    # Route protection wrapper
│   │   └── index.ts              # Barrel export
│   └── utils/                    # Utility functions
│       ├── storage.ts            # localStorage helpers
│       └── index.ts              # Barrel export
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🔑 Key Features

### 1. **Authentication (Backend-Driven)**
- Login/Signup via backend API
- Token-based authentication stored in localStorage
- AuthContext for global state management
- Token auto-included in all API requests via axios interceptor
- Auto redirect to login on 401 errors

### 2. **Protected Routes**
- `(protected)` route group for authenticated-only pages
- `ProtectedRoute` component that checks auth state
- Automatic redirect to login if not authenticated

### 3. **API Client**
- Centralized Axios instance in `src/api/config.ts`
- Request interceptor adds bearer token to all requests
- Response interceptor handles 401 errors
- Separate API modules for different features (auth, files, chatbot)
- Full TypeScript support with interfaces

### 4. **State Management**
- React Context API for global auth state
- Custom `useAuth` hook for component-level access
- Persistent token storage in localStorage
- Loading states and error handling

### 5. **Pages Implemented**

#### Public Pages
- **Home** (`/`) - Landing page with feature overview
- **Login** (`/login`) - Combined login/signup form

#### Protected Pages
- **Dashboard** (`/dashboard`) - Stats and activity overview
- **Files** (`/files`) - File upload, list, and management
- **Chatbot** (`/chatbot`) - AI chat interface with multiple sessions

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file based on `.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📚 API Integration

All API calls go through `src/api/` modules. Each module exports:
- **Types/Interfaces** - TypeScript types for requests/responses
- **API Functions** - Async functions that handle API calls

### Example Usage
```typescript
import { useAuth } from '@/src/hooks/useAuth';
import { filesApi } from '@/src/api';

export default function MyComponent() {
  const { user } = useAuth();
  
  const loadFiles = async () => {
    try {
      const files = await filesApi.getFiles();
      // Handle files
    } catch (error) {
      // Handle error
    }
  };
}
```

## 🔐 Authentication Flow

1. User fills login/signup form on `/login`
2. Form data sent to backend API
3. Backend returns token and user data
4. Frontend stores token in localStorage and AuthContext
5. Token auto-included in all subsequent requests
6. On 401, token cleared and user redirected to login

## 📦 Dependencies

- **next** - React framework
- **react** - UI library
- **axios** - HTTP client for API requests
- **tailwindcss** - Utility-first CSS framework

## 🎨 Styling

- **Tailwind CSS** for all styling
- Consistent color scheme (blue primary)
- Responsive design (mobile-first approach)
- Dark mode ready (can be extended)

## 🔄 Common Patterns

### Using Protected Routes
```typescript
// Automatically wrapped with auth check
// pages in (protected) folder
export default function MyPage() {
  const { user } = useAuth();
  return <div>Welcome {user?.name}</div>;
}
```

### Making API Calls
```typescript
import { authApi, filesApi } from '@/src/api';

// In component
const response = await authApi.login(email, password);
const files = await filesApi.getFiles();
```

### Accessing Auth State
```typescript
import { useAuth } from '@/src/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Hello {user?.name}</div>;
}
```

## 📝 Notes

- All components using auth state or API calls must be client components (`'use client'`)
- Environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in browser
- API responses should follow the backend's ApiResponse format
- Error handling is implemented in each API module and component levels

## 🚦 Next Steps

1. Install dependencies: `npm install`
2. Create `.env.local` with backend API URL
3. Start development server: `npm run dev`
4. Customize components and add more features as needed

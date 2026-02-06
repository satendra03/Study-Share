# StudyShare Developer Guide

## Welcome Developers! 👨‍💻👩‍💻

This guide provides comprehensive information for developers who want to contribute to StudyShare, understand its architecture, or build integrations with the platform.

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Architecture](#project-architecture)
3. [Code Structure](#code-structure)
4. [Development Workflow](#development-workflow)
5. [Database Schema](#database-schema)
6. [API Integration](#api-integration)
7. [Frontend Development](#frontend-development)
8. [Backend Development](#backend-development)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Contributing Guidelines](#contributing-guidelines)
12. [Code Style Guide](#code-style-guide)
13. [Troubleshooting](#troubleshooting)

---

## Development Environment Setup

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Minimum Version | Recommended Version |
|------|----------------|---------------------|
| Node.js | 16.x | 18.x or higher |
| npm | 8.x | 9.x or higher |
| Git | 2.30+ | Latest |
| MongoDB | 5.0+ | 6.0+ |
| VS Code | - | Latest (recommended IDE) |

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 20.04+
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **Internet**: Stable connection for package downloads

### Initial Setup

#### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/satendra03/study-share.git

# Or clone via SSH
git clone git@github.com:satendra03/study-share.git

# Navigate to project directory
cd study-share
```

#### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 3. Environment Configuration

**Backend Environment Variables** (`.env`):

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/studyshare
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/studyshare

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,docx,pptx,txt,zip

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Frontend Environment Variables** (`.env.local`):

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Application
NEXT_PUBLIC_APP_NAME=StudyShare
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

#### 4. Database Setup

**Local MongoDB:**

```bash
# Start MongoDB service
# On macOS (using Homebrew)
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows
# Start MongoDB from Services or run:
mongod --dbpath="C:\data\db"
```

**MongoDB Atlas (Cloud):**

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Add to `MONGODB_URI` in `.env`

**Initialize Database:**

```bash
# Run migration scripts (if available)
cd backend
npm run migrate

# Or seed initial data
npm run seed
```

#### 5. Third-Party Service Setup

**Cloudinary Setup:**

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Navigate to Dashboard
3. Copy `Cloud Name`, `API Key`, and `API Secret`
4. Add to backend `.env`

**Gemini AI Setup:**

1. Visit [makersuite.google.com](https://makersuite.google.com)
2. Create an API key
3. Add to backend `.env` as `GEMINI_API_KEY`

#### 6. Running the Application

**Option A: Run Both Servers Separately**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option B: Run Concurrently (if configured)**

```bash
# From root directory
npm run dev
```

#### 7. Verify Installation

1. Backend should be running on `http://localhost:5000`
2. Frontend should be running on `http://localhost:3000`
3. Test API: `curl http://localhost:5000/api/health`
4. Open browser: `http://localhost:3000`

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Web App    │  │  Mobile App  │  │   Desktop    │ │
│  │  (Next.js)   │  │   (Future)   │  │   (Future)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Next.js Frontend                      │   │
│  │  • React Components  • State Management         │   │
│  │  • Routing          • API Integration           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     API Layer                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Express.js Backend                    │   │
│  │  • REST API        • Authentication             │   │
│  │  • Middleware      • Business Logic             │   │
│  │  • Validation      • Error Handling             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   MongoDB    │ │  Cloudinary  │ │  Gemini AI   │
│   Database   │ │ File Storage │ │  Services    │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Technology Stack Deep Dive

#### Frontend Stack

**Next.js 14+ (App Router)**
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes
- Image optimization
- Built-in routing

**React 18+**
- Component-based architecture
- Hooks for state management
- Context API for global state
- Suspense for loading states

**TypeScript**
- Type safety
- Better IDE support
- Reduced runtime errors
- Enhanced developer experience

**Tailwind CSS**
- Utility-first styling
- Responsive design
- Custom theme configuration
- Dark mode support

**shadcn/ui**
- Pre-built accessible components
- Customizable design system
- Radix UI primitives

#### Backend Stack

**Node.js with Express.js**
- RESTful API architecture
- Middleware pipeline
- Error handling
- Route management

**TypeScript**
- Type-safe backend code
- Better maintainability
- Enhanced tooling

**MongoDB with Mongoose**
- NoSQL document database
- Schema validation
- Query building
- Middleware hooks

**JWT Authentication**
- Stateless authentication
- Token-based security
- Role-based access control

---

## Code Structure

### Frontend Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/              # Dashboard routes group
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Dashboard home
│   │   ├── materials/
│   │   │   ├── page.tsx          # Materials list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Material details
│   │   │   └── upload/
│   │   │       └── page.tsx      # Upload material
│   │   ├── subjects/
│   │   └── profile/
│   ├── api/                      # API routes (if any)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── materials/                # Material-related components
│   │   ├── MaterialCard.tsx
│   │   ├── MaterialList.tsx
│   │   ├── MaterialUpload.tsx
│   │   └── MaterialFilters.tsx
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── common/                   # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── SEO.tsx
│
├── lib/                          # Utility libraries
│   ├── api/                      # API client
│   │   ├── axios.ts              # Axios configuration
│   │   ├── endpoints.ts          # API endpoints
│   │   └── types.ts              # API types
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useMaterials.ts
│   │   └── useDebounce.ts
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── constants/                # Constants
│       ├── routes.ts
│       ├── config.ts
│       └── enums.ts
│
├── context/                      # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── MaterialsContext.tsx
│
├── types/                        # TypeScript type definitions
│   ├── user.ts
│   ├── material.ts
│   ├── subject.ts
│   └── api.ts
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                       # Additional styles
│   └── custom.css
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

### Backend Structure

```
backend/
├── src/
│   ├── config/                   # Configuration files
│   │   ├── database.ts           # Database configuration
│   │   ├── cloudinary.ts         # Cloudinary setup
│   │   ├── gemini.ts             # AI configuration
│   │   └── constants.ts          # App constants
│   │
│   ├── models/                   # Mongoose models
│   │   ├── User.ts               # User schema
│   │   ├── Material.ts           # Material schema
│   │   ├── Subject.ts            # Subject schema
│   │   ├── Like.ts               # Like schema
│   │   └── Download.ts           # Download tracking
│   │
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.ts    # Authentication logic
│   │   ├── material.controller.ts
│   │   ├── subject.controller.ts
│   │   ├── user.controller.ts
│   │   └── ai.controller.ts
│   │
│   ├── routes/                   # API routes
│   │   ├── auth.routes.ts
│   │   ├── material.routes.ts
│   │   ├── subject.routes.ts
│   │   ├── user.routes.ts
│   │   ├── ai.routes.ts
│   │   └── index.ts              # Routes aggregator
│   │
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── role.middleware.ts    # Role checking
│   │   ├── upload.middleware.ts  # File upload handling
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts   # Error handling
│   │   └── rateLimit.middleware.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts       # Auth operations
│   │   ├── material.service.ts   # Material operations
│   │   ├── email.service.ts      # Email sending
│   │   ├── cloudinary.service.ts # File uploads
│   │   └── ai.service.ts         # AI integration
│   │
│   ├── utils/                    # Utility functions
│   │   ├── jwt.util.ts           # JWT helpers
│   │   ├── password.util.ts      # Password hashing
│   │   ├── validation.util.ts    # Input validation
│   │   ├── logger.util.ts        # Logging
│   │   └── response.util.ts      # Response formatting
│   │
│   ├── types/                    # TypeScript types
│   │   ├── express.d.ts          # Express extensions
│   │   ├── user.types.ts
│   │   ├── material.types.ts
│   │   └── api.types.ts
│   │
│   ├── validators/               # Validation schemas
│   │   ├── auth.validator.ts     # Auth validation
│   │   ├── material.validator.ts
│   │   └── user.validator.ts
│   │
│   └── app.ts                    # Express app setup
│
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/              # Integration tests
│   │   ├── auth.test.ts
│   │   └── materials.test.ts
│   └── setup.ts                  # Test configuration
│
├── scripts/                      # Utility scripts
│   ├── seed.ts                   # Database seeding
│   ├── migrate.ts                # Migrations
│   └── cleanup.ts                # Cleanup scripts
│
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── tsconfig.json                 # TypeScript config
├── package.json
└── server.ts                     # Entry point
```

---

## Development Workflow

### Git Workflow

We follow the **Git Flow** branching model:

```
main (production)
  │
  ├── develop (development)
  │     │
  │     ├── feature/user-authentication
  │     ├── feature/material-upload
  │     ├── bugfix/login-validation
  │     └── hotfix/security-patch
  │
  └── release/v1.0.0
```

### Branch Naming Conventions

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `release/version-number` - Release preparation
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation changes

### Commit Message Format

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add email verification
fix(upload): resolve file size validation error
docs(api): update authentication endpoints
refactor(materials): optimize database queries
test(auth): add unit tests for login controller
```

### Development Process

#### 1. Create Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/material-search
```

#### 2. Development

```bash
# Make changes
# ...

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

#### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional message
git commit -m "feat(search): implement AI-powered material search"
```

#### 4. Push and Create PR

```bash
# Push to remote
git push origin feature/material-search

# Create Pull Request on GitHub
# - Add description
# - Link related issues
# - Request reviews
```

#### 5. Code Review

- Address review comments
- Make requested changes
- Push updates
- Get approval

#### 6. Merge

```bash
# Merge to develop (squash and merge preferred)
# Delete feature branch after merge
```

---

## Database Schema

### User Model

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string; // hashed
  role: 'student' | 'faculty' | 'admin';
  department: string;
  semester?: number; // for students
  rollNumber?: string; // for students
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Material Model

```typescript
interface IMaterial {
  _id: ObjectId;
  title: string;
  description: string;
  subject: ObjectId; // ref: Subject
  type: 'notes' | 'pyq' | 'slides' | 'other';
  semester: number;
  department: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  cloudinaryId: string;
  uploadedBy: ObjectId; // ref: User
  tags: string[];
  likes: number;
  downloads: number;
  views: number;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subject Model

```typescript
interface ISubject {
  _id: ObjectId;
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  description?: string;
  syllabus?: string;
  faculty: ObjectId[]; // ref: User
  createdAt: Date;
  updatedAt: Date;
}
```

### Like Model

```typescript
interface ILike {
  _id: ObjectId;
  user: ObjectId; // ref: User
  material: ObjectId; // ref: Material
  createdAt: Date;
}
```

### Download Model

```typescript
interface IDownload {
  _id: ObjectId;
  user: ObjectId; // ref: User
  material: ObjectId; // ref: Material
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### Database Indexes

```typescript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, department: 1 });

// Material indexes
db.materials.createIndex({ subject: 1, semester: 1 });
db.materials.createIndex({ uploadedBy: 1 });
db.materials.createIndex({ title: 'text', description: 'text' });
db.materials.createIndex({ createdAt: -1 });
db.materials.createIndex({ likes: -1 });

// Like indexes
db.likes.createIndex({ user: 1, material: 1 }, { unique: true });
db.likes.createIndex({ material: 1 });

// Download indexes
db.downloads.createIndex({ material: 1 });
db.downloads.createIndex({ createdAt: -1 });
```

Ensure the text index above is present in production. Add the following startup validation to check indexes once at app initialization:

```typescript
// src/utils/db.util.ts
import Material from '../models/Material';

export const validateIndexes = async () => {
  const indexes = await Material.collection.indexes();
  const hasTextIndex = indexes.some((idx: any) => {
    return Object.values(idx.key || {}).includes('text');
  });
  if (!hasTextIndex) {
    throw new Error(
      'Text search index missing on Material. Create with: db.materials.createIndex({ title: "text", description: "text" })'
    );
  }
  console.log('✓ Material text index verified');
};
```

Call during app startup:

```typescript
// src/index.ts
import { validateIndexes } from './utils/db.util';

const startApp = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await validateIndexes();
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
};

startApp().catch((error) => {
  console.error('App startup failed:', error);
  process.exit(1);
});
```

### Environment Validation at Startup

Validate required environment variables early in your app initialization to catch misconfiguration before runtime errors occur:

```typescript
// src/utils/env.util.ts
export const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_API_KEY',
    'GEMINI_API_KEY'
  ];

  const missing: string[] = [];
  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file and try again.`
    );
  }

  console.log('✓ Environment validation passed');
};
```

Call `validateEnv()` at the start of your app:

```typescript
// src/index.ts
import { validateEnv } from './utils/env.util';
import { validateIndexes } from './utils/db.util';

validateEnv(); // Check env vars first

const startApp = async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await validateIndexes();
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
};

startApp().catch((error) => {
  console.error('App startup failed:', error);
  process.exit(1);
});
```

---

## API Integration

### API Client Setup (Frontend)

**Create Axios Instance:**

```typescript
// lib/api/axios.ts
import axios from 'axios';

// Security note: Storing JWTs in localStorage is vulnerable to XSS. For
// production, prefer httpOnly, Secure cookies with SameSite flags or a
// refresh-token flow. Mitigations if storing tokens in the browser include
// strict Content Security Policy (CSP), input sanitization, and SameSite cookie
// settings. Use localStorage only for demos or non-sensitive prototypes.

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // NOTE: Consider replacing this pattern with httpOnly cookie auth in production
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
```

**API Service Example:**

```typescript
// lib/api/materials.ts
import api from './axios';
import { Material, MaterialFilters } from '@/types/material';

export const materialApi = {
  // Get all materials
  getAll: async (filters?: MaterialFilters) => {
    return api.get<{ materials: Material[] }>('/materials', {
      params: filters,
    });
  },

  // Get single material
  getById: async (id: string) => {
    return api.get<{ material: Material }>(`/materials/${id}`);
  },

  // Upload material
  upload: async (formData: FormData) => {
    return api.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update material
  update: async (id: string, data: Partial<Material>) => {
    return api.put(`/materials/${id}`, data);
  },

  // Delete material
  delete: async (id: string) => {
    return api.delete(`/materials/${id}`);
  },

  // Like material
  like: async (id: string) => {
    return api.post(`/materials/${id}/like`);
  },
};
```

**Custom Hook Example:**

```typescript
// lib/hooks/useMaterials.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '@/lib/api/materials';
import { MaterialFilters } from '@/types/material';

export const useMaterials = (filters?: MaterialFilters) => {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: () => materialApi.getAll(filters),
  });
};

export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => materialApi.getById(id),
    enabled: !!id,
  });
};

export const useUploadMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

export const useLikeMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialApi.like,
    onSuccess: (_, materialId) => {
      queryClient.invalidateQueries({ queryKey: ['material', materialId] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};
```

---

## Frontend Development

### Component Development

**Example Component:**

```typescript
// components/materials/MaterialCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Heart } from 'lucide-react';
import { Material } from '@/types/material';
import { useLikeMaterial } from '@/lib/hooks/useMaterials';

interface MaterialCardProps {
  material: Material;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const likeMutation = useLikeMaterial();

  const handleLike = async () => {
    try {
      await likeMutation.mutateAsync(material.id);
    } catch (error) {
      console.error('Failed to like material:', error);
    }
  };

  const handleDownload = () => {
    window.open(material.fileUrl, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-1">{material.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {material.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              <Heart 
                className={material.isLiked ? 'fill-red-500 text-red-500' : ''} 
              />
              {material.likes}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download />
              Download
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {material.downloads} downloads
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
```

### State Management

**Using React Context:**

```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';
import { authApi } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // NOTE: Storing tokens in localStorage is susceptible to XSS. For
        // production apps prefer httpOnly, Secure cookies with SameSite and a
        // refresh-token rotation flow. If using localStorage, add CSP and
        // input sanitization to mitigate XSS risks.
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authApi.getMe();
          setUser(userData.user);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Backend Development

### Controller Example

```typescript
// src/controllers/material.controller.ts
import { Request, Response, NextFunction } from 'express';
import { materialService } from '../services/material.service';
import { AppError } from '../utils/error.util';
import { successResponse } from '../utils/response.util';

export const materialController = {
  // Get all materials
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        subject: req.query.subject as string,
        semester: req.query.semester ? Number(req.query.semester) : undefined,
        department: req.query.department as string,
        type: req.query.type as string,
        search: req.query.search as string,
        sort: req.query.sort as string || 'recent',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await materialService.getAll(filters);

      return successResponse(res, result, 'Materials retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  // Get single material
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const material = await materialService.getById(id, userId);

      if (!material) {
        throw new AppError('Material not found', 404);
      }

      return successResponse(res, { material }, 'Material retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  // Upload material
  upload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('Please upload a file', 400);
      }

      const materialData = {
        ...req.body,
        uploadedBy: req.user!.id,
      };

      const material = await materialService.create(materialData, req.file);

      return successResponse(
        res,
        { material },
        'Material uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  },

  // Update material
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const material = await materialService.update(
        id,
        req.body,
        userId,
        userRole
      );

      return successResponse(res, { material }, 'Material updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // Delete material
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      await materialService.delete(id, userId, userRole);

      return successResponse(res, null, 'Material deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  // Like material
  like: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await materialService.toggleLike(id, userId);

      return successResponse(res, result, 'Material like toggled successfully');
    } catch (error) {
      next(error);
    }
  },
};
```

### Service Example

```typescript
// src/services/material.service.ts
import Material from '../models/Material';
import Like from '../models/Like';
import Download from '../models/Download';
import { cloudinaryService } from './cloudinary.service';
import { AppError } from '../utils/error.util';

export const materialService = {
  // Get all materials
  getAll: async (filters: any) => {
    const {
      subject,
      semester,
      department,
      type,
      search,
      sort,
      page,
      limit,
    } = filters;

    const query: any = { status: 'approved' };

    if (subject) query.subject = subject;
    if (semester) query.semester = semester;
    if (department) query.department = department;
    if (type) query.type = type;
    if (search) {
      // Text index is validated at startup; safe to use here
      query.$text = { $search: search };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') sortOption = { downloads: -1 };
    if (sort === 'liked') sortOption = { likes: -1 };

    const skip = (page - 1) * limit;

    const [materials, total] = await Promise.all([
      Material.find(query)
        .populate('subject', 'name code')
        .populate('uploadedBy', 'name email role')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Material.countDocuments(query),
    ]);

    return {
      materials,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  },

  // Create material
  create: async (data: any, file: Express.Multer.File) => {
    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadFile(file);

    const material = await Material.create({
      ...data,
      fileUrl: uploadResult.secure_url,
      fileType: file.mimetype,
      fileSize: file.size,
      cloudinaryId: uploadResult.public_id,
      status: 'pending', // Requires admin approval
    });

    return material;
  },

  // Toggle like
  toggleLike: async (materialId: string, userId: string) => {
    const existingLike = await Like.findOne({
      material: materialId,
      user: userId,
    });

    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();
      await Material.findByIdAndUpdate(materialId, {
        $inc: { likes: -1 },
      });

      return {
        isLiked: false,
        totalLikes: (await Material.findById(materialId))?.likes || 0,
      };
    } else {
      // Like
      await Like.create({
        material: materialId,
        user: userId,
      });
      await Material.findByIdAndUpdate(materialId, {
        $inc: { likes: 1 },
      });

      return {
        isLiked: true,
        totalLikes: (await Material.findById(materialId))?.likes || 0,
      };
    }
  },
};
```

### Middleware Example

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../utils/error.util';

interface JWTPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    let token: string | undefined;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    // Verify token using JWT_SECRET validated at startup
    // A validateEnv function checks required env vars at app init:
    //   function validateEnv() {
    //     const required = ['JWT_SECRET', ...];
    //     required.forEach(k => { if (!process.env[k]) throw new Error(`Missing: ${k}`); });
    //   }
    // Call validateEnv() before starting the app. Then JWT_SECRET is safe to use:
    const jwtSecret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as JWTPayload;

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

// Role-based authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};
```

---

## Testing

### Unit Testing (Jest)

**Setup:**

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Test Example:**

```typescript
// __tests__/utils/validators.test.ts
import { validateEmail, validatePassword } from '@/lib/utils/validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@college.edu')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should return false for email without domain', () => {
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for strong password', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
    });

    it('should return false for short password', () => {
      expect(validatePassword('Short1!')).toBe(false);
    });

    it('should return false for password without uppercase', () => {
      expect(validatePassword('lowercase123!')).toBe(false);
    });
  });
});
```

### Component Testing

```typescript
// __tests__/components/MaterialCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MaterialCard } from '@/components/materials/MaterialCard';
import { Material } from '@/types/material';

const mockMaterial: Material = {
  id: '1',
  title: 'Test Material',
  description: 'Test description',
  likes: 10,
  downloads: 50,
  isLiked: false,
  fileUrl: 'https://example.com/file.pdf',
};

describe('MaterialCard', () => {
  it('renders material information correctly', () => {
    render(<MaterialCard material={mockMaterial} />);
    
    expect(screen.getByText('Test Material')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls like handler when like button clicked', () => {
    const { getByRole } = render(<MaterialCard material={mockMaterial} />);
    
    const likeButton = getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    // Add assertions for like functionality
  });
});
```

### API Testing (Supertest)

```typescript
// __tests__/api/auth.test.ts
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@college.edu',
        password: 'TestPass123!',
        department: 'Computer Science',
        semester: 5,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      // Create user first
      await User.create({
        name: 'Existing User',
        email: 'existing@college.edu',
        password: 'hashedpassword',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'existing@college.edu',
          password: 'TestPass123!',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test auth.test.ts
```

---

## Code Style Guide

### TypeScript Style

**Naming Conventions:**

```typescript
// Interfaces - PascalCase with 'I' prefix
interface IUser {}

// Types - PascalCase
type UserRole = 'student' | 'faculty' | 'admin';

// Classes - PascalCase
class MaterialService {}

// Functions - camelCase
function getUserById() {}

// Constants - UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Enums - PascalCase
enum MaterialType {
  Notes = 'notes',
  PYQ = 'pyq',
  Slides = 'slides',
}
```

**File Naming:**

```
components/MaterialCard.tsx         # PascalCase for components
utils/validators.ts                 # camelCase for utilities
hooks/useMaterials.ts              # camelCase with 'use' prefix
services/material.service.ts       # camelCase with '.service' suffix
```

### Code Formatting

**ESLint Configuration:**

```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

**Prettier Configuration:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### Best Practices

1. **Always use TypeScript strict mode**
2. **Prefer functional components** over class components
3. **Use async/await** instead of promise chains
4. **Handle errors explicitly** - don't silently fail
5. **Write self-documenting code** - clear variable names
6. **Keep functions small** - single responsibility
7. **Use destructuring** for cleaner code
8. **Avoid magic numbers** - use named constants

---

## Troubleshooting

### Common Issues

**Issue: MongoDB connection fails**

```bash
# Check if MongoDB is running
# On macOS
brew services list

# On Ubuntu
sudo systemctl status mongod

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/studyshare
```

**Issue: File uploads failing**

```typescript
// Check Cloudinary configuration
console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.substring(0, 5) + '...',
});

// Verify file size
console.log('File size:', file.size, 'Max:', MAX_FILE_SIZE);
```

**Issue: JWT token expired**

```typescript
// Implement token refresh logic
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);
    return newAccessToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
```

---

## Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools)

### Community
- [GitHub Discussions](https://github.com/satendra03/Study-Share/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/studyshare)

---

## Contributing

See [Contributing Guidelines](../README.md/#-contributing) in the main README.

For detailed API documentation, see [API.md](API.md).

---

**Last Updated**: February 2026  
**Version**: 1.0

Happy Coding! 🚀
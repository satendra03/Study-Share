https://www.awwwards.com/sites/finsight Refrence for UI/UX

# Study-Share Frontend Architecture & API Guide

This document outlines the entire structure, architectural recommendations, and API endpoints you need to successfully build the Study-Share frontend.

## 1. Quick Overview
The backend provides a comprehensive RESTful API to power the Study-Share platform. To build the frontend, you will be interacting with various modules: **Authentication** (backed by Firebase), **Materials Delivery & Uploads**, a **General Chatbot**, **Code Execution**, and an **Admin Dashboard**.

## 2. Tech Stack Recommendations
To quickly build a robust and modern application with excellent user experience, here is the recommended tech stack:
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS + Shadcn UI (for beautiful, accessible, copy-paste components)
- **State & Data Fetching:** 
  - *React Query (TanStack Query)* for seamless data fetching, caching, and server state management.
  - *Zustand* for localized client global state (UI drawers, theme).
- **Authentication:** Firebase Authentication (Google Auth)
- **PDF Viewer:** Standard browser `<embed>` or `react-pdf` for robust document rendering.
- **Code Editor Playground:** `@monaco-editor/react` (for an interactive VSCode-like editor feel).

## 3. Core System Concepts
- **Firebase Token Authorizations:** All PROTECTED API routes are safeguarded by the `verifyFirebaseToken` middleware. Your frontend must fetch the current user's active ID token using Firebase (`await auth.currentUser.getIdToken()`) and attach it to the request headers:
  ```json
  { "Authorization": "Bearer <YOUR_FIREBASE_TOKEN>" }
  ```
- **Registration Flow:** After signing into Google (via Firebase Auth popup), you must check whether the user has a completed profile in the app database. A subsequent redirect must ask them to select a role ("Student" or "Teacher") to complete their setup.

---

## 4. Complete API Routes Breakdown
*Base URL: `/api`*

### 🛡️ Authentication & User ( `/api/auth` / `/api/user` )
*The gateway into the platform. Includes profile verification functionality.*
- `POST /api/auth/signin`
  - **Action:** Check if the signed-in user exists in our DB after Google login.
- `POST /api/auth/register/student`
  - **Action:** Complete a student's profile setup.
- `POST /api/auth/register/teacher`
  - **Action:** Complete a teacher's profile (teachers may remain unverified until admin approval).
- `GET /api/auth/me` *(Protected)*
  - **Action:** Fetch the current logged-in user's profile to hydrate your application state on load.
- `GET /api/user/:id` / `GET /api/user/email` / `GET /api/user/firebase` 
  - **Action:** Fetch explicit users.
- `PUT /api/user/:id` *(Protected)*
  - **Action:** Edit and update user details and settings.

### 📚 Materials & Documents ( `/api/materials` )
*Handle discovery, reading, stats, and safe document uploading.*
- `GET /api/materials`
  - **Action:** Retrieve universally readable documents/materials for global feed.
- `GET /api/materials/search?query=...`
  - **Action:** Search materials by keyword/title.
- `GET /api/materials/:materialId`
  - **Action:** Retrieve material metadata and physical URL string.
- `POST /api/materials/:materialId/download`
  - **Action:** Trigger this to log a download analytic before showing the physical file natively to the user.
- `POST /api/materials` *(Protected)*
  - **Action:** Upload a new generic document. **Important:** Requires a `multipart/form-data` request where the document itself sits in the `file` key.
- `GET /api/materials/status/:materialId` *(Protected)*
  - **Action:** Used for polling/streaming UI! Poll this to visualize backend processing status (Extracting Text -> Generating Vectors -> Completed).
- `GET /api/materials/user/:userId` *(Protected)*
  - **Action:** Lists current user's individual uploads.
- `DELETE /api/materials/:materialId` *(Protected)*
  - **Action:** Perform account cleanup of materials.

### 💬 Intelligent AI Utilities ( `/api/materials/chat` & `/api/chatbot` )
*The learning assistants built into Study-Share.*
- `POST /api/materials/chat/:materialId` *(Protected)*
  - **Action:** Specifically converse with the targeted document (Document-based Q&A, Summarizations).
  - **Expected Payload:** `{ message: "Summarize page 3" }`
- `POST /api/chatbot/chat` *(Protected)*
  - **Action:** General-purpose AI chatbot queries unconstricted by documents.
  - **Expected Payload:** `{ message: "Help me study the React lifecycle" }`

### 💻 Code Playground Playground ( `/api/code` )
- `POST /api/code/execute` *(Protected)*
  - **Action:** Safe code execution container for running tests.
  - **Expected Payload:** `{ code: "console.log('hello world')", language: "javascript" }`

### 👑 Admin Management ( `/api/admin` )
*(Strictly requires `role === "ADMIN"`)*
- `GET /api/auth/admin/pending`
  - **Action:** Show teachers awaiting rigorous verification.
- `PATCH /api/auth/admin/verify/:userId`
  - **Action:** Explicitly approve a Teacher so they have global trust privileges.
- `GET /api/admin/stats`
  - **Action:** General system dashboard aggregated numeric statistics.
- `GET /api/admin/users` & `GET /api/admin/materials`
  - **Action:** Access raw universal entities.
- `DELETE /api/admin/materials/:id`
  - **Action:** Delete violative documents with overriding authority.

---

## 5. UI/UX Workflow Recommendations for Developers
To structure your frontend pages conceptually:

1. **Authentication Flow (Priority 1):**
   - User hits Landing Page → clicks "Login with Google".
   - Popup processes Google Firebase. Wait for token result.
   - Ping `POST /api/auth/signin`. If it returns a missing user response, seamlessly slide user to a "Complete Profile" router view (asking them: Student or Teacher?).
   - Fire `POST /api/auth/register/student` (or teacher) → route to Application Dashboard.
   
2. **Uploading With Feedback (Priority 2):**
   - Provide a slick modal or page for Uploads. Use native File inputs.
   - When the user confirms upload, hit `POST /api/materials`. Display a spinner.
   - As upload succeeds, drop into a loader screen and continuously poll `GET /api/materials/status/:id` every 3-5 seconds to display real-time backend processing (Extracting textual data → Creating embeddings → Success).

3. **Intelligent Material Reader (Priority 3):**
   - Layout should feature the **PDF visualizer** centered/left natively. 
   - A right-sidebar **Chat Drawer**. Every user message sends to `POST /api/materials/chat/:id` ensuring the AI answers directly out of the viewed document's context natively.

4. **Code Execution Sandbox (Priority 4):**
   - Dedicate a route (`/sandbox`). Include a dropdown to select languages (`python`, `javascript`, etc.). Use Monaco editor.
   - "Run Code" button passes payload to `/api/code/execute` and mirrors server response down into a dark 'console' window div.

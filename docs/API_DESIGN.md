# StudyShare - Complete API Design & Database Schema Documentation

**Comprehensive guide for API design, database models, vector embeddings, and implementation specifications**

**Last Updated**: March 2026  
**API Version**: v1  
**Status**: Production Ready

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Database Schema & Models](#database-schema--models)
3. [Vector Embeddings & Retrieval Strategy](#vector-embeddings--retrieval-strategy)
4. [Data Models with TypeScript](#data-models-with-typescript)
5. [Complete API Specifications](#complete-api-specifications)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling & Validation](#error-handling--validation)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Overview & Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                   HTTP/REST API Layer                        │
├─────────────────────────────────────────────────────────────┤
│              Backend (Express.js + Node.js)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers → Services → Database Layer             │  │
│  │  - Authentication Service                            │  │
│  │  - Material Management Service                       │  │
│  │  - Vector Embedding Service                          │  │
│  │  - AI/Search Service                                 │  │
│  │  - User Management Service                           │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   MongoDB        │  │  Cloudinary  │  │  Vector DB   │  │
│  │                  │  │  (Files)     │  │  (Embeddings)│  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────────┤
│              External Services                               │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Gemini AI      │  │  Firebase    │  │  Email       │  │
│  │   (LLM)          │  │  (Optional)  │  │  Service     │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS | UI/UX, State Management |
| **Backend** | Node.js, Express.js, TypeScript | API, Business Logic |
| **Database** | MongoDB | Primary Data Storage |
| **File Storage** | Cloudinary | PDF, Documents, Media |
| **Vector Storage** | Weaviate/Pinecone/Milvus | Embedding Storage & Retrieval |
| **LLM** | Google Gemini API | AI Recommendations, Content Analysis |
| **Authentication** | JWT (JSON Web Tokens) | Session Management |
| **Caching** | Redis (optional) | Performance Optimization |

---

## Database Schema & Models

### 1. User Model

**Collection**: `users`

```typescript
interface User {
  // Basic Information
  _id: ObjectId;
  name: string;                          // Full name
  email: string;                         // Unique, must be college email
  password: string;                      // Hashed with bcrypt
  
  // Profile Information
  profile: {
    avatar?: string;                     // Profile picture URL (Cloudinary)
    bio?: string;                        // User bio/description
    department: string;                  // Computer Science, BCA, etc.
    semester?: number;                   // 1-8 (for students)
    rollNumber?: string;                 // College roll number
    contactNumber?: string;              // Phone number
    location?: string;                   // City/Location
  };
  
  // Role & Permissions
  role: 'student' | 'faculty' | 'admin'; // User role
  permissions: string[];                 // Specific permissions
  isVerified: boolean;                   // Email verification status
  verificationToken?: string;            // Token for email verification
  
  // Account Status
  isActive: boolean;                     // Account active/inactive
  isBanned: boolean;                     // Safety measure
  banReason?: string;                    // If banned, why
  
  // Statistics
  stats: {
    totalUploads: number;               // Total materials uploaded
    totalLikes: number;                 // Total likes received
    totalDownloads: number;             // Total downloads of user's materials
    followerCount: number;              // Number of followers
    followingCount: number;             // Number of following
  };
  
  // Preferences
  preferences: {
    notificationEmail: boolean;
    notificationInApp: boolean;
    privateProfile: boolean;
    allowComments: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

**MongoDB Schema**:
```json
{
  "name": "users",
  "indexes": [
    { "email": 1, "unique": true },
    { "createdAt": 1 },
    { "role": 1 },
    { "department": 1 }
  ],
  "validation": {
    "bsonType": "object",
    "required": ["name", "email", "role", "isVerified"],
    "properties": {
      "email": { "bsonType": "string", "pattern": "^[a-zA-Z0-9._%+-]+@college\\.edu$" },
      "password": { "bsonType": "string", "minLength": 60 },
      "role": { "enum": ["student", "faculty", "admin"] }
    }
  }
}
```

---

### 2. Subject Model

**Collection**: `subjects`

```typescript
interface Subject {
  _id: ObjectId;
  
  // Basic Information
  name: string;                         // e.g., "Operating Systems"
  code: string;                         // e.g., "CS301"
  description: string;                  // Subject description
  syllabus?: string;                    // Detailed syllabus
  
  // Academic Information
  department: string;                   // Computer Science, BCA, etc.
  semester: number;                     // 1-8
  credits: number;                      // Credit hours
  
  // Faculty
  faculty: {
    facultyId: ObjectId;
    name: string;
    email: string;
  }[];
  
  // Statistics
  materialsCount: number;
  totalDownloads: number;
  
  // Metadata
  tags: string[];                       // e.g., ["algorithms", "data-structures"]
  isActive: boolean;
  
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
}
```

---

### 3. Material Model

**Collection**: `materials`

```typescript
interface Material {
  _id: ObjectId;
  
  // Basic Information
  title: string;                        // e.g., "OS Process Management Notes"
  description: string;                  // Detailed description
  longDescription?: string;             // Extended description for SEO
  
  // Classification
  subject: {
    subjectId: ObjectId;
    name: string;
    code: string;
  };
  
  type: 'notes' | 'pyq' | 'ppt' | 'book' | 'article' | 'video' | 'other';
  
  // Metadata
  department: string;
  semester: number;
  tags: string[];                       // e.g., ["algorithms", "sorting"]
  
  // File Information
  file: {
    url: string;                        // Cloudinary URL
    publicId: string;                   // Cloudinary public ID
    mimeType: string;                   // application/pdf, etc.
    size: number;                       // File size in bytes
    pages?: number;                     // For PDF documents
    uploadDate: Date;
    fileName: string;                   // Original file name
  };
  
  // Vector Embeddings & Chunks (for RAG)
  vectorEmbeddings: {
    chunksCount: number;                // Total number of chunks
    embeddingModel: string;             // e.g., "universal-sentence-encoder"
    lastProcessedDate: Date;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    processingError?: string;
  };
  
  // Upload Information
  uploadedBy: {
    userId: ObjectId;
    name: string;
    role: string;
  };
  
  // Moderation
  moderation: {
    status: 'pending' | 'approved' | 'rejected';
    moderatedBy?: ObjectId;
    moderationDate?: Date;
    rejectionReason?: string;
    flags: string[];                   // Content flags
  };
  
  // Engagement Metrics
  engagement: {
    views: number;
    downloads: number;
    likes: number;
    likedBy: ObjectId[];               // User IDs who liked
    reports: number;
    reportedBy: ObjectId[];            // User IDs who reported
  };
  
  // Quality Metrics
  quality: {
    avgRating: number;                 // 1-5 rating
    ratingCount: number;
    relevanceScore: number;            // AI-computed relevance
    completenessScore: number;         // AI-computed completeness
  };
  
  // Verification
  isVerified: boolean;                 // Faculty/Admin verified
  verifiedBy?: ObjectId;
  verificationDate?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;                    // For temporary materials
}
```

**MongoDB Indexes**:
```json
{
  "indexes": [
    { "subject.subjectId": 1, "moderation.status": 1 },
    { "uploadedBy.userId": 1 },
    { "createdAt": 1 },
    { "title": "text", "description": "text" },
    { "type": 1 },
    { "semester": 1, "department": 1 },
    { "engagement.downloads": -1 },
    { "moderation.status": 1 }
  ]
}
```

---

### 4. Chunk Model (for PDF Content)

**Collection**: `chunks`

```typescript
interface Chunk {
  _id: ObjectId;
  
  // Reference to Material
  materialId: ObjectId;                // Reference to parent material
  
  // Chunk Information
  chunkIndex: number;                  // Sequential chunk number
  content: string;                     // Actual text content
  
  // Metadata
  metadata: {
    pageNumber?: number;               // For PDFs
    pageTitle?: string;
    sectionName?: string;              // If document is sectioned
    startPosition: number;             // Character position in original
    endPosition: number;
    tokenCount: number;                // Token count for cost estimation
  };
  
  // Vector Embedding
  embedding: {
    vector: number[];                  // Dense vector (768/1536 dims)
    model: string;                     // Which model generated this
    generatedAt: Date;
  };
  
  // Summary & Keywords
  summary?: string;                    // AI-generated summary
  keywords: string[];                  // AI-extracted keywords
  
  // Cross-references
  relatedChunks: ObjectId[];          // Related chunk IDs
  
  // Processing Info
  processingStatus: 'pending' | 'processed' | 'error';
  processingError?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**MongoDB Indexes**:
```json
{
  "indexes": [
    { "materialId": 1, "chunkIndex": 1 },
    { "materialId": 1 },
    { "pageNumber": 1 }
  ]
}
```

---

### 5. Vector Embedding Index (Weaviate/Pinecone)

**Index Name**: `studyshare_materials`

```json
{
  "class": "ChunkEmbedding",
  "description": "PDF chunk embeddings for semantic search",
  "vectorizer": "text2vec-transformers",
  "properties": [
    {
      "name": "chunkId",
      "dataType": ["string"],
      "description": "Reference to chunk MongoDB ID"
    },
    {
      "name": "materialId",
      "dataType": ["string"],
      "description": "Reference to material MongoDB ID"
    },
    {
      "name": "content",
      "dataType": ["text"],
      "description": "Chunk text content"
    },
    {
      "name": "pageNumber",
      "dataType": ["int"],
      "description": "Page number for PDFs"
    },
    {
      "name": "subject",
      "dataType": ["string"],
      "description": "Subject name for filtering"
    },
    {
      "name": "department",
      "dataType": ["string"],
      "description": "Department for filtering"
    },
    {
      "name": "semester",
      "dataType": ["int"],
      "description": "Semester level"
    },
    {
      "name": "materialType",
      "dataType": ["string"],
      "description": "Type: notes, pyq, ppt, etc."
    },
    {
      "name": "keywords",
      "dataType": ["string[]"],
      "description": "Extracted keywords"
    }
  ]
}
```

---

### 6. Search Query Model

**Collection**: `search_queries`

```typescript
interface SearchQuery {
  _id: ObjectId;
  
  userId: ObjectId;                    // User who performed search
  query: string;                       // Search query text
  queryEmbedding?: number[];          // Embedding of the query
  
  filters: {
    subject?: ObjectId;
    semester?: number;
    department?: string;
    type?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  
  // Results
  resultsCount: number;
  resultsRelevance: number;           // Average relevance score
  
  // User Interaction
  resultsViewed: ObjectId[];          // Materials viewed from results
  materialClicked: ObjectId;          // Which material was clicked
  materialDownloaded: boolean;
  
  // AI Insights
  queryClassification?: string;       // What user is looking for
  suggestedFilters?: string[];
  
  createdAt: Date;
}
```

---

### 7. User Activity & Analytics Model

**Collection**: `user_activities`

```typescript
interface UserActivity {
  _id: ObjectId;
  
  userId: ObjectId;
  activityType: 'view' | 'download' | 'like' | 'upload' | 'search' | 'click';
  
  targetMaterial?: ObjectId;          // If activity relates to material
  targetUser?: ObjectId;              // If activity relates to user
  
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    duration?: number;                // Time spent (ms)
    source?: string;                  // Where from
  };
  
  createdAt: Date;
}
```

---

## Vector Embeddings & Retrieval Strategy

### 1. PDF Processing Pipeline

```
PDF Upload → Text Extraction → Chunking → Embedding → Vector DB Storage
                                                      ↓
                                            Semantic Search Ready
```

#### Step 1: Text Extraction
```typescript
interface TextExtractionConfig {
  library: 'pdfkit' | 'pdf-parse' | 'pdfjs';
  preserveLayout: boolean;
  extractImages: boolean;
  extractTables: boolean;
}

// Process: Extract text from PDF maintaining structure
```

#### Step 2: Chunking Strategy

**Chunking Methods**:

```typescript
interface ChunkingStrategy {
  method: 'fixed' | 'semantic' | 'sentence';
  
  // Fixed size chunks
  fixedSize: {
    size: 512;                         // Characters per chunk
    overlap: 100;                      // Overlap for context
    preserveParagraphs: true;
  };
  
  // Semantic-based chunks
  semantic: {
    minChunkSize: 200;
    maxChunkSize: 1000;
    similarityThreshold: 0.7;
  };
  
  // Sentence-level chunks
  sentence: {
    minSentences: 2;
    maxSentences: 10;
    groupBySection: true;
  };
}

// Recommended: Fixed 512 chars with 100-char overlap
```

**Example Chunking Output**:
```json
{
  "materialId": "507f1f77bcf86cd799439012",
  "chunks": [
    {
      "chunkId": 1,
      "pageNumber": 1,
      "content": "Chapter 1: Operating Systems Basics\n\nAn operating system (OS) is system software that manages computer hardware and software resources and provides common services for computer programs. The OS acts as an intermediary between users and computer hardware.\n\nKey functions of OS:\n1. Resource Management\n2. Process Management\n3. Memory Management...",
      "startChar": 0,
      "endChar": 512,
      "tokenCount": 87
    },
    {
      "chunkId": 2,
      "pageNumber": 1,
      "content": "Memory Management\n\nMemory management is a crucial function of the operating system. It involves allocating and deallocating memory space for programs and processes. The OS must track which memory locations are in use and which are free...",
      "startChar": 412,
      "endChar": 924,
      "tokenCount": 91
    }
  ]
}
```

#### Step 3: Embedding Generation

**Embedding Configuration**:

```typescript
interface EmbeddingConfig {
  model: 'universal-sentence-encoder' | 'sentence-transformers' | 'openai-ada';
  dimensions: 768 | 1536;              // Vector dimensions
  batchSize: 32;                       // Chunks to process per batch
  
  modelDetails: {
    name: 'universal-sentence-encoder';
    dimensions: 512;
    language: 'multilingual';
    cost: 'free';
  };
}

// Recommended: Universal Sentence Encoder (free, 512 dims)
// Alternative: sentence-transformers/all-MiniLM-L6-v2 (384 dims)
// Premium: OpenAI text-embedding-3-small (1536 dims)
```

**Embedding Process**:

```typescript
async function generateEmbeddings(chunks: Chunk[]): Promise<Embedding[]> {
  // 1. Load embedding model
  const model = await use.load();
  
  // 2. Prepare chunk contents
  const contents = chunks.map(c => c.content);
  
  // 3. Generate embeddings
  const embeddings = await model.embed(contents);
  const embeddingArray = await embeddings.data();
  
  // 4. Store in Vector DB
  const vectorData = chunks.map((chunk, idx) => ({
    chunkId: chunk._id,
    materialId: chunk.materialId,
    vector: Array.from(embeddingArray[idx]),
    metadata: {
      pageNumber: chunk.metadata.pageNumber,
      subject: chunk.material.subject.name,
      department: chunk.material.department,
      semester: chunk.material.semester,
      type: chunk.material.type
    }
  }));
  
  // 5. Upload to Vector DB (Weaviate/Pinecone)
  await vectorDB.upsert(vectorData);
  
  return vectorData;
}
```

#### Step 4: Vector Database Storage

**Weaviate Configuration**:

```typescript
interface WeaviateConfig {
  apiKey: string;
  endpoint: 'https://studyshare.weaviate.cloud';
  
  class: {
    name: 'StudyShareChunk',
    description: 'Study material chunks with embeddings',
    vectorizer: 'text2vec-transformers',
    distance: 'cosine'
  };
}
```

**Pinecone Configuration**:

```typescript
interface PineconeConfig {
  apiKey: string;
  environment: string;
  indexName: 'study-share-materials';
  
  index: {
    dimension: 512;                    // Embedding dimension
    metric: 'cosine';                  // Distance metric
    pods: 1;
    replicas: 2;
    podType: 'p1.x1';
  };
}
```

---

### 2. Semantic Search Pipeline

```
User Query → Query Embedding → Vector Search → Ranking → Results
```

**Implementation**:

```typescript
async function semanticSearch(
  query: string,
  filters?: SearchFilters
): Promise<SearchResult[]> {
  // 1. Embed the query
  const queryEmbedding = await embedQuery(query);
  
  // 2. Search vector DB
  const vectorResults = await vectorDB.search({
    vector: queryEmbedding,
    topK: 100,                        // Get top 100 candidates
    filter: buildFilters(filters),    // Apply filters
    includeMetadata: true
  });
  
  // 3. Retrieve full chunks from MongoDB
  const chunkIds = vectorResults.map(r => r.metadata.chunkId);
  const chunks = await Chunk.find({ _id: { $in: chunkIds } });
  
  // 4. Retrieve material details
  const materials = await Material.find({
    _id: { $in: chunks.map(c => c.materialId) }
  });
  
  // 5. Rank and deduplicate
  const rankedResults = rankResults(vectorResults, chunks, materials);
  
  // 6. Return top K results
  return rankedResults.slice(0, 20);
}

function buildFilters(filters?: SearchFilters) {
  const mongoFilters: any = {};
  
  if (filters?.subject) mongoFilters['metadata.subject'] = filters.subject;
  if (filters?.semester) mongoFilters['metadata.semester'] = filters.semester;
  if (filters?.department) mongoFilters['metadata.department'] = filters.department;
  if (filters?.type) mongoFilters['metadata.materialType'] = { $in: filters.type };
  
  return mongoFilters;
}

function rankResults(vectors: VectorResult[], chunks: Chunk[], materials: Material[]): SearchResult[] {
  return vectors
    .map((result, idx) => {
      const chunk = chunks.find(c => c._id.toString() === result.metadata.chunkId);
      const material = materials.find(m => m._id.toString() === chunk?.materialId.toString());
      
      // Multi-factor ranking
      const score = 
        (result.score * 0.5) +                    // Vector similarity (50%)
        (material?.engagement.downloads * 0.0001 * 0.2) + // Popularity (20%)
        (material?.quality.avgRating * 0.1) +    // Quality (10%)
        (material?.moderation.status === 'approved' ? 0.2 : 0);  // Verification (20%)
      
      return {
        material,
        chunk,
        relevanceScore: score,
        snippet: chunk?.content.substring(0, 200) + '...'
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
```

---

### 3. Hybrid Search (Keyword + Semantic)

```typescript
async function hybridSearch(
  query: string,
  filters?: SearchFilters
): Promise<SearchResult[]> {
  // Parallel execution
  const [keywordResults, semanticResults] = await Promise.all([
    keywordSearch(query, filters),     // Traditional MongoDB text search
    semanticSearch(query, filters)     // Vector similarity search
  ]);
  
  // Merge and re-rank results
  const merged = mergeResults(keywordResults, semanticResults);
  return merged.slice(0, 30);
}

function mergeResults(keyword: SearchResult[], semantic: SearchResult[]): SearchResult[] {
  const resultMap = new Map<string, SearchResult>();
  
  // Add keyword results (70% weight)
  keyword.forEach((result, idx) => {
    const key = result.material._id.toString();
    const existing = resultMap.get(key);
    const score = (1 - idx / keyword.length) * 0.7;
    
    if (existing) {
      existing.relevanceScore += score;
    } else {
      result.relevanceScore = score;
      resultMap.set(key, result);
    }
  });
  
  // Add semantic results (30% weight)
  semantic.forEach((result, idx) => {
    const key = result.material._id.toString();
    const existing = resultMap.get(key);
    const score = (1 - idx / semantic.length) * 0.3;
    
    if (existing) {
      existing.relevanceScore += score;
    } else {
      result.relevanceScore = score;
      resultMap.set(key, result);
    }
  });
  
  return Array.from(resultMap.values()).sort((a, b) => b.relevanceScore - a.relevanceScore);
}
```

---

## Data Models with TypeScript

### Core Types & Interfaces

```typescript
// Base Response Type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

// Pagination
interface PaginationQuery {
  page: number;                        // 1-indexed
  limit: number;                       // Items per page (max 100)
  skip?: number;                       // Calculated: (page - 1) * limit
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Search Filters
interface SearchFilters {
  subject?: string;
  semester?: number;
  department?: string;
  materialType?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  minRating?: number;
  verifiedOnly?: boolean;
}

// Material Upload Request
interface MaterialUploadRequest {
  title: string;
  description: string;
  subject: string;                    // Subject ID
  type: 'notes' | 'pyq' | 'ppt' | 'book' | 'article' | 'video' | 'other';
  semester: number;
  department: string;
  tags: string[];
  file: File;                         // Binary file data
}

// AI Recommendation Request
interface AIRecommendationRequest {
  subject?: string;
  context?: string;
  limit?: number;                     // Max results (default 10)
  filters?: SearchFilters;
}

// Vector Search Request
interface VectorSearchRequest {
  query: string;
  limit?: number;                     // Max results (default 20)
  filters?: SearchFilters;
  useHybridSearch?: boolean;          // Use both keyword and semantic search
}
```

---

## Complete API Specifications

### 1. Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@college.edu",
  "password": "SecurePass123",
  "department": "Computer Science",
  "semester": 5,
  "rollNumber": "CS2021001"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@college.edu",
      "role": "student",
      "department": "Computer Science",
      "semester": 5,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful. Please verify your email."
}
```

**Validation Rules**:
- Email format: `[a-zA-Z0-9._%+-]+@college\.edu`
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit
- Name: 2-100 characters
- Semester: 1-8 for students

---

#### Verify Email

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

---

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@college.edu",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@college.edu",
      "role": "student",
      "department": "Computer Science",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

---

#### Refresh Token

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json
Authorization: Bearer refresh_token

{}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresIn": 86400
  }
}
```

---

#### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer access_token
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@college.edu",
      "role": "student",
      "profile": {
        "avatar": "https://...",
        "department": "Computer Science",
        "semester": 5
      },
      "stats": {
        "totalUploads": 5,
        "totalLikes": 42,
        "totalDownloads": 128,
        "followerCount": 12,
        "followingCount": 24
      }
    }
  }
}
```

---

### 2. Materials Endpoints

#### Upload Material

```http
POST /api/v1/materials
Content-Type: multipart/form-data
Authorization: Bearer access_token

title: "Operating Systems - Process Management Notes"
description: "Comprehensive notes on process scheduling algorithms"
subject: "507f1f77bcf86cd799439011"
type: "notes"
semester: 5
department: "Computer Science"
tags: ["process-management", "cpu-scheduling"]
file: [binary PDF file]
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "material": {
      "id": "507f1f77bcf86cd799439013",
      "title": "Operating Systems - Process Management Notes",
      "description": "Comprehensive notes on process scheduling algorithms",
      "subject": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Operating Systems"
      },
      "type": "notes",
      "semester": 5,
      "uploadedBy": {
        "id": "507f1f77bcf86cd799439010",
        "name": "John Doe"
      },
      "file": {
        "url": "https://res.cloudinary.com/studyshare/...",
        "size": 2048576,
        "pages": 45
      },
      "moderation": {
        "status": "pending",
        "message": "Your material is being reviewed. You'll be notified when approved."
      },
      "vectorEmbeddings": {
        "status": "processing",
        "completedChunks": 0,
        "totalChunks": 45
      },
      "createdAt": "2024-02-06T15:20:00Z"
    }
  },
  "message": "Material uploaded successfully. PDF processing started."
}
```

**File Validation**:
- Max size: 50MB
- Allowed types: PDF, DOCX, PPTX, TXT, ZIP
- Processing will start immediately after upload

---

#### Get All Materials (with Pagination & Filters)

```http
GET /api/v1/materials?page=1&limit=20&subject=507f1f77bcf86cd799439011&semester=5&sort=popular
Authorization: Bearer access_token
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `subject` (string): Subject ID filter
- `semester` (number): Semester filter (1-8)
- `department` (string): Department filter
- `type` (string[]): Material type filter (multiple allowed)
- `search` (string): Text search in title/description
- `sort` (string): Sort order (recent, popular, liked, trending)
- `dateFrom` (date): Filter from date
- `dateTo` (date): Filter to date
- `verifiedOnly` (boolean): Only verified materials
- `minRating` (number): Minimum rating filter

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "materials": [
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Operating Systems - Process Management Notes",
        "description": "Comprehensive notes on process scheduling algorithms",
        "subject": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Operating Systems",
          "code": "CS301"
        },
        "type": "notes",
        "semester": 5,
        "department": "Computer Science",
        "file": {
          "url": "https://res.cloudinary.com/studyshare/...",
          "size": 2048576,
          "pages": 45
        },
        "uploadedBy": {
          "id": "507f1f77bcf86cd799439010",
          "name": "Jane Smith",
          "role": "faculty"
        },
        "engagement": {
          "views": 1243,
          "downloads": 432,
          "likes": 156
        },
        "quality": {
          "avgRating": 4.5,
          "ratingCount": 89
        },
        "isVerified": true,
        "isLiked": false,
        "createdAt": "2024-02-01T14:30:00Z"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalItems": 287,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### Get Single Material

```http
GET /api/v1/materials/507f1f77bcf86cd799439012
Authorization: Bearer access_token
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "material": {
      "id": "507f1f77bcf86cd799439012",
      "title": "Operating Systems - Process Management Notes",
      "description": "Comprehensive notes covering CPU scheduling, deadlocks, and synchronization",
      "subject": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Operating Systems",
        "code": "CS301",
        "credits": 4
      },
      "type": "notes",
      "semester": 5,
      "department": "Computer Science",
      "file": {
        "url": "https://res.cloudinary.com/studyshare/...",
        "size": 2048576,
        "pages": 45,
        "uploadDate": "2024-02-01T14:30:00Z"
      },
      "uploadedBy": {
        "id": "507f1f77bcf86cd799439010",
        "name": "Jane Smith",
        "email": "jane.smith@college.edu",
        "role": "faculty"
      },
      "engagement": {
        "views": 1243,
        "downloads": 432,
        "likes": 156
      },
      "quality": {
        "avgRating": 4.5,
        "ratingCount": 89,
        "relevanceScore": 0.92,
        "completenessScore": 0.88
      },
      "moderation": {
        "status": "approved",
        "verifiedBy": "admin_user_id",
        "verificationDate": "2024-02-02T10:00:00Z"
      },
      "isVerified": true,
      "isLiked": false,
      "tags": ["process-management", "cpu-scheduling", "deadlocks"],
      "createdAt": "2024-02-01T14:30:00Z",
      "updatedAt": "2024-02-05T10:15:00Z"
    },
    "relatedMaterials": [
      {
        "id": "507f1f77bcf86cd799439020",
        "title": "Related Material Title",
        "relevanceScore": 0.87
      }
    ]
  }
}
```

---

#### Delete Material

```http
DELETE /api/v1/materials/507f1f77bcf86cd799439012
Authorization: Bearer access_token
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

#### Like/Unlike Material

```http
POST /api/v1/materials/507f1f77bcf86cd799439012/like
Authorization: Bearer access_token
Content-Type: application/json

{}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "totalLikes": 157
  },
  "message": "Material liked successfully"
}
```

---

#### Download Material

```http
POST /api/v1/materials/507f1f77bcf86cd799439012/download
Authorization: Bearer access_token
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://res.cloudinary.com/studyshare/...",
    "expiresIn": 3600
  }
}
```

---

### 3. Search Endpoints

#### Keyword Search

```http
GET /api/v1/search?q=process%20management&limit=20
Authorization: Bearer access_token
```

**Query Parameters**:
- `q` (string): Search query
- `limit` (number): Max results (default: 20)
- `page` (number): Pagination
- All additional filters from materials endpoint

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "material": { /* material object */ },
        "relevanceScore": 0.92,
        "matchType": "keyword",
        "snippet": "Found 45 occurrences of 'process management' in this material..."
      }
    ],
    "totalResults": 34,
    "queryTime": 145
  }
}
```

---

#### Semantic/AI Search

```http
POST /api/v1/search/semantic
Authorization: Bearer access_token
Content-Type: application/json

{
  "query": "Find notes about deadlock prevention and avoidance techniques",
  "limit": 20,
  "filters": {
    "subject": "507f1f77bcf86cd799439011",
    "semester": 5,
    "verifiedOnly": true
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "material": {
          "id": "507f1f77bcf86cd799439012",
          "title": "Operating Systems - Deadlock Handling",
          "type": "notes"
        },
        "chunks": [
          {
            "id": "chunk_id_1",
            "pageNumber": 12,
            "content": "Deadlock Prevention and Avoidance...",
            "relevanceScore": 0.95
          }
        ],
        "overallScore": 0.93,
        "highlights": ["deadlock prevention", "banker's algorithm", "safety sequence"]
      }
    ],
    "totalResults": 12,
    "processingTime": 234,
    "aiSummary": "Found 12 highly relevant materials about deadlock prevention with detailed explanations of banker's algorithm and safety sequences."
  }
}
```

---

#### Hybrid Search (Combined)

```http
POST /api/v1/search/hybrid
Authorization: Bearer access_token
Content-Type: application/json

{
  "query": "process scheduling and CPU allocation",
  "limit": 30,
  "keywordWeight": 0.4,
  "semanticWeight": 0.6,
  "filters": {
    "semester": 5,
    "materialType": ["notes", "ppt"]
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "material": { /* material object */ },
        "keywordScore": 0.85,
        "semanticScore": 0.92,
        "combinedScore": 0.89,
        "matchSource": ["keyword", "semantic"]
      }
    ],
    "totalResults": 45,
    "processingTime": 456
  }
}
```

---

### 4. AI Features Endpoints

#### Get AI Recommendations

```http
POST /api/v1/ai/recommendations
Authorization: Bearer access_token
Content-Type: application/json

{
  "subject": "507f1f77bcf86cd799439011",
  "context": "I'm preparing for end-semester exams in Operating Systems",
  "limit": 15,
  "includeAllTypes": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "rank": 1,
        "material": {
          "id": "507f1f77bcf86cd799439012",
          "title": "Operating Systems - Process Management Notes",
          "type": "notes",
          "rating": 4.7
        },
        "score": 0.96,
        "reason": "Highly relevant for exam preparation. Covers CPU scheduling (23% of exam), deadlock management (18%), and synchronization (15%).",
        "estimatedReadTime": 45,
        "keyTopics": ["cpu-scheduling", "deadlock-handling", "process-synchronization"]
      },
      {
        "rank": 2,
        "material": {
          "id": "507f1f77bcf86cd799439021",
          "title": "OS Previous Year Questions (2023)",
          "type": "pyq",
          "rating": 4.5
        },
        "score": 0.94,
        "reason": "Perfect for practice. Students who studied this material scored 15% higher in exams. Contains 50 practice questions.",
        "estimatedReadTime": 60,
        "keyTopics": ["exam-preparation", "practice-questions", "common-topics"]
      }
    ],
    "personalizedInsights": {
      "learningPath": "You should start with foundational concepts (Process Management), then move to advanced topics (Deadlocks, Race Conditions).",
      "estimatedPrepTime": "8-10 hours",
      "strongAreas": ["Memory Management"],
      "weakAreas": ["Deadlock Prevention"],
      "recommendedMaterials": 5
    }
  }
}
```

---

#### Enable AI Chat with Materials

```http
POST /api/v1/ai/chat
Authorization: Bearer access_token
Content-Type: application/json

{
  "materialId": "507f1f77bcf86cd799439012",
  "message": "What is the banker's algorithm and how does it prevent deadlocks?",
  "conversationId": "conv_123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_123",
    "response": "The Banker's Algorithm is a deadlock avoidance algorithm that...",
    "relevantChunks": [
      {
        "pageNumber": 15,
        "content": "Relevant excerpt from the material...",
        "relevance": 0.98
      }
    ],
    "followUpQuestions": [
      "What are the limitations of banker's algorithm?",
      "How does the algorithm detect unsafe states?",
      "Compare banker's algorithm with other deadlock avoidance techniques"
    ]
  }
}
```

---

## Authentication & Authorization

### JWT Token Structure

**Access Token Payload**:
```json
{
  "sub": "507f1f77bcf86cd799439011",           // User ID
  "email": "john.doe@college.edu",
  "role": "student",
  "permissions": ["read:materials", "write:materials", "upload:materials"],
  "iat": 1708000000,                           // Issued at
  "exp": 1708086400,                           // Expires (24 hours)
  "iss": "studyshare.com",
  "aud": "studyshare-api"
}
```

**Refresh Token Payload**:
```json
{
  "sub": "507f1f77bcf86cd799439011",
  "type": "refresh",
  "iat": 1708000000,
  "exp": 1708604800                            // Expires (7 days)
}
```

### Role-Based Access Control (RBAC)

```typescript
interface RolePermissions {
  student: {
    read: ['materials', 'subjects', 'users_public_profile'],
    write: ['materials', 'comments'],
    delete: ['own_materials', 'own_comments'],
    admin: []
  };
  
  faculty: {
    read: ['materials', 'subjects', 'users_public_profile', 'upload_statistics'],
    write: ['materials', 'subjects_in_dept', 'comments'],
    delete: ['own_materials', 'own_comments', 'materials_in_subject'],
    admin: ['moderate_content']
  };
  
  admin: {
    read: ['all'],
    write: ['all'],
    delete: ['all'],
    admin: ['user_management', 'content_moderation', 'system_settings']
  };
}
```

### Authorization Middleware

```typescript
async function authorizeEndpoint(
  req: Request,
  requiredRoles?: string[],
  requiredPermissions?: string[]
): Promise<boolean> {
  // 1. Verify token
  const token = extractToken(req);
  const decoded = verifyToken(token);
  
  // 2. Check role
  if (requiredRoles && !requiredRoles.includes(decoded.role)) {
    throw new UnauthorizedError('Insufficient role');
  }
  
  // 3. Check permissions
  if (requiredPermissions) {
    const userPermissions = getRolePermissions(decoded.role);
    const hasPermission = requiredPermissions.every(p => 
      userPermissions.includes(p)
    );
    
    if (!hasPermission) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
  
  return true;
}
```

---

## Error Handling & Validation

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "MATERIAL_NOT_FOUND",
    "message": "The requested material does not exist",
    "details": {
      "materialId": "507f1f77bcf86cd799439012"
    },
    "timestamp": "2024-02-06T15:20:00Z",
    "requestId": "req_12345"
  }
}
```

### Error Codes & HTTP Status Codes

| Error Code | HTTP Status | Description |
|-----------|------------|-------------|
| INVALID_INPUT | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Authentication required/failed |
| FORBIDDEN | 403 | User lacks permission |
| RESOURCE_NOT_FOUND | 404 | Resource does not exist |
| DUPLICATE_ENTRY | 409 | Resource already exists |
| VALIDATION_ERROR | 422 | Data validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

### Input Validation Rules

```typescript
interface ValidationRules {
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9._%+-]+@college\.edu$/,
    minLength: 5,
    maxLength: 255
  };
  
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    rules: [
      'at least 1 uppercase letter',
      'at least 1 lowercase letter',
      'at least 1 digit',
      'optional: special characters'
    ]
  };
  
  materialTitle: {
    required: true,
    minLength: 5,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-'(),:.]+$/
  };
  
  description: {
    required: true,
    minLength: 10,
    maxLength: 2000
  };
  
  file: {
    maxSize: 52428800,                  // 50MB
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  };
}
```

---

## Implementation Roadmap

### Phase 1: Core Features (Weeks 1-4)
- [ ] User authentication & authorization
- [ ] Material upload & basic storage
- [ ] MongoDB schema & basic queries
- [ ] Authentication API endpoints
- [ ] Material CRUD endpoints
- [ ] Basic search functionality

### Phase 2: Vector Embeddings & AI (Weeks 5-8)
- [ ] PDF text extraction
- [ ] Chunking pipeline
- [ ] Embedding generation (Universal Sentence Encoder)
- [ ] Vector database setup (Weaviate/Pinecone)
- [ ] Semantic search implementation
- [ ] Hybrid search (keyword + semantic)

### Phase 3: Advanced AI Features (Weeks 9-12)
- [ ] AI recommendations engine
- [ ] Chat with materials (RAG implementation)
- [ ] Gemini AI integration
- [ ] Content summarization
- [ ] Question generation from materials

### Phase 4: Analytics & Optimization (Weeks 13-16)
- [ ] User activity tracking
- [ ] Search analytics dashboard
- [ ] Performance optimization
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] Monitoring & logging

### Phase 5: Content Moderation (Weeks 17-20)
- [ ] Admin moderation dashboard
- [ ] Content flagging system
- [ ] Automated content checks
- [ ] User reporting system
- [ ] Moderation workflows

### Phase 6: Scale & Production (Weeks 21-24)
- [ ] Load testing
- [ ] Deployment pipeline
- [ ] Monitoring & alerting
- [ ] Backup & disaster recovery
- [ ] Security audit
- [ ] Documentation & handoff

---

## API Best Practices

### 1. Request/Response Format

**Always use JSON**:
```http
Content-Type: application/json
Accept: application/json
```

**Status codes**:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

### 2. Authentication Header

**Always include Bearer token**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Rate Limiting

**Headers returned with every response**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1708086400
```

### 4. Versioning

**API URLs always include version**:
```
/api/v1/materials
/api/v2/materials (when needed)
```

### 5. Pagination

**Always paginate large result sets**:
```
GET /api/v1/materials?page=1&limit=20
```

### 6. Filtering & Sorting

**Use query parameters consistently**:
```
GET /api/v1/materials?sort=popular&filter=notes&semester=5
```

---

## Database Maintenance

### Indexes to Create

```javascript
// Users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "department": 1 });

// Materials
db.materials.createIndex({ "subject.subjectId": 1, "moderation.status": 1 });
db.materials.createIndex({ "uploadedBy.userId": 1 });
db.materials.createIndex({ "title": "text", "description": "text" });
db.materials.createIndex({ "type": 1 });
db.materials.createIndex({ "semester": 1, "department": 1 });
db.materials.createIndex({ "engagement.downloads": -1 });
db.materials.createIndex({ "createdAt": 1 });

// Chunks
db.chunks.createIndex({ "materialId": 1, "chunkIndex": 1 });
db.chunks.createIndex({ "materialId": 1 });
db.chunks.createIndex({ "pageNumber": 1 });
```

### Backup Strategy

**Daily backups**:
- Full backup: Every Sunday
- Incremental: Daily Monday-Saturday
- Retention: 30 days

**Cloud backup** (MongoDB Atlas):
- Automatic 2-hour snapshots
- 35-day retention
- Point-in-time restore

---

## Support & Documentation

- **API Docs**: [API.md](API.md)
- **Developer Guide**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **User Guide**: [USER_GUIDE.md](USER_GUIDE.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Maintainer**: Satendra Kumar Parteti  
**Email**: satendrakumarparteti.work@gmail.com


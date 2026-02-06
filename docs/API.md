# StudyShare API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Materials](#materials-endpoints)
  - [Subjects](#subjects-endpoints)
  - [Users](#users-endpoints)
  - [AI Features](#ai-features-endpoints)

---

## Overview

The StudyShare API is a RESTful API that provides programmatic access to the StudyShare platform. All API endpoints return JSON responses and use standard HTTP response codes.

### API Version
Current Version: **v1**

### Content Type
All requests should include:
```
Content-Type: application/json
```

---

## Base URL

**Production**: `https://api.studyshare.com/api`  
**Development**: `http://localhost:5000/api`

---

## Authentication

StudyShare uses JWT (JSON Web Tokens) for authentication. After logging in, you'll receive a token that must be included in subsequent requests.

### Including Authentication Token

```http
Authorization: Bearer <your_jwt_token>
```

### Token Expiration
- Access tokens expire after **24 hours**
- Refresh tokens expire after **7 days**

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Common Error Codes

```javascript
{
  "INVALID_CREDENTIALS": "Email or password is incorrect",
  "TOKEN_EXPIRED": "Authentication token has expired",
  "UNAUTHORIZED": "You are not authorized to perform this action",
  "VALIDATION_ERROR": "Input validation failed",
  "RESOURCE_NOT_FOUND": "Requested resource does not exist",
  "DUPLICATE_ENTRY": "Resource already exists",
  "FILE_TOO_LARGE": "File size exceeds maximum limit",
  "INVALID_FILE_TYPE": "File type not supported"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Anonymous requests**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour
- **Admin users**: 5000 requests per hour

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1643723400
```

---

## Endpoints

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
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
      "rollNumber": "CS2021001"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules**:
- Email must be a valid college email address
- Password minimum 8 characters, must include uppercase, lowercase, and number; special characters are optional
- Name is required
- Department and semester are required for students

---

### Login User

Authenticate an existing user.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
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
      "semester": 5,
      "rollNumber": "CS2021001"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer <token>`

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
      "semester": 5,
      "uploadedMaterials": 15,
      "likedMaterials": 42,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### Update Profile

Update user profile information.

**Endpoint**: `PUT /auth/profile`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "John Updated Doe",
  "semester": 6
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Updated Doe",
      "email": "john.doe@college.edu",
      "semester": 6
    }
  }
}
```

---

## Materials Endpoints

### Get All Materials

Retrieve materials with optional filtering and pagination.

**Endpoint**: `GET /materials`

**Query Parameters**:
- `subject` (string): Filter by subject ID
- `semester` (number): Filter by semester (1-8)
- `department` (string): Filter by department
- `type` (string): Filter by material type (notes, pyq, slides, other)
- `search` (string): Search in title and description
- `sort` (string): Sort by (recent, popular, liked)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Example Request**:
```
GET /materials?subject=507f1f77bcf86cd799439011&semester=5&sort=popular&page=1&limit=20
```

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
        "fileUrl": "https://res.cloudinary.com/studyshare/...",
        "fileType": "application/pdf",
        "fileSize": 2048576,
        "uploadedBy": {
          "id": "507f1f77bcf86cd799439010",
          "name": "Jane Smith",
          "role": "faculty"
        },
        "likes": 156,
        "downloads": 432,
        "isLiked": false,
        "createdAt": "2024-02-01T14:30:00Z",
        "updatedAt": "2024-02-05T10:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 287,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### Get Single Material

Get detailed information about a specific material.

**Endpoint**: `GET /materials/:id`

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
      "fileUrl": "https://res.cloudinary.com/studyshare/...",
      "fileType": "application/pdf",
      "fileSize": 2048576,
      "uploadedBy": {
        "id": "507f1f77bcf86cd799439010",
        "name": "Jane Smith",
        "email": "jane.smith@college.edu",
        "role": "faculty"
      },
      "likes": 156,
      "downloads": 432,
      "views": 1243,
      "isLiked": false,
      "tags": ["process-management", "cpu-scheduling", "deadlocks"],
      "verified": true,
      "createdAt": "2024-02-01T14:30:00Z",
      "updatedAt": "2024-02-05T10:15:00Z"
    }
  }
}
```

---

### Upload Material

Upload a new study material.

**Endpoint**: `POST /materials`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data**:
```
title: "Operating Systems - Process Management Notes"
description: "Comprehensive notes on process scheduling"
subject: "507f1f77bcf86cd799439011"
type: "notes"
semester: 5
department: "Computer Science"
tags: ["process-management", "cpu-scheduling"]
file: <binary file data>
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "material": {
      "id": "507f1f77bcf86cd799439013",
      "title": "Operating Systems - Process Management Notes",
      "description": "Comprehensive notes on process scheduling",
      "fileUrl": "https://res.cloudinary.com/studyshare/...",
      "uploadedBy": "507f1f77bcf86cd799439011",
      "status": "pending_review",
      "createdAt": "2024-02-06T15:20:00Z"
    }
  },
  "message": "Material uploaded successfully. It will be available after admin review."
}
```

**Validation Rules**:
- File size limit: 50MB
- Allowed file types: PDF, DOCX, PPTX, TXT, ZIP
- Title: 5-200 characters
- Description: 10-1000 characters
- Subject must be a valid subject ID
- Semester must be between 1-8

---

### Update Material

Update material information (uploader or admin only).

**Endpoint**: `PUT /materials/:id`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new-tag", "another-tag"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "material": {
      "id": "507f1f77bcf86cd799439012",
      "title": "Updated Title",
      "description": "Updated description",
      "updatedAt": "2024-02-06T16:00:00Z"
    }
  }
}
```

---

### Delete Material

Delete a material (uploader or admin only).

**Endpoint**: `DELETE /materials/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

### Like/Unlike Material

Toggle like status for a material.

**Endpoint**: `POST /materials/:id/like`

**Headers**: `Authorization: Bearer <token>`

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

### Download Material

Track material download.

**Endpoint**: `POST /materials/:id/download`

**Headers**: `Authorization: Bearer <token>`

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

## Subjects Endpoints

### Get All Subjects

Retrieve all subjects.

**Endpoint**: `GET /subjects`

**Query Parameters**:
- `department` (string): Filter by department
- `semester` (number): Filter by semester

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Operating Systems",
        "code": "CS301",
        "department": "Computer Science",
        "semester": 5,
        "credits": 4,
        "description": "Introduction to operating system concepts",
        "materialsCount": 87,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Get Single Subject

Get detailed subject information.

**Endpoint**: `GET /subjects/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Operating Systems",
      "code": "CS301",
      "department": "Computer Science",
      "semester": 5,
      "credits": 4,
      "description": "Introduction to operating system concepts",
      "syllabus": "Process Management, Memory Management, File Systems...",
      "faculty": [
        {
          "id": "507f1f77bcf86cd799439020",
          "name": "Dr. Jane Smith",
          "email": "jane.smith@college.edu"
        }
      ],
      "materialsCount": 87,
      "recentMaterials": []
    }
  }
}
```

---

### Create Subject (Admin Only)

Create a new subject.

**Endpoint**: `POST /subjects`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "name": "Operating Systems",
  "code": "CS301",
  "department": "Computer Science",
  "semester": 5,
  "credits": 4,
  "description": "Introduction to operating system concepts"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Operating Systems",
      "code": "CS301",
      "department": "Computer Science",
      "semester": 5,
      "credits": 4,
      "createdAt": "2024-02-06T17:00:00Z"
    }
  }
}
```

---

### Update Subject (Admin Only)

Update subject information.

**Endpoint**: `PUT /subjects/:id`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "description": "Updated description",
  "credits": 3
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Operating Systems",
      "credits": 3,
      "updatedAt": "2024-02-06T17:30:00Z"
    }
  }
}
```

---

### Delete Subject (Admin Only)

Delete a subject.

**Endpoint**: `DELETE /subjects/:id`

**Headers**: `Authorization: Bearer <admin_token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Subject deleted successfully"
}
```

---

## Users Endpoints (Admin Only)

### Get All Users

Retrieve all users with pagination.

**Endpoint**: `GET /users`

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `role` (string): Filter by role (student, faculty, admin)
- `department` (string): Filter by department
- `search` (string): Search by name or email
- `page` (number): Page number
- `limit` (number): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@college.edu",
        "role": "student",
        "department": "Computer Science",
        "semester": 5,
        "materialsUploaded": 15,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 195
    }
  }
}
```

---

### Get Single User

Get detailed user information.

**Endpoint**: `GET /users/:id`

**Headers**: `Authorization: Bearer <admin_token>`

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
      "semester": 5,
      "rollNumber": "CS2021001",
      "materialsUploaded": 15,
      "materialsLiked": 42,
      "totalDownloads": 128,
      "recentActivity": [],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### Update User Role

Update a user's role.

**Endpoint**: `PUT /users/:id/role`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "role": "faculty"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "role": "faculty",
      "updatedAt": "2024-02-06T18:00:00Z"
    }
  }
}
```

---

### Delete User

Delete a user account.

**Endpoint**: `DELETE /users/:id`

**Headers**: `Authorization: Bearer <admin_token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## AI Features Endpoints

### Get AI Recommendations

Get personalized material recommendations.

**Endpoint**: `POST /ai/recommend`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "subject": "507f1f77bcf86cd799439011",
  "context": "I'm preparing for end-semester exams",
  "limit": 10
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "material": {
          "id": "507f1f77bcf86cd799439012",
          "title": "Operating Systems - Process Management Notes",
          "type": "notes"
        },
        "score": 0.95,
        "reason": "Highly relevant for exam preparation, covers key topics"
      }
    ]
  }
}
```

---

### AI-Powered Search

Search materials using natural language.

**Endpoint**: `POST /ai/search`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "query": "Find notes about deadlock prevention and avoidance",
  "filters": {
    "subject": "507f1f77bcf86cd799439011",
    "semester": 5
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
          "description": "Notes on deadlock prevention, avoidance, and recovery"
        },
        "relevance": 0.92,
        "highlights": ["deadlock prevention", "banker's algorithm"]
      }
    ],
    "totalResults": 12,
    "aiSummary": "Found 12 materials related to deadlock handling in Operating Systems"
  }
}
```

---

## Webhooks (Future Feature)

### Material Upload Webhook

Notify when new materials are uploaded.

**Endpoint**: Configured in settings

**Payload**:
```json
{
  "event": "material.uploaded",
  "timestamp": "2024-02-06T19:00:00Z",
  "data": {
    "materialId": "507f1f77bcf86cd799439012",
    "title": "New Material Title",
    "subject": "Operating Systems",
    "uploadedBy": "John Doe"
  }
}
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.studyshare.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data.token;
};

// Get materials
const getMaterials = async (token, filters = {}) => {
  const response = await api.get('/materials', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  return response.data.data.materials;
};

// Upload material
const uploadMaterial = async (token, formData) => {
  const response = await api.post('/materials', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data.material;
};
```

### Python

```python
import requests

class StudyShareAPI:
    def __init__(self, base_url='https://api.studyshare.com/api'):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password}
        )
        data = response.json()
        self.token = data['data']['token']
        return self.token
    
    def get_materials(self, filters=None):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(
            f'{self.base_url}/materials',
            headers=headers,
            params=filters or {}
        )
        return response.json()['data']['materials']
    
    def upload_material(self, file_path, metadata):
        headers = {'Authorization': f'Bearer {self.token}'}
      with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
          f'{self.base_url}/materials',
          headers=headers,
          data=metadata,
          files=files
        )
        return response.json()['data']['material']
```

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** - never in localStorage for sensitive apps
3. **Implement retry logic** for failed requests
4. **Handle rate limits** gracefully
5. **Validate input** on the client side before sending to API
6. **Use pagination** for large data sets
7. **Cache responses** where appropriate
8. **Log errors** for debugging

---

## Support

For API support, please:
- Check the [Developer Guide](DEVELOPER_GUIDE.md)
- Open an issue on [GitHub](https://github.com/satendra03/Study-Share/issues)
- Email: satendrakumarparteti.work@gmail.com

---

**Last Updated**: February 2026  
**API Version**: v1 
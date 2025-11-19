# Authentication API Documentation

## Overview
This authentication system implements JWT-based authentication with role-based access control (RBAC) for teachers and students.

## Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg"
      }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### 2. Login
**POST** `/api/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### 3. Refresh Token
**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new_jwt_access_token",
      "refreshToken": "new_jwt_refresh_token"
    }
  }
}
```

### 4. Logout
**POST** `/api/auth/logout`

Logout user (client should remove tokens).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### 5. Get Current User
**GET** `/api/auth/me`

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Authentication Middleware

### `authenticate`
Verifies JWT token and attaches user info to request.

**Usage:**
```typescript
import { authenticate } from '../middleware/auth';

router.get('/protected', authenticate, controller);
```

### `authorize(...roles)`
Checks if authenticated user has required role.

**Usage:**
```typescript
import { authorize } from '../middleware/auth';

// Only teachers can access
router.post('/questions', authenticate, authorize('teacher'), createQuestion);

// Both teachers and students can access
router.get('/quizzes', authenticate, authorize('teacher', 'student'), getQuizzes);
```

### Helper Middleware
- `isTeacher` - Shorthand for `authorize('teacher')`
- `isStudent` - Shorthand for `authorize('student')`
- `isAuthenticated` - Alias for `authenticate`

**Usage:**
```typescript
import { isTeacher, isStudent } from '../middleware/auth';

router.post('/questions', isTeacher, createQuestion);
router.post('/submit', isStudent, submitQuiz);
```

## Error Codes

| Code | Description |
|------|-------------|
| `USER_EXISTS` | Email or username already registered |
| `VALIDATION_ERROR` | Request validation failed |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `NO_TOKEN` | No authorization token provided |
| `AUTHENTICATION_ERROR` | Token verification failed |
| `NOT_AUTHENTICATED` | User not authenticated |
| `FORBIDDEN` | User lacks required permissions |
| `USER_NOT_FOUND` | User account not found |

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 12
2. **JWT Tokens**: Separate access and refresh tokens with configurable expiration
3. **Role-Based Access Control**: Teacher and student roles with middleware enforcement
4. **Input Validation**: Request validation using express-validator
5. **Token Verification**: Automatic token verification on protected routes

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

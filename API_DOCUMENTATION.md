# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a valid session. Sessions are created upon successful login.

### Session Management
- Sessions are stored in memory (MemoryStore)
- Session duration: 24 hours
- Session cookie is httpOnly for security

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string (required, min: 3 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min: 6 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email"
  }
}
```

**Error Responses:**
- `400` - Validation error or user already exists
- `500` - Server error

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `500` - Server error

### Logout User
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User
```http
GET /api/auth/user
```

**Headers:**
- Requires valid session

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email"
  }
}
```

**Error Responses:**
- `401` - Authentication required
- `404` - User not found

## Company Endpoints

All company endpoints require authentication.

### Get All Companies
```http
GET /api/companies
```

**Response (200):**
```json
{
  "companies": [
    {
      "_id": "company_id",
      "userId": "user_id",
      "companyName": "string",
      "status": "Applied",
      "nextActionDate": "2024-01-15T10:00:00.000Z",
      "interviewRounds": 0,
      "positionType": "Full-time",
      "positionTitle": "Software Engineer",
      "applicationDate": "2024-01-01T00:00:00.000Z",
      "notes": "string",
      "salaryExpectation": 75000,
      "contactPerson": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Company by ID
```http
GET /api/companies/:id
```

**Response (200):**
```json
{
  "company": {
    "_id": "company_id",
    "userId": "user_id",
    "companyName": "string",
    // ... other company fields
  }
}
```

**Error Responses:**
- `404` - Company not found

### Create Company
```http
POST /api/companies
```

**Request Body:**
```json
{
  "companyName": "string (required)",
  "status": "Applied | Interview Scheduled | Technical Round | HR Round | Final Round | Offer Received | Rejected | Withdrawn",
  "nextActionDate": "2024-01-15T10:00:00.000Z",
  "interviewRounds": 0,
  "positionType": "Internship | Full-time | Contract",
  "positionTitle": "string",
  "notes": "string",
  "salaryExpectation": 75000,
  "contactPerson": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "company": {
    "_id": "company_id",
    // ... company fields
  },
  "message": "Company created successfully"
}
```

### Update Company
```http
PUT /api/companies/:id
```

**Request Body:** Same as create company (all fields optional except validation requirements)

**Response (200):**
```json
{
  "success": true,
  "company": {
    "_id": "company_id",
    // ... updated company fields
  },
  "message": "Company updated successfully"
}
```

### Delete Company
```http
DELETE /api/companies/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

## Calendar Endpoints

### Get Calendar Events
```http
GET /api/calendar/events
```

**Response (200):**
```json
{
  "events": [
    {
      "id": "company_id",
      "title": "Company Name - Status",
      "start": "2024-01-15T10:00:00.000Z",
      "end": "2024-01-15T10:00:00.000Z",
      "resource": {
        "companyId": "company_id",
        "companyName": "string",
        "status": "string",
        "positionTitle": "string",
        "positionType": "string"
      }
    }
  ]
}
```

## Data Models

### User Schema
```javascript
{
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 6 chars), // Plain text in this demo
  timestamps: true
}
```

### Company Schema
```javascript
{
  userId: ObjectId (required, ref: 'User'),
  companyName: String (required),
  status: String (enum, default: 'Applied'),
  nextActionDate: Date,
  interviewRounds: Number (default: 0, min: 0),
  positionType: String (enum, default: 'Full-time'),
  positionTitle: String,
  applicationDate: Date (default: now),
  notes: String (max: 1000 chars),
  salaryExpectation: Number (min: 0),
  contactPerson: String,
  timestamps: true
}
```

## Status Enums

### Application Status
- `Applied`
- `Interview Scheduled`
- `Technical Round`
- `HR Round`
- `Final Round`
- `Offer Received`
- `Rejected`
- `Withdrawn`

### Position Types
- `Internship`
- `Full-time`
- `Contract`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:
- Rate limiting per IP
- Rate limiting per user
- Request throttling

## Security Notes

⚠️ **Important**: This API uses simplified authentication for educational purposes:

- Passwords are stored in plain text
- No input sanitization beyond basic validation
- Sessions stored in memory (not persistent)
- No CSRF protection
- No request rate limiting

For production use, implement proper security measures including password hashing, input validation, CSRF protection, and rate limiting.
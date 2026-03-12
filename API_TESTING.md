# API Testing Guide with cURL

This guide shows how to test the POS SaaS API using cURL commands.

## Prerequisites

- Development server running: `npm run dev`
- Base URL: `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

#### 1. Signup (Create Account)

**Endpoint**: `POST /api/auth/signup`

**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "clxxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF"
  },
  "message": "User created successfully"
}
```

**Error Responses**:

Duplicate email (409 Conflict):
```json
{
  "success": false,
  "error": {
    "message": "Email already registered"
  }
}
```

Invalid input (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

#### 2. Login (Sign In)

**Endpoint**: `POST /api/auth/signin`

Login is handled through Auth.js. In a real client (browser/app), you'd use:

```javascript
// Using Next Auth client (not cURL)
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'john@example.com',
  password: 'SecurePass123!',
  redirect: true,
  callbackUrl: '/dashboard'
});
```

For testing with cURL, the endpoint URL is: `POST http://localhost:3000/api/auth/signin`

#### 3. Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Request**:
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "clxxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF"
  }
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Not authenticated"
  }
}
```

## Password Validation Rules

Password must contain ALL of these:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*)

**Valid examples**:
- `SecurePass123!`
- `MyPassword321@`
- `Test123!@#`

**Invalid examples**:
- `password` - No uppercase, numbers, special char
- `Passw1` - Too short, no special char
- `PASSWORD123` - No lowercase, no special char
- `Pass@word` - No numbers

## Testing Workflow

### 1. Create Test User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@test.com",
    "password": "Alice123!@#"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "Alice Smith",
    "email": "alice@test.com",
    "role": "STAFF"
  }
}
```

### 2. Try Invalid - Duplicate Email

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Second",
    "email": "alice@test.com",
    "password": "Different123!@#"
  }'
```

Response (409):
```json
{
  "success": false,
  "error": {
    "message": "Email already registered"
  }
}
```

### 3. Try Invalid - Weak Password

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson",
    "email": "bob@test.com",
    "password": "weak"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### 4. Try Invalid - Invalid Email

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Brown",
    "email": "not-an-email",
    "password": "Charlie123!@#"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email address"]
    }
  }
}
```

### 5. Try Invalid - Missing Fields

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dave@test.com"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "name": ["Required"],
      "password": ["Required"]
    }
  }
}
```

## Testing via Browser

### Option 1: Using DevTools Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Navigate to /signup
4. Fill form and submit
5. Click the POST request to /api/auth/signup
6. See request/response in DevTools

### Option 2: Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Create new request:
   - Method: POST
   - URL: `http://localhost:3000/api/auth/signup`
   - Headers: `Content-Type: application/json`
   - Body (raw):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "TestPass123!@#"
   }
   ```
3. Click Send
4. See response

### Option 3: Using Thunder Client (VS Code)

1. Install Thunder Client extension in VS Code
2. Create new request
3. Same as Postman above
4. Response shows in sidebar

## Common Testing Scenarios

### Scenario 1: Complete Signup Flow

```bash
# Step 1: Create user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!@#"
  }'

# Response: User created with ID

# Step 2: Go to browser and login manually
# http://localhost:3000/login
# Email: test@example.com
# Password: TestPass123!@#

# Step 3: Access dashboard
# http://localhost:3000/dashboard
```

### Scenario 2: Test Error Handling

```bash
# Test 1: Empty password
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":""}'

# Test 2: Invalid email format
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"invalid-email","password":"Pass123!@#"}'

# Test 3: Short password
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"Pass1!"}'

# Test 4: No uppercase
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"password123!@#"}'

# Test 5: No lowercase
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"PASSWORD123!@#"}'

# Test 6: No numbers
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"Password!@#"}'

# Test 7: No special characters
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"Password123"}'
```

### Scenario 3: Test User Persistence

```bash
# Create user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Persistent User",
    "email": "persistent@example.com",
    "password": "Persist123!@#"
  }'

# Try creating same user again (should fail)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Different Name",
    "email": "persistent@example.com",
    "password": "Different123!@#"
  }'
# Should return 409 Conflict: "Email already registered"
```

## Response Format

All API responses follow this format:

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { /* additional details */ }
  }
}
```

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Profile retrieved |
| 201 | Created | User created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | User not found |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Database error |

## Debugging Tips

### Check Request Headers
```bash
curl -v -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"Pass123!@#"}'
```

### Pretty Print JSON
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"Pass123!@#"}' | jq
```

### Save Response to File
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"Pass123!@#"}' > response.json
```

### Check Server Logs
Watch your terminal where you ran `npm run dev` to see:
- Request logs
- Validation errors
- Database operations
- Error traces

## Next Steps

After testing the API:

1. Review the database with Prisma Studio: `npm run prisma:studio`
2. Explore the code in `/src/app/api/`
3. Check service layer in `/src/services/`
4. Try adding a new endpoint
5. Plan Phase 2 features

---

Happy testing! 🧪

# API Integration Documentation

## Base URL

\`\`\`
http://127.0.0.1:8888/api
\`\`\`

## Authentication

API sử dụng JWT (JSON Web Tokens) với HTTP-only cookies để xác thực.

### Headers

\`\`\`
Content-Type: application/json
Authorization: Bearer {access_token}
\`\`\`

### Credentials

Tất cả requests phải include credentials để gửi/nhận cookies:

\`\`\`javascript
credentials: 'include'
\`\`\`

## API Endpoints

### Authentication Endpoints

#### 1. Login

**POST** `/auth/login/`

Request body:
\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "access": "string",
  "refresh": "string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "phone_number": "string"
  }
}
\`\`\`

#### 2. Register

**POST** `/auth/register/`

Request body:
\`\`\`json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone_number": "string (optional)"
}
\`\`\`

Response: Same as login

#### 3. Logout

**POST** `/auth/logout/`

Clears JWT cookies.

#### 4. Refresh Token

**POST** `/auth/refresh/`

Refreshes access token using refresh token from cookie.

Response:
\`\`\`json
{
  "access": "string"
}
\`\`\`

### User Endpoints

#### Get Current User

**GET** `/users/me/`

Headers:
\`\`\`
Authorization: Bearer {access_token}
\`\`\`

Response:
\`\`\`json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string"
}
\`\`\`

## API Client Usage

### Import API Client

\`\`\`typescript
import { apiClient } from '@/lib/api';
\`\`\`

### Login Example

\`\`\`typescript
try {
  const response = await apiClient.login({
    username: 'user123',
    password: 'password123'
  });
  console.log('User:', response.user);
  console.log('Access Token:', response.access);
} catch (error) {
  console.error('Login failed:', error.message);
}
\`\`\`

### Register Example

\`\`\`typescript
try {
  const response = await apiClient.register({
    username: 'newuser',
    email: 'user@example.com',
    password: 'securepassword',
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '0123456789'
  });
  console.log('Registered user:', response.user);
} catch (error) {
  console.error('Registration failed:', error.message);
}
\`\`\`

### Logout Example

\`\`\`typescript
try {
  await apiClient.logout();
  console.log('Logged out successfully');
} catch (error) {
  console.error('Logout failed:', error.message);
}
\`\`\`

## Error Handling

API errors are thrown as Error objects with descriptive messages:

\`\`\`typescript
try {
  await apiClient.login(credentials);
} catch (error) {
  if (error instanceof Error) {
    // Display error.message to user
    console.error(error.message);
  }
}
\`\`\`

Common error messages:
- "Invalid credentials"
- "User already exists"
- "Token expired"
- "Network error"

## Token Management

- Access tokens are stored in localStorage: `access_token`
- Refresh tokens are stored in HTTP-only cookies (managed by backend)
- User data is stored in localStorage: `user`

### Token Refresh Flow

1. Access token expires
2. Frontend calls `/auth/refresh/` with refresh token cookie
3. Backend returns new access token
4. Frontend updates localStorage with new token

## CORS Configuration

Backend must allow:
- Origin: `http://localhost:3000` (development)
- Credentials: `true`
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`

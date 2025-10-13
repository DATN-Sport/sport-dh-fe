# Authentication System Documentation

## Overview

Sport DH sử dụng JWT (JSON Web Tokens) authentication với HTTP-only cookies để bảo mật.

## Architecture

### Components

1. **AuthContext** (`contexts/auth-context.tsx`)
   - Quản lý authentication state
   - Cung cấp login, register, logout functions
   - Lưu trữ user data

2. **API Client** (`lib/api.ts`)
   - Xử lý HTTP requests
   - Tự động include credentials
   - Error handling

3. **ProtectedRoute** (`components/protected-route.tsx`)
   - HOC bảo vệ routes
   - Redirect về /login nếu chưa đăng nhập
   - Loading state

## Authentication Flow

### Login Flow

\`\`\`
1. User nhập username/password
2. Frontend gửi POST /auth/login/
3. Backend xác thực và trả về:
   - Access token
   - Refresh token (HTTP-only cookie)
   - User data
4. Frontend lưu:
   - Access token → localStorage
   - User data → localStorage
   - User data → AuthContext state
5. Redirect về trang chủ
\`\`\`

### Register Flow

\`\`\`
1. User điền form đăng ký
2. Frontend validate (password match, etc.)
3. Frontend gửi POST /auth/register/
4. Backend tạo user mới và trả về tokens
5. Frontend lưu tokens và user data
6. Redirect về trang chủ
\`\`\`

### Logout Flow

\`\`\`
1. User click logout
2. Frontend gửi POST /auth/logout/
3. Backend xóa refresh token cookie
4. Frontend xóa:
   - localStorage (tokens, user data)
   - AuthContext state
5. Redirect về /login
\`\`\`

### Protected Route Flow

\`\`\`
1. User truy cập protected route
2. ProtectedRoute check isAuthenticated
3. Nếu chưa đăng nhập:
   - Show loading
   - Redirect về /login
4. Nếu đã đăng nhập:
   - Render page content
\`\`\`

## Using Authentication

### In Components

\`\`\`tsx
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
\`\`\`

### Protecting Routes

\`\`\`tsx
import { ProtectedRoute } from '@/components/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
\`\`\`

### Making Authenticated Requests

\`\`\`typescript
import { apiClient } from '@/lib/api';

// Token tự động được thêm vào header
const token = localStorage.getItem('access_token');
const user = await apiClient.getCurrentUser(token);
\`\`\`

## Token Storage

### localStorage

\`\`\`javascript
// Access token
localStorage.setItem('access_token', token);
localStorage.getItem('access_token');

// User data
localStorage.setItem('user', JSON.stringify(userData));
JSON.parse(localStorage.getItem('user'));

// Clear on logout
localStorage.removeItem('access_token');
localStorage.removeItem('user');
\`\`\`

### HTTP-only Cookies

Refresh tokens được lưu trong HTTP-only cookies bởi backend:
- Không thể truy cập từ JavaScript
- Tự động gửi với mọi request
- An toàn hơn XSS attacks

## Security Considerations

### Current Implementation

✅ HTTP-only cookies cho refresh tokens
✅ HTTPS trong production (recommended)
✅ Token expiration
✅ Credentials included in requests
✅ Error handling

### Recommendations

- [ ] Implement token refresh logic
- [ ] Add CSRF protection
- [ ] Rate limiting cho login attempts
- [ ] Password strength validation
- [ ] Two-factor authentication (future)

## Error Handling

### Login Errors

\`\`\`typescript
try {
  await login(credentials);
} catch (error) {
  // Display error to user
  setError(error.message);
  // Common errors:
  // - "Invalid credentials"
  // - "Account locked"
  // - "Network error"
}
\`\`\`

### Token Expiration

\`\`\`typescript
// When access token expires:
1. Try to refresh token
2. If refresh fails, logout user
3. Redirect to login page
\`\`\`

## Testing Authentication

### Manual Testing

1. **Test Login**
   - Go to /login
   - Enter valid credentials
   - Should redirect to home page
   - Check localStorage for tokens

2. **Test Register**
   - Go to /register
   - Fill form with new user data
   - Should create account and login
   - Check localStorage

3. **Test Logout**
   - Click logout button
   - Should clear localStorage
   - Should redirect to /login

4. **Test Protected Routes**
   - Logout
   - Try to access /
   - Should redirect to /login

### API Testing

\`\`\`bash
# Test login
curl -X POST http://127.0.0.1:8888/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Test register
curl -X POST http://127.0.0.1:8888/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"user@test.com","password":"pass123"}'
\`\`\`

## Troubleshooting

### Common Issues

1. **"Network error" on login**
   - Check backend is running on port 8888
   - Check CORS configuration
   - Check API_URL in .env.local

2. **Redirect loop**
   - Clear localStorage
   - Check ProtectedRoute logic
   - Check AuthContext initialization

3. **Token not sent with requests**
   - Ensure credentials: 'include'
   - Check cookie settings in backend
   - Check CORS allow credentials

4. **User data not persisting**
   - Check localStorage in DevTools
   - Check AuthContext useEffect
   - Check token expiration

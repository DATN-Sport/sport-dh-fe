# Chat API Documentation - Frontend Integration

Tài liệu API cho Frontend developers tích hợp Chat module.

## Base URL
```
/api/chat/
```

## Authentication
Tất cả endpoints yêu cầu authentication token (JWT) trong header:
```
Authorization: Bearer <token>
```

---

## 1. Chat với AI

### Endpoint
```
POST /api/chat/
```

### Request

**Body (JSON):**
```json
{
  "q": "Tìm sân bóng đá tối nay",
  "session_id": "550e8400-e29b-41d4-a716-446655440000" // Optional
}
```

**Query Params (Alternative):**
```
POST /api/chat/?q=Tìm sân bóng đá tối nay&session_id=550e8400-e29b-41d4-a716-446655440000
```

### Response

**Success (200):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "Tìm sân bóng đá tối nay",
  "answer": "Tôi có thể giúp bạn tìm sân bóng đá tối nay. Bạn muốn tìm sân ở khu vực nào?"
}
```

**Error (400):**
```json
{
  "error": "Thiếu tham số 'q' (câu hỏi)"
}
```

**Error (403):**
```json
{
  "error": "Không có quyền truy cập session này"
}
```

### Notes
- Nếu không có `session_id`, hệ thống tự động tạo session mới
- Nếu có `session_id`, chatbot sẽ tiếp tục cuộc trò chuyện từ lịch sử trước đó
- Rate limit: 20 requests/phút/user

---

## 2. Lấy lịch sử chat của một session

### Endpoint
```
GET /api/chat/history/?session_id=<uuid>
```

### Request

**Query Params:**
- `session_id` (required): UUID của session

### Response

**Success (200):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Xin chào",
      "created_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Xin chào! Tôi có thể giúp gì cho bạn?",
      "created_at": "2025-01-15T10:00:01Z"
    },
    {
      "id": 3,
      "role": "user",
      "content": "Tìm sân bóng đá",
      "created_at": "2025-01-15T10:02:00Z"
    },
    {
      "id": 4,
      "role": "assistant",
      "content": "Tôi có thể giúp bạn tìm sân bóng đá...",
      "created_at": "2025-01-15T10:02:01Z"
    }
  ],
  "total": 4
}
```

**Error (400):**
```json
{
  "error": "Thiếu tham số 'session_id'"
}
```

**Error (404):**
```json
{
  "error": "Không tìm thấy session"
}
```

**Error (403):**
```json
{
  "error": "Không có quyền truy cập session này"
}
```

---

## 3. Lấy danh sách sessions của user

### Endpoint
```
GET /api/chat/sessions/
```

### Request
Không cần params, tự động lấy sessions của user hiện tại.

### Response

**Success (200):**
```json
{
  "sessions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "message_count": 10,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T11:30:00Z"
    },
    {
      "session_id": "660e8400-e29b-41d4-a716-446655440001",
      "message_count": 5,
      "created_at": "2025-01-14T09:00:00Z",
      "updated_at": "2025-01-14T09:15:00Z"
    }
  ],
  "total": 2
}
```

**Error (401):**
```json
{
  "error": "Yêu cầu đăng nhập"
}
```

---

## TypeScript Interfaces

```typescript
// Chat Message
interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string; // ISO 8601 format
}

// Chat Response
interface ChatResponse {
  session_id: string;
  question: string;
  answer: string;
}

// Chat History Response
interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
  total: number;
}

// Chat Session
interface ChatSession {
  session_id: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

// Chat Sessions Response
interface ChatSessionsResponse {
  sessions: ChatSession[];
  total: number;
}

// Error Response
interface ErrorResponse {
  error: string;
}

// Chat Request
interface ChatRequest {
  q: string;
  session_id?: string;
}
```

---

## Example Usage (TypeScript/React)

### 1. Chat với AI

```typescript
async function sendMessage(question: string, sessionId?: string): Promise<ChatResponse> {
  const response = await fetch('/api/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      q: question,
      session_id: sessionId
    })
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}

// Usage
const result = await sendMessage("Tìm sân bóng đá tối nay");
console.log(result.session_id); // Lưu lại để dùng cho lần sau
console.log(result.answer);
```

### 2. Lấy lịch sử chat

```typescript
async function getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
  const response = await fetch(`/api/chat/history/?session_id=${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}

// Usage
const history = await getChatHistory(sessionId);
history.messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`);
});
```

### 3. Lấy danh sách sessions

```typescript
async function getChatSessions(): Promise<ChatSessionsResponse> {
  const response = await fetch('/api/chat/sessions/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}

// Usage
const sessions = await getChatSessions();
sessions.sessions.forEach(session => {
  console.log(`Session ${session.session_id}: ${session.message_count} messages`);
});
```

### 4. React Hook Example

```typescript
import { useState, useCallback } from 'react';

interface UseChatReturn {
  sendMessage: (question: string) => Promise<void>;
  messages: ChatMessage[];
  sessionId: string | null;
  loading: boolean;
  error: string | null;
}

function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessage(question, sessionId || undefined);
      
      // Lưu session_id nếu chưa có
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Thêm messages mới vào state
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'user',
          content: question,
          created_at: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.answer,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { sendMessage, messages, sessionId, loading, error };
}

// Usage in component
function ChatComponent() {
  const { sendMessage, messages, loading, error } = useChat();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    await sendMessage(input.value);
    input.value = '';
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nhập câu hỏi..." />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

## Error Handling

Tất cả endpoints có thể trả về các lỗi sau:

| Status Code | Mô tả |
|------------|-------|
| 400 | Bad Request - Thiếu tham số hoặc dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy resource |
| 429 | Too Many Requests - Vượt quá rate limit (20/phút) |
| 500 | Internal Server Error - Lỗi server |

---

## Best Practices

1. **Lưu session_id**: Sau lần chat đầu tiên, lưu `session_id` vào localStorage/sessionStorage để tiếp tục cuộc trò chuyện
2. **Error handling**: Luôn xử lý lỗi và hiển thị thông báo cho user
3. **Loading states**: Hiển thị loading khi đang gửi message
4. **Rate limiting**: Xử lý lỗi 429 và thông báo user chờ một chút
5. **Auto-scroll**: Tự động scroll xuống message mới nhất
6. **Message ordering**: Messages được sắp xếp theo `created_at` (từ cũ đến mới)

---

## Testing với cURL

### 1. Chat với AI
```bash
curl -X POST "http://localhost:8000/api/chat/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "Tìm sân bóng đá tối nay",
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 2. Lấy lịch sử
```bash
curl -X GET "http://localhost:8000/api/chat/history/?session_id=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Lấy danh sách sessions
```bash
curl -X GET "http://localhost:8000/api/chat/sessions/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```


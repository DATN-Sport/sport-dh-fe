# Chat API - Hướng dẫn nhanh cho Frontend

## 📋 Tổng quan

Chat module có 3 API endpoints chính:
1. **POST /api/chat/** - Chat với AI
2. **GET /api/chat/history/** - Lấy lịch sử chat
3. **GET /api/chat/sessions/** - Lấy danh sách sessions

## 🚀 Quick Start

### 1. Chat với AI (Bắt buộc)

```typescript
// Gửi message
const response = await fetch('/api/chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    q: "Tìm sân bóng đá tối nay",
    session_id: sessionId // Optional - nếu không có sẽ tạo mới
  })
});

const data = await response.json();
// data.session_id - LƯU LẠI để dùng cho lần sau
// data.answer - Câu trả lời từ AI
```

### 2. Lưu session_id

```typescript
// Sau lần chat đầu tiên, lưu session_id
localStorage.setItem('chat_session_id', data.session_id);

// Lần sau, dùng lại session_id để tiếp tục cuộc trò chuyện
const sessionId = localStorage.getItem('chat_session_id');
```

### 3. Lấy lịch sử chat (Optional)

```typescript
const history = await fetch(`/api/chat/history/?session_id=${sessionId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await history.json();
// data.messages - Array các messages
```

## 📝 Response Format

### Chat Response
```json
{
  "session_id": "uuid",
  "question": "Câu hỏi",
  "answer": "Câu trả lời"
}
```

### History Response
```json
{
  "session_id": "uuid",
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
      "content": "Xin chào!",
      "created_at": "2025-01-15T10:00:01Z"
    }
  ],
  "total": 2
}
```

## ⚠️ Lưu ý quan trọng

1. **Session ID**: Luôn lưu `session_id` sau lần chat đầu tiên để tiếp tục cuộc trò chuyện
2. **Authentication**: Tất cả API cần token trong header `Authorization: Bearer <token>`
3. **Rate Limit**: 20 requests/phút/user
4. **Error Handling**: Luôn check `response.ok` và xử lý lỗi

## 🔧 Files hỗ trợ

- `API_DOCS.md` - Tài liệu chi tiết đầy đủ
- `types.ts` - TypeScript types/interfaces
- `api-client.example.ts` - Example API client
- `react-hook.example.tsx` - Example React hook

## 💡 Flow đơn giản nhất

```typescript
// 1. Lấy sessionId từ localStorage (nếu có)
let sessionId = localStorage.getItem('chat_session_id');

// 2. Gửi message
const res = await fetch('/api/chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    q: userQuestion,
    session_id: sessionId || undefined
  })
});

const data = await res.json();

// 3. Lưu sessionId (nếu chưa có)
if (!sessionId) {
  sessionId = data.session_id;
  localStorage.setItem('chat_session_id', sessionId);
}

// 4. Hiển thị câu trả lời
console.log(data.answer);
```

## 🎯 Checklist cho Frontend

- [ ] Tích hợp POST /api/chat/ để chat
- [ ] Lưu session_id vào localStorage
- [ ] Truyền session_id trong request tiếp theo
- [ ] Xử lý lỗi (400, 401, 403, 429)
- [ ] Hiển thị loading state
- [ ] Hiển thị messages (user + assistant)
- [ ] Auto scroll đến message mới nhất

---

**Xem chi tiết trong `API_DOCS.md`**


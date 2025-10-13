# Chatbot Integration

## Tổng quan

Chatbot AI của Sport DH giúp người dùng tìm kiếm và đặt sân thể thao tại Đà Nẵng.

## API Endpoint

\`\`\`bash
POST /api/chatbot/?q={question}
\`\`\`

**Headers:**
\`\`\`
Authorization: Bearer {access_token}
Content-Type: application/json
\`\`\`

**Query Parameters:**
- `q`: Câu hỏi của người dùng (URL encoded)

**Response:**
\`\`\`json
{
  "question": "xin chào",
  "answer": "Chào bạn! Tôi là trợ lý AI của DaiHiep Sport đây. Bạn cần tìm hoặc đặt sân thể thao nào ở Đà Nẵng hôm nay không? 😊"
}
\`\`\`

## Tính năng

### 1. Floating Button
- Hiển thị ở góc dưới bên phải màn hình
- Click để mở/đóng chat window
- Icon MessageCircle từ lucide-react

### 2. Chat Window
- Kích thước: 384px width, 384px height cho messages
- Hiển thị lịch sử chat
- Auto-scroll đến tin nhắn mới nhất
- Loading state khi đang chờ response

### 3. Markdown Rendering
- Sử dụng `react-markdown` để render response từ bot
- Hỗ trợ formatting: **bold**, *italic*, lists, links, etc.
- Styling với Tailwind Typography (prose classes)

### 4. Message Types
- **User messages**: Hiển thị bên phải, background primary
- **Bot messages**: Hiển thị bên trái, background muted, render markdown

## Component Usage

\`\`\`tsx
import { Chatbot } from "@/components/chatbot"

// Trong layout.tsx
<Chatbot />
\`\`\`

Component tự động hiển thị floating button và quản lý state.

## Ví dụ Response với Markdown

\`\`\`json
{
  "question": "bạn có thể làm gì",
  "answer": "Chào bạn! Tôi là trợ lý AI của DaiHiep Sport. Tôi có thể giúp bạn:\n\n* **Tìm thông tin** các sân thể thao (bóng đá, cầu lông, tennis, pick-a-ball) tại Đà Nẵng.\n* **Kiểm tra và đặt sân trống** theo giờ bạn muốn.\n* **Lọc sân** theo khu vực, môn thể thao hoặc khung giờ.\n* **Gợi ý sân** gần nhất, rẻ nhất, hoặc phù hợp nhất.\n\nBạn đang muốn tìm sân thể thao nào hôm nay? 😊"
}
\`\`\`

Markdown này sẽ được render với:
- Bullet points
- Bold text
- Line breaks
- Emojis

## Styling

### Message Bubble
\`\`\`tsx
// User message
className="bg-primary text-primary-foreground"

// Bot message with markdown
<div className="prose prose-sm max-w-none dark:prose-invert">
  <ReactMarkdown>{message.content}</ReactMarkdown>
</div>
\`\`\`

### Prose Classes
- `prose`: Base typography styles
- `prose-sm`: Smaller text size
- `max-w-none`: Remove max-width constraint
- `dark:prose-invert`: Dark mode support

## Error Handling

Nếu API call thất bại, hiển thị message:
\`\`\`
"Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau."
\`\`\`

## Keyboard Shortcuts

- **Enter**: Gửi tin nhắn
- **Shift + Enter**: Xuống dòng (không gửi)

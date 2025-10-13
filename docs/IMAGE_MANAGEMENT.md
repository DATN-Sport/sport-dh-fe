# Quản lý hình ảnh

## Tổng quan

Hệ thống quản lý hình ảnh cho phép admin xem, thêm và xóa hình ảnh cho Sport Centers và Sport Fields.

## Component: ImageGalleryManager

Component này cung cấp giao diện quản lý hình ảnh với các tính năng:

### Tính năng

1. **Xem danh sách ảnh**: Hiển thị tất cả ảnh trong grid layout
2. **Xem ảnh full size**: Click vào ảnh để xem kích thước đầy đủ
3. **Tải lên ảnh mới**: Upload nhiều ảnh cùng lúc
4. **Xóa ảnh**: Xóa từng ảnh riêng lẻ

### API Endpoints

#### Xóa ảnh

\`\`\`bash
DELETE /api/image_sport/{id}/delete/
\`\`\`

**Headers:**
\`\`\`
Authorization: Bearer {access_token}
\`\`\`

**Response:**
- 204 No Content (thành công)
- 404 Not Found (không tìm thấy ảnh)

#### Upload ảnh

Sử dụng API update của Sport Center hoặc Sport Field với FormData:

\`\`\`typescript
const formData = new FormData()
formData.append("name", "Center Name")
formData.append("address", "Address")
formData.append("images", file1)
formData.append("images", file2)
// ... thêm nhiều files

// Cho Sport Center
PATCH /api/sport_center/{id}/

// Cho Sport Field
PATCH /api/sport_field/{id}/
\`\`\`

### Cách sử dụng

\`\`\`tsx
import { ImageGalleryManager } from "@/components/image-gallery-manager"

<ImageGalleryManager
  images={entity.images}
  onImagesChange={refetchData}
  entityType="sport_center" // hoặc "sport_field"
  entityId={entity.id}
/>
\`\`\`

### Props

- `images`: Mảng các ảnh (SportCenterImage[] | SportFieldImage[])
- `onImagesChange`: Callback được gọi sau khi thêm/xóa ảnh thành công
- `entityType`: Loại entity ("sport_center" | "sport_field")
- `entityId`: ID của entity

## Cấu trúc dữ liệu

### SportCenterImage / SportFieldImage

\`\`\`typescript
interface SportCenterImage {
  id: number
  file: string // Đường dẫn tương đối, ví dụ: "images/photo.jpg"
}
\`\`\`

### API Response

\`\`\`json
{
  "id": 5,
  "images": [
    {
      "id": 8,
      "file": "images/photo1.jpg"
    },
    {
      "id": 9,
      "file": "images/photo2.png"
    }
  ],
  "name": "Sport Center Name",
  "address": "Address"
}
\`\`\`

## Lưu ý

1. **URL ảnh**: Component tự động thêm base URL từ `NEXT_PUBLIC_API_URL`
2. **Xác nhận xóa**: Hiển thị confirm dialog trước khi xóa
3. **Loading states**: Hiển thị spinner khi đang xóa ảnh
4. **Error handling**: Toast notification cho mọi lỗi
5. **Multiple upload**: Hỗ trợ chọn và upload nhiều ảnh cùng lúc

# Admin & Owner Management Documentation

## Tổng quan

Hệ thống quản trị Sport DH có 2 cấp độ:
1. **Admin** - Quản lý toàn bộ hệ thống
2. **Owner** - Quản lý trung tâm và sân thể thao của riêng mình

## Phân quyền (Role-Based Access Control)

### Vai trò

\`\`\`typescript
enum UserRole {
  ADMIN = "ADMIN",
  OWNER = "OWNER", 
  USER = "USER"
}
\`\`\`

### Quyền truy cập

| Chức năng | ADMIN | OWNER | USER |
|-----------|-------|-------|------|
| Quản lý người dùng | ✅ | ❌ | ❌ |
| Quản lý tất cả trung tâm | ✅ | ❌ | ❌ |
| Quản lý trung tâm của mình | ✅ | ✅ | ❌ |
| Quản lý tất cả sân | ✅ | ❌ | ❌ |
| Quản lý sân của trung tâm mình | ✅ | ✅ | ❌ |
| Xem danh sách sân | ✅ | ✅ | ✅ |
| Đặt sân | ✅ | ✅ | ✅ |

## Admin Management

### Routes

- `/admin` - Dashboard
- `/admin/users` - Quản lý người dùng
- `/admin/sport-centers` - Quản lý trung tâm thể thao
- `/admin/sport-fields` - Quản lý sân thể thao

### Quản lý người dùng

#### Tạo người dùng mới

\`\`\`typescript
POST /api/user/
Content-Type: multipart/form-data

{
  username: string,
  full_name: string,
  email: string,
  password: string,
  role: "ADMIN" | "OWNER" | "USER"
}
\`\`\`

#### Cập nhật người dùng

\`\`\`typescript
PUT /api/user/{id}/
Content-Type: multipart/form-data

{
  username?: string,
  full_name?: string,
  email?: string,
  role?: "ADMIN" | "OWNER" | "USER"
}
\`\`\`

#### Xóa người dùng

\`\`\`typescript
DELETE /api/user/{id}/
\`\`\`

### Quản lý trung tâm thể thao

#### Tạo trung tâm mới

\`\`\`typescript
POST /api/sport_center/
Content-Type: multipart/form-data

{
  name: string,
  address: string,
  owner: string (user_id),
  images: File[] (optional)
}
\`\`\`

#### Cập nhật trung tâm

\`\`\`typescript
PUT /api/sport_center/{id}/
Content-Type: multipart/form-data

{
  name?: string,
  address?: string,
  owner?: string,
  images?: File[]
}
\`\`\`

#### Xóa trung tâm

\`\`\`typescript
DELETE /api/sport_center/{id}/
\`\`\`

#### Quản lý ảnh trung tâm

\`\`\`typescript
// Thêm ảnh
POST /api/sport_center/{id}/images/
Content-Type: multipart/form-data
{
  images: File[]
}

// Xóa ảnh
DELETE /api/sport_center/images/{image_id}/
Response: 200 OK
\`\`\`

### Quản lý sân thể thao

#### Tạo sân mới

\`\`\`typescript
POST /api/sport_field/
Content-Type: multipart/form-data

{
  sport_center: number,
  name: string,
  price: number,
  images: File[] (optional)
}
\`\`\`

#### Cập nhật sân

\`\`\`typescript
PUT /api/sport_field/{id}/
Content-Type: multipart/form-data

{
  name?: string,
  price?: number,
  status?: "ACTIVE" | "INACTIVE",
  images?: File[]
}
\`\`\`

#### Xóa sân

\`\`\`typescript
DELETE /api/sport_field/{id}/
\`\`\`

#### Quản lý ảnh sân

\`\`\`typescript
// Thêm ảnh
POST /api/sport_field/{id}/images/
Content-Type: multipart/form-data
{
  images: File[]
}

// Xóa ảnh
DELETE /api/sport_field/images/{image_id}/
Response: 200 OK
\`\`\`

## Owner Management

### Routes

- `/owner` - Dashboard
- `/owner/sport-centers` - Quản lý trung tâm của owner
- `/owner/sport-fields` - Quản lý sân của owner

### Lọc dữ liệu theo Owner

#### Lấy trung tâm của owner

\`\`\`typescript
GET /api/sport_center?owner={user_id}

// Example
GET /api/sport_center?owner=f2041bf8-03a5-45dd-9315-5dc94f19087d
\`\`\`

#### Lấy sân của trung tâm

\`\`\`typescript
GET /api/sport_field/?sport_center={sport_center_id}

// Example
GET /api/sport_field/?sport_center=7
\`\`\`

### Quy trình làm việc của Owner

1. **Đăng nhập** với tài khoản có role OWNER
2. **Xem dashboard** với thống kê trung tâm và sân của mình
3. **Quản lý trung tâm**:
   - Chỉ xem được trung tâm có owner là mình
   - Có thể cập nhật thông tin, thêm/xóa ảnh
   - Không thể thay đổi owner
4. **Quản lý sân**:
   - Chỉ xem được sân thuộc trung tâm của mình
   - Có thể tạo sân mới cho trung tâm của mình
   - Có thể cập nhật giá, trạng thái, ảnh
   - Không thể chuyển sân sang trung tâm khác

## Components

### AdminRoute

Bảo vệ routes chỉ cho ADMIN:

\`\`\`tsx
import { AdminRoute } from '@/components/admin-route';

export default function AdminPage() {
  return (
    <AdminRoute>
      <div>Admin content</div>
    </AdminRoute>
  );
}
\`\`\`

### OwnerRoute

Bảo vệ routes chỉ cho OWNER:

\`\`\`tsx
import { OwnerRoute } from '@/components/owner-route';

export default function OwnerPage() {
  return (
    <OwnerRoute>
      <div>Owner content</div>
    </OwnerRoute>
  );
}
\`\`\`

### AdminSidebar & OwnerSidebar

Navigation sidebar cho admin và owner:

\`\`\`tsx
import { AdminSidebar } from '@/components/admin-sidebar';
import { OwnerSidebar } from '@/components/owner-sidebar';

// Trong layout
<div className="flex">
  <AdminSidebar /> {/* hoặc <OwnerSidebar /> */}
  <main>{children}</main>
</div>
\`\`\`

## Error Handling

### Centralized Error Handler

\`\`\`typescript
import { handleApiError } from '@/lib/error-handler';

try {
  await apiClient.createSportCenter(data);
  toast({ title: "Thành công" });
} catch (error) {
  const { title, description } = handleApiError(error);
  toast({ title, description, variant: "destructive" });
}
\`\`\`

### Error Types

1. **Network Error**: "Lỗi kết nối" - Backend không phản hồi
2. **Authentication Error**: "Lỗi xác thực" - Token hết hạn, không có quyền
3. **Validation Error**: "Lỗi dữ liệu" - Dữ liệu không hợp lệ
4. **Server Error**: "Lỗi máy chủ" - Lỗi 500
5. **Not Found**: "Không tìm thấy" - Lỗi 404

## Best Practices

### 1. Luôn kiểm tra quyền trước khi thao tác

\`\`\`typescript
const { user } = useAuth();

if (user.role !== 'ADMIN') {
  toast({ title: "Không có quyền", variant: "destructive" });
  return;
}
\`\`\`

### 2. Filter dữ liệu theo role

\`\`\`typescript
// Owner chỉ lấy trung tâm của mình
const sportCenters = await apiClient.getSportCenters({ 
  owner: user.id 
});

// Admin lấy tất cả
const allSportCenters = await apiClient.getSportCenters();
\`\`\`

### 3. Validate input trước khi gửi API

\`\`\`typescript
if (!formData.name || !formData.address) {
  toast({ 
    title: "Lỗi", 
    description: "Vui lòng điền đầy đủ thông tin",
    variant: "destructive" 
  });
  return;
}
\`\`\`

### 4. Hiển thị loading state

\`\`\`typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiClient.createSportCenter(data);
  } finally {
    setLoading(false);
  }
};
\`\`\`

### 5. Refresh data sau khi thao tác

\`\`\`typescript
const handleDelete = async (id: number) => {
  await apiClient.deleteSportCenter(id);
  await fetchData(); // Refresh danh sách
  toast({ title: "Xóa thành công" });
};
\`\`\`

## Testing

### Test Admin Functions

\`\`\`bash
# Login as admin
curl -X POST http://localhost:8888/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Create user
curl -X POST http://localhost:8888/api/user/ \
  -H "Authorization: Bearer {token}" \
  -F "username=newowner" \
  -F "email=owner@test.com" \
  -F "password=pass123" \
  -F "role=OWNER"

# Get all sport centers
curl -X GET http://localhost:8888/api/sport_center/ \
  -H "Authorization: Bearer {token}"
\`\`\`

### Test Owner Functions

\`\`\`bash
# Login as owner
curl -X POST http://localhost:8888/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"owner123"}'

# Get owner's sport centers
curl -X GET "http://localhost:8888/api/sport_center?owner={user_id}" \
  -H "Authorization: Bearer {token}"

# Get sport fields of owner's center
curl -X GET "http://localhost:8888/api/sport_field/?sport_center={center_id}" \
  -H "Authorization: Bearer {token}"
\`\`\`

## Troubleshooting

### Owner không thấy trung tâm của mình

1. Kiểm tra owner field trong database
2. Kiểm tra query parameter trong API call
3. Kiểm tra user.id có đúng không

### Không thể upload ảnh

1. Kiểm tra Content-Type: multipart/form-data
2. Kiểm tra file size limit
3. Kiểm tra backend có nhận được file không

### Lỗi 403 Forbidden

1. Kiểm tra token còn hạn không
2. Kiểm tra role của user
3. Kiểm tra route protection component

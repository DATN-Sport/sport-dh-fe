# Sport DH - Frontend Documentation

## Tổng quan dự án

Sport DH là nền tảng đặt thuê sân thể thao tại Đà Nẵng, được phát triển như một đồ án Công nghệ Thông tin.

### Công nghệ sử dụng

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS v4
- **Typography**: Inter font (hỗ trợ tiếng Việt)
- **Component Library**: shadcn/ui
- **State Management**: React Context API
- **Backend API**: Django REST Framework
  - Production: https://sport-be.daihiep.click/api
  - Development: http://localhost:8888/api

## Cấu trúc dự án

\`\`\`
sport-dh/
├── app/
│   ├── layout.tsx              # Root layout với AuthProvider
│   ├── page.tsx                # Trang chủ
│   ├── login/page.tsx          # Trang đăng nhập
│   ├── register/page.tsx       # Trang đăng ký
│   ├── profile/page.tsx        # Trang profile người dùng
│   ├── sport-centers/          # Trang xem trung tâm (public)
│   │   ├── page.tsx            # Danh sách trung tâm
│   │   └── [id]/page.tsx       # Chi tiết trung tâm
│   ├── sport-fields/           # Trang xem sân (public)
│   │   ├── page.tsx            # Danh sách sân
│   │   └── [id]/page.tsx       # Chi tiết sân
│   ├── admin/                  # Trang quản trị cho ADMIN
│   │   ├── page.tsx            # Dashboard admin
│   │   ├── users/page.tsx      # Quản lý người dùng
│   │   ├── sport-centers/      # Quản lý trung tâm thể thao
│   │   └── sport-fields/       # Quản lý sân thể thao
│   └── owner/                  # Trang quản trị cho OWNER
│       ├── page.tsx            # Dashboard owner
│       ├── sport-centers/      # Quản lý trung tâm của owner
│       └── sport-fields/       # Quản lý sân của owner
├── components/
│   ├── navbar.tsx              # Navigation bar
│   ├── protected-route.tsx     # HOC bảo vệ routes
│   ├── admin-route.tsx         # HOC bảo vệ admin routes
│   ├── owner-route.tsx         # HOC bảo vệ owner routes
│   ├── admin-sidebar.tsx       # Sidebar cho admin
│   ├── owner-sidebar.tsx       # Sidebar cho owner
│   ├── image-gallery-manager.tsx # Quản lý ảnh
│   └── ui/                     # shadcn/ui components
├── contexts/
│   └── auth-context.tsx        # Authentication context
├── lib/
│   ├── api.ts                  # API client và types
│   ├── error-handler.ts        # Error handling utilities
│   └── utils.ts                # Utility functions
└── docs/
    ├── PROJECT_OVERVIEW.md     # File này
    ├── API_INTEGRATION.md      # Tài liệu tích hợp API
    ├── AUTHENTICATION.md       # Tài liệu xác thực
    ├── ADMIN_MANAGEMENT.md     # Tài liệu quản trị
    └── context_curent_api.txt  # API examples
\`\`\`

## Tính năng đã triển khai

### 1. Hệ thống xác thực (Authentication)

- ✅ Đăng nhập với username/password
- ✅ Đăng ký tài khoản mới
- ✅ Đăng xuất
- ✅ Protected routes (yêu cầu đăng nhập)
- ✅ JWT token management với HTTP-only cookies
- ✅ Persistent login với localStorage
- ✅ Role-based access control (ADMIN, OWNER, USER)

### 2. Quản trị Admin

- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý người dùng (CRUD)
  - Tạo, sửa, xóa người dùng
  - Phân quyền (ADMIN, OWNER, USER)
  - Tạo user với password
- ✅ Quản lý trung tâm thể thao (CRUD)
  - Tạo, sửa, xóa trung tâm
  - Upload và quản lý nhiều ảnh
  - Gán owner cho trung tâm
- ✅ Quản lý sân thể thao (CRUD)
  - Tạo, sửa, xóa sân
  - Upload và quản lý nhiều ảnh khi tạo
  - Thiết lập giá với increment 10,000đ
  - Phân loại theo trung tâm

### 3. Quản trị Owner

- ✅ Dashboard với thống kê của owner
- ✅ Quản lý trung tâm thể thao của owner
  - Chỉ xem và chỉnh sửa trung tâm thuộc sở hữu
  - Upload và quản lý ảnh
  - Filter theo owner ID
- ✅ Quản lý sân thể thao của trung tâm
  - Chỉ xem và chỉnh sửa sân thuộc trung tâm của owner
  - Upload và quản lý ảnh
  - Thiết lập giá và trạng thái
  - Filter theo sport_center ID

### 4. Giao diện người dùng (Public Pages)

- ✅ Trang chủ với hero section và features
  - Dark theme với gradient backgrounds
  - Bold typography với Inter font
  - Feature cards với icon gradients
  - CTA sections với vibrant colors
- ✅ Trang danh sách trung tâm thể thao
  - Grid layout responsive
  - Search và filter
  - Pagination
  - Image galleries với hover effects
- ✅ Trang chi tiết trung tâm
  - Hero image với overlay
  - Thông tin chi tiết
  - Danh sách sân thuộc trung tâm
- ✅ Trang danh sách sân thể thao
  - Grid layout responsive
  - Search, filter theo giá
  - Sort theo tên, giá
  - Pagination
  - Price badges
- ✅ Trang chi tiết sân
  - Hero image với overlay
  - Thông tin giá, trạng thái
  - Image gallery
- ✅ Navigation bar với user dropdown
- ✅ Loading states và error handling
- ✅ Toast notifications với chi tiết lỗi

### 5. Thiết kế (Design System)

- ✅ **Color Palette**:
  - Primary: Vibrant Orange (#FF6B35) - energetic, sporty
  - Secondary: Electric Blue (#0EA5E9) - dynamic, modern
  - Accent: Bright Green (#10B981) - success, available
  - Background: Dark Slate (#0F172A) - dramatic, modern
  - Card: Lighter Slate (#1E293B)
- ✅ **Typography**: 
  - Font: Inter (excellent Vietnamese support)
  - Bold headings (font-black)
  - Relaxed line-height for readability
- ✅ **Components**:
  - Cards with border-2 and hover effects
  - Gradient backgrounds on hero sections
  - Image overlays with gradients
  - Colored shadows on hover
  - Bold buttons with font-bold
- ✅ Responsive design cho mobile, tablet, desktop
- ✅ Modern UI với shadcn/ui components
- ✅ Dark theme throughout
- ✅ Consistent spacing và typography

### 6. Error Handling

- ✅ Centralized error handling với `handleApiError`
- ✅ Detailed error messages từ API
- ✅ Network error detection
- ✅ User-friendly error notifications
- ✅ Error categorization (Network, Auth, Server, Validation)
- ✅ Appropriate error titles cho từng loại lỗi

### 7. Image Management

- ✅ Upload nhiều ảnh cùng lúc
- ✅ Preview ảnh trước khi upload
- ✅ Delete ảnh với confirmation
- ✅ Success notifications khi xóa
- ✅ Automatic UI refresh sau khi xóa
- ✅ Full image URLs với MEDIA_API_URL

## Biến môi trường

Tạo file `.env.local` với nội dung:

\`\`\`env
NEXT_PUBLIC_API_URL=https://sport-be.daihiep.click/api
NEXT_PUBLIC_MEDIA_API_URL=https://sport-be.daihiep.click
\`\`\`

## Chạy dự án

\`\`\`bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Chạy production server
npm start
\`\`\`

## Vai trò người dùng (User Roles)

### ADMIN
- Quản lý toàn bộ hệ thống
- Quản lý tất cả người dùng
- Quản lý tất cả trung tâm thể thao
- Quản lý tất cả sân thể thao
- Truy cập: `/admin/*`

### OWNER
- Quản lý trung tâm thể thao của mình
- Quản lý sân thể thao thuộc trung tâm của mình
- Không thể quản lý người dùng
- Truy cập: `/owner/*`

### USER
- Xem danh sách trung tâm thể thao
- Xem danh sách sân thể thao
- Xem chi tiết trung tâm và sân
- Đặt sân (coming soon)
- Quản lý booking của mình (coming soon)
- Truy cập: `/`, `/sport-centers`, `/sport-fields`, `/profile`

## Tính năng sắp tới

- [ ] Chức năng đặt sân với lịch trống
- [ ] Quản lý booking cho user
- [ ] Quản lý booking cho owner/admin
- [ ] Tích hợp thanh toán
- [ ] Đánh giá và review sân
- [ ] Tìm kiếm và filter sân nâng cao
- [ ] Google Maps integration
- [ ] Chatbot hỗ trợ đặt sân
- [ ] Thông báo real-time
- [ ] Email notifications

## Design Guidelines

### Color Usage
- **Primary (Orange)**: Main CTAs, important actions, energy
- **Secondary (Blue)**: Secondary actions, trust, reliability
- **Accent (Green)**: Success states, availability, positive actions
- **Gradients**: Use for hero sections and feature cards

### Typography
- **Headings**: font-black (900 weight) for impact
- **Body**: font-normal with leading-relaxed
- **Buttons**: font-bold for emphasis
- **Vietnamese**: Inter font ensures proper diacritic rendering

### Components
- **Cards**: border-2 with hover:border-[color] and colored shadows
- **Images**: Overlay gradients for better text readability
- **Buttons**: Bold text, adequate padding, clear hierarchy
- **Spacing**: Generous padding for breathing room

## Liên hệ

Dự án được phát triển cho đồ án Công nghệ Thông tin tại Đà Nẵng.

# Hướng dẫn cài đặt và sử dụng

## Cài đặt project

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Truy cập: http://localhost:3000

### 3. Tạo sample data (tuỳ chọn)

```bash
curl -X POST http://localhost:3000/api/seed-data
```

Hoặc gọi endpoint:

```
POST /api/seed-data
```

Kết quả sẽ tạo:

- 1 admin user: admin@example.com
- 1 regular user: john@example.com
- 2 sample orders

---

## Luồng sử dụng

### 1. Đăng ký user mới

```
GET / (trang chủ)
↓
Điền form đăng ký
↓
POST /api/register
↓
User được tạo trong database
↓
Redirect tới /dashboard
```

### 2. Đăng nhập

```
GET /login
↓
Nhập email
↓
GET /api/users/get-by-email
↓
Lưu userId vào localStorage
↓
Redirect tới /dashboard
```

### 3. Xem/quản lý đơn hàng

```
GET /orders (cần userId từ localStorage)
↓
Lấy dữ liệu: GET /api/orders/list?userId={userId}
↓
Cập nhật trạng thái: PATCH /api/orders/update-status
```

### 4. Admin quản lý user (chỉ admin)

```
GET /users (cần adminId từ localStorage)
↓
Lấy dữ liệu: GET /api/users/list?adminId={adminId}
↓
Tạo user: POST /api/users/create
↓
Cập nhật user: PATCH /api/users/update
↓
Xóa user: DELETE /api/users/delete
```

---

## Database

Dữ liệu được lưu trong file JSON:

```
app/data/database.json
```

**Cấu trúc:**

```json
{
  "users": [
    {
      "id": "user_...",
      "name": "Name",
      "email": "email@example.com",
      "phone": "0123456789",
      "role": "user|admin",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "orders": [
    {
      "id": "order_...",
      "refuserId": "user_...",
      "voucherCode": "VC001",
      "amount": 100000,
      "status": "pending|approved|rejected|completed",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

## Tính năng chính

### ✅ Module Users Management

- ✓ Tạo user mới (mặc định role = "user")
- ✓ Cập nhật thông tin user
- ✓ Xóa user
- ✓ Lấy danh sách tất cả user (chỉ admin)
- ✓ Lấy user theo email

### ✅ Module Orders Management

- ✓ Tạo order với refuserId
- ✓ Cập nhật trạng thái order
- ✓ Lấy order của user (filter theo refuserId)
- ✓ Lấy tất cả order (chỉ admin)

### ✅ Authentication

- ✓ Đăng ký user
- ✓ Đăng nhập (bằng email)
- ✓ Lưu session trong localStorage

### ✅ UI/UX

- ✓ Trang đăng ký với validation
- ✓ Trang đăng nhập
- ✓ Dashboard chính
- ✓ Trang quản lý đơn hàng (inline edit status)
- ✓ Trang quản lý user (chỉ admin)
- ✓ Responsive design
- ✓ Status badges

---

## Pages & Routes

| URL          | Mô tả                     |
| ------------ | ------------------------- |
| `/`          | Trang đăng ký             |
| `/login`     | Trang đăng nhập           |
| `/dashboard` | Bảng điều khiển chính     |
| `/orders`    | Quản lý đơn hàng          |
| `/users`     | Quản lý user (admin only) |

---

## API Endpoints

Xem chi tiết trong file [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Users APIs

- `POST /api/register` - Đăng ký
- `POST /api/users/create` - Tạo user
- `PATCH /api/users/update` - Cập nhật user
- `DELETE /api/users/delete` - Xóa user
- `GET /api/users/list` - Lấy danh sách (admin)
- `GET /api/users/get-by-email` - Lấy user theo email

### Orders APIs

- `POST /api/orders/create` - Tạo order
- `PATCH /api/orders/update-status` - Cập nhật status
- `GET /api/orders/list` - Lấy danh sách order

### Utilities

- `POST /api/seed-data` - Tạo sample data

---

## Lưu ý quan trọng

1. **MockAPI Database**: Dữ liệu được lưu trong JSON file, không phải database thực
2. **Admin Role**: Được set trực tiếp trong file database.json (email = "admin@example.com")
3. **LocalStorage**: Session lưu trong localStorage, không persistent khi refresh page (có thể bị mất)
4. **Webhook n8n**: Vẫn hoạt động song song với MockAPI (tuỳ chọn)

---

## Mở rộng trong tương lai

- [ ] Sử dụng database thực (MongoDB, PostgreSQL)
- [ ] Thêm JWT authentication
- [ ] Thêm role-based permission middleware
- [ ] Thêm validation form phía server
- [ ] Thêm error handling toàn diện
- [ ] Thêm logging system
- [ ] Thêm pagination cho danh sách
- [ ] Thêm search & filter
- [ ] Thêm export data (CSV, PDF)
- [ ] Thêm notification system

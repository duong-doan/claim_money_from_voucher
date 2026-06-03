# API Documentation

## Các tính năng đã thêm:

### 1. **Module Users Management**

- Tạo user (mặc định role là "user")
- Cập nhật thông tin user
- Xóa user
- Lấy danh sách tất cả user (chỉ admin)

### 2. **Module Orders Management**

- Tạo order với refuserid
- Lấy danh sách order của user hiện tại
- Cập nhật trạng thái order
- Lấy tất cả order (chỉ admin)

### 3. **MockAPI Database**

- Sử dụng JSON file (`app/data/database.json`)
- Lưu trữ users và orders

---

## API Endpoints

### Users Endpoints

#### 1. Đăng ký user mới

**POST** `/api/register`

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789"
}
```

#### 2. Tạo user mới (Admin)

**POST** `/api/users/create`

```json
{
  "name": "Nguyễn Văn B",
  "email": "user2@example.com",
  "phone": "0987654321"
}
```

#### 3. Cập nhật thông tin user

**PATCH** `/api/users/update`

```json
{
  "userId": "user_123",
  "name": "Tên mới",
  "email": "new@example.com",
  "phone": "0111111111"
}
```

#### 4. Xóa user

**DELETE** `/api/users/delete`

```json
{
  "userId": "user_123"
}
```

#### 5. Lấy danh sách tất cả users (chỉ admin)

**GET** `/api/users/list?adminId={admin_user_id}`

#### 6. Lấy thông tin user theo email

**GET** `/api/users/get-by-email?email={user_email}`

---

### Orders Endpoints

#### 1. Lấy danh sách order của user

**GET** `/api/orders/list?userId={user_id}`

#### 2. Lấy tất cả orders (chỉ admin)

**GET** `/api/orders/list?adminId={admin_user_id}`

#### 3. Cập nhật trạng thái order

**PATCH** `/api/orders/update-status`

```json
{
  "orderId": "order_123",
  "status": "approved"
}
```

**Trạng thái có thể có:**

- `pending` - Chờ xử lý
- `approved` - Được duyệt
- `rejected` - Bị từ chối
- `completed` - Hoàn thành

---

## User Roles

### Role "user"

- Mặc định cho tất cả user mới
- Xem được order của riêng mình
- Cập nhật status của order của mình

### Role "admin"

- Xem được tất cả user
- Xem được tất cả order
- Quản lý user (create, update, delete)

---

## Pages (Giao diện)

### 1. `/` - Trang đăng ký

- Form đăng ký user mới

### 2. `/login` - Trang đăng nhập

- Đăng nhập bằng email để lấy userId

### 3. `/dashboard` - Trang chính

- Menu điều hướng
- Link tới quản lý order và user (nếu là admin)

### 4. `/orders` - Quản lý đơn hàng

- Xem danh sách order
- Cập nhật trạng thái order (giao diện inline edit)

### 5. `/users` - Quản lý người dùng (chỉ admin)

- Tạo user mới
- Chỉnh sửa thông tin user
- Xóa user

---

## Cách sử dụng

### 1. Tạo sample data

Gọi endpoint này để tạo dữ liệu mẫu:

```
POST /api/seed-data
```

Kết quả:

```json
{
  "success": true,
  "message": "Sample data created successfully",
  "data": {
    "admin": {
      "id": "user_...",
      "name": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "regularUser": {...},
    "orders": [...]
  }
}
```

### 2. Đăng nhập

1. Vào trang `/login`
2. Nhập email: `admin@example.com` hoặc `john@example.com`
3. Nhấn Đăng nhập

### 3. Sử dụng các tính năng

- Nếu là admin: có thể vào `/users` để quản lý user
- Có thể vào `/orders` để quản lý order

---

## Database Structure

**File:** `app/data/database.json`

```json
{
  "users": [
    {
      "id": "user_...",
      "name": "Name",
      "email": "email@example.com",
      "phone": "0123456789",
      "role": "user|admin",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "orders": [
    {
      "id": "order_...",
      "refuserId": "user_...",
      "voucherCode": "VC001",
      "amount": 100000,
      "status": "pending|approved|rejected|completed",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Ghi chú

- Tất cả dữ liệu được lưu trong JSON file (không phải database thực)
- Admin user có tên là "admin" có thể xem tất cả đơn hàng
- Khi filter order, chỉ lấy những order có `refuserId` = userId
- Trạng thái "admin" được set trực tiếp trong database (không có API để upgrade user thành admin)

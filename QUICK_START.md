# 🚀 Quick Start Guide

## Bước 1: Cài đặt & Chạy Project

```bash
cd /Users/admin/Documents/Project/claim_money_from_voucher

# Cài đặt dependencies (nếu chưa)
npm install

# Chạy development server
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

---

## Bước 2: Tạo Sample Data

Mở terminal hoặc Postman và gọi:

```bash
curl -X POST http://localhost:3000/api/seed-data
```

**Kết quả tạo:**

- ✅ Admin user: email = `admin@example.com`
- ✅ Regular user: email = `john@example.com`
- ✅ 2 sample orders

---

## Bước 3: Test các tính năng

### 3.1 Trang Đăng Ký

```
1. Vào: http://localhost:3000/
2. Điền form: Họ tên, Email, Số điện thoại
3. Bấm "Đăng ký ngay"
4. ✅ Sẽ redirect tới /dashboard
```

### 3.2 Trang Đăng Nhập

```
1. Vào: http://localhost:3000/login
2. Nhập email: admin@example.com (hoặc john@example.com)
3. Bấm "Đăng nhập"
4. ✅ Sẽ redirect tới /dashboard
```

### 3.3 Bảng Điều Khiển

```
1. Vào: http://localhost:3000/dashboard
2. Thấy: Chào mừng + menu
3. Nút "Quản lý đơn hàng" (tất cả user)
4. Nút "Quản lý người dùng" (chỉ admin)
```

### 3.4 Quản Lý Đơn Hàng (Orders)

```
1. Vào: http://localhost:3000/orders
2. Xem danh sách order của user hiện tại
3. Bấm "Chỉnh sửa" để thay đổi status
4. Chọn trạng thái mới: pending, approved, rejected, completed
5. Bấm "Lưu" để cập nhật
```

### 3.5 Quản Lý User (Admin Only)

```
1. Login với email: admin@example.com
2. Vào: http://localhost:3000/users
3. Form "Tạo người dùng mới":
   - Nhập thông tin
   - Bấm "Tạo người dùng"
4. Danh sách user:
   - Bấm "Chỉnh sửa" để edit
   - Bấm "Xóa" để xóa user
```

---

## Bước 4: Test API (tuỳ chọn)

### Tạo user mới

```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0999999999"
  }'
```

### Lấy danh sách user (Admin)

```bash
curl http://localhost:3000/api/users/list?adminId=user_1
```

### Tạo order

```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "refuserId": "user_1",
    "voucherCode": "VC999",
    "amount": 500000
  }'
```

### Lấy order của user

```bash
curl http://localhost:3000/api/orders/list?userId=user_1
```

### Cập nhật status order

```bash
curl -X PATCH http://localhost:3000/api/orders/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_1",
    "status": "approved"
  }'
```

---

## 🔐 Test Credentials

Sau khi chạy `/api/seed-data`:

| Email             | Mật khẩu    | Role  |
| ----------------- | ----------- | ----- |
| admin@example.com | (không cần) | admin |
| john@example.com  | (không cần) | user  |

---

## 📊 Database

Dữ liệu được lưu tại:

```
app/data/database.json
```

Bạn có thể mở file này để xem/chỉnh sửa trực tiếp.

---

## 🎯 Checklist Test

### Users Module

- [ ] POST /api/users/create - Tạo user
- [ ] PATCH /api/users/update - Cập nhật user
- [ ] DELETE /api/users/delete - Xóa user
- [ ] GET /api/users/list - Lấy danh sách (admin)
- [ ] GET /api/users/get-by-email - Lấy user theo email

### Orders Module

- [ ] POST /api/orders/create - Tạo order
- [ ] GET /api/orders/list (userId) - Lấy order của user
- [ ] GET /api/orders/list (adminId) - Lấy tất cả order (admin)
- [ ] PATCH /api/orders/update-status - Cập nhật status

### UI Pages

- [ ] `/` - Trang đăng ký
- [ ] `/login` - Trang đăng nhập
- [ ] `/dashboard` - Bảng điều khiển
- [ ] `/orders` - Quản lý đơn hàng
- [ ] `/users` - Quản lý user (admin)

---

## ⚠️ Troubleshooting

### Lỗi: "User not found" khi đăng nhập

**Giải pháp:** Chạy `/api/seed-data` để tạo sample user

### Lỗi: "Cannot read property 'users' of undefined"

**Giải pháp:** Đảm bảo file `app/data/database.json` tồn tại và có format JSON đúng

### Lỗi: localStorage is not defined

**Giải pháp:** Chỉ xảy ra trên server-side, cách này chỉ dùng được trên client (`'use client'`)

### Order không hiển thị

**Kiểm tra:**

1. Đã tạo order với `refuserId` = userId chưa?
2. userId có đúng không?
3. Mở DevTools → Console để kiểm tra logs

---

## 📚 Tài liệu thêm

- [API Documentation](../API_DOCUMENTATION.md)
- [Setup Guide](../SETUP.md)
- [Changes Log](../CHANGES.md)

---

## 💡 Ghi chú

- **MockAPI**: Dữ liệu lưu trong JSON file, sẽ mất nếu xóa file
- **Session**: Dùng localStorage, sẽ mất nếu clear browser data
- **Role System**: Admin = user có email "admin@example.com"
- **n8n Webhook**: Vẫn hoạt động song song (tuỳ chọn sử dụng)

---

## 🚀 Bắt đầu

```bash
# 1. Chạy development server
npm run dev

# 2. Tạo sample data (terminal khác)
curl -X POST http://localhost:3000/api/seed-data

# 3. Mở browser
# http://localhost:3000

# 4. Thử đăng nhập với admin@example.com
# http://localhost:3000/login
```

**Chúc bạn thành công! 🎉**

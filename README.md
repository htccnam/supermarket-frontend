# Supermarket Frontend

Ứng dụng giao diện quản lý siêu thị bằng React, TypeScript và Vite.

## Chạy local

```powershell
npm install
npm run dev
```

Backend mặc định chạy tại `http://localhost:3000`. Có thể cấu hình bằng `VITE_API_URL`.

## Chức năng

- Đăng nhập và phân quyền STAFF/ADMIN.
- POS: tìm sản phẩm, giỏ hàng, thanh toán tiền mặt/thẻ.
- Tra cứu hóa đơn của nhân viên.
- Admin dashboard: sản phẩm, tồn kho, hóa đơn, nhân sự và audit log.
- Build độc lập bằng Docker/Nginx.

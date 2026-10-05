# ⚡ AURA STUDIO - Website Thương Mại Điện Tử Thời Trang Fullstack

> Dự án website thương mại điện tử chuyên về thời trang Streetwear & Unisex cao cấp được xây dựng trọn gói từ Backend kết nối MongoDB, RESTful API đầy đủ, đến Frontend React (Vite) với giao diện hiệu ứng mượt mà, chuyển cảnh sống động chuẩn trải nghiệm mua sắm thực tế.

---

## 🌟 Tính Năng Nổi Bật

### 1. Phía Khách Hàng (Customer Experience)
- **Giao diện & Hiệu ứng đỉnh cao**:
  - Phong cách thiết kế Dark & Cyberpunk hiện đại, kính mờ Glassmorphism, đổ bóng mượt mà.
  - Micro-interactions khi rê chuột, phóng to ảnh, đổi góc nhìn sản phẩm, nút bấm phản hồi tức thì.
  - Pháo hoa chúc mừng Confetti rực rỡ khi hoàn tất đặt hàng.
- **Hero & Lookbook sống động**:
  - Banner thời trang phong cách editorial, bộ sưu tập mùa mới.
  - Đồng hồ đếm ngược Flash Sale thời gian thực (Giờ : Phút : Giây) kèm tính năng 1-click sao chép mã giảm giá.
- **Bộ lọc & Tìm kiếm thông minh**:
  - Lọc theo danh mục: Áo thun, Áo khoác, Sơ mi, Quần & Shorts, Váy & Đầm, Phụ kiện.
  - Lọc kích cỡ (S, M, L, XL, XXL) và thanh kéo khoảng giá trực quan.
  - Sắp xếp: Mới nhất, Bán chạy nhất, Đánh giá cao, Giá tăng/giảm dần.
  - Thanh tìm kiếm gợi ý sản phẩm ngay khi gõ từ khóa.
- **Trang Chi Tiết Sản Phẩm (Product Modal & Details)**:
  - Thư viện ảnh sản phẩm nhiều góc độ, click chuyển ảnh chính.
  - Bảng quy đổi kích cỡ (Size Guide) chuẩn Streetwear theo chiều cao & cân nặng.
  - Chọn màu sắc với bảng màu trực quan (Color Swatches) và chọn size tương ứng.
  - Hệ thống đánh giá & bình luận sao (1-5 sao) trực tiếp từ khách hàng.
- **Giỏ Hàng & Khuyến Mãi (Cart Drawer)**:
  - Thanh trượt giỏ hàng từ cạnh phải (Slide-in Drawer) tiện lợi.
  - Thanh tiến trình Miễn Phí Giao Hàng (Tự động tính số tiền cần mua thêm để được Free Ship).
  - Tăng giảm số lượng sản phẩm, xóa sản phẩm, tính toán giá tự động.
  - Hỗ trợ mã giảm giá (Voucher): `STREETWEAR20` (Giảm 20%), `FREESHIP` (Miễn phí ship), `VIP50K` (Giảm 50k).
- **Quy Trình Thanh Toán Chuyên Nghiệp (Checkout Flow)**:
  - Bước 1: Nhập thông tin người nhận hàng, địa chỉ, phương thức vận chuyển (Tiêu chuẩn / Hỏa tốc 2H).
  - Bước 2: Phương thức thanh toán linh hoạt:
    - **COD**: Thanh toán tiền mặt khi nhận hàng.
    - **VietQR**: Quét mã QR ngân hàng thanh toán tức thì mô phỏng thực tế.
    - **Thẻ Tín Dụng / Ghi Nợ**: Cổng thẻ quốc tế Visa / Mastercard.
  - Bước 3: Màn hình đặt hàng thành công, hiển thị **Mã Đơn Hàng (Order Code)** dạng `AURA-XXXXXX`.
- **Tra Cứu Tiến Độ Đơn Hàng (Order Tracking)**:
  - Khách hàng có thể nhập mã đơn hàng bất kỳ để xem sơ đồ tiến trình giao hàng theo thời gian thực (Đã đặt -> Đang đóng gói -> Đang giao hàng -> Giao thành công).
- **Hệ Thống Yêu Thích (Wishlist)**:
  - Lưu các mẫu trang phục yêu thích chỉ với 1 click vào biểu tượng trái tim.

---

### 2. Phía Quản Trị Viên (Admin Store Dashboard)
- **Báo cáo doanh thu & Đơn hàng**:
  - Thống kê tổng doanh thu thực tế, số lượng đơn hàng, số khách hàng đã đăng ký.
- **Quản lý sản phẩm (Product CRUD)**:
  - Thêm sản phẩm mới (tên, danh mục, giá bán, giá gốc, link ảnh, số lượng kho, mô tả).
  - Xóa sản phẩm trực tiếp khỏi cơ sở dữ liệu MongoDB.
- **Quản lý đơn hàng (Order Management)**:
  - Xem danh sách toàn bộ đơn hàng khách đã đặt.
  - Cập nhật trạng thái đơn hàng (Chờ xác nhận ➔ Đang đóng gói ➔ Đang giao ➔ Giao thành công ➔ Hủy đơn).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**:
  - React 19 (Vite)
  - Vanilla Modern CSS (CSS Variables, Glassmorphism, Keyframes Animation)
  - Lucide React (Bộ icon hiện đại)
  - Canvas Confetti (Hiệu ứng pháo hoa đặt hàng)
- **Backend**:
  - Node.js & Express.js (RESTful API Architecture)
  - Mongoose & MongoDB (Hỗ trợ cả MongoDB Atlas, MongoDB Local và tự động bật MongoMemoryServer nếu máy chưa cài sẵn MongoDB)
  - JWT (JSON Web Token) & Bcryptjs (Mã hóa mật khẩu bảo mật)
  - CORS, Dotenv

---

## 🔑 Tài Khoản Dùng Thử Nhanh (1-Click Demo)

Tại modal Đăng nhập, hệ thống đã trang bị sẵn **2 nút 1-Click** để bạn đăng nhập thử nghiệm ngay lập tức mà không cần gõ phím:

| Loại tài khoản | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@streetwear.vn` | `admin123` | Toàn quyền xem Dashboard, quản lý sản phẩm, đơn hàng |
| **Khách hàng (Customer)** | `khachhang@gmail.com` | `user123` | Mua hàng, xem lịch sử đơn, viết đánh giá, lưu wishlist |

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án

### 1. Khởi chạy Backend (Port 5000):
```bash
cd server
npm run dev
```

### 2. Khởi chạy Frontend (Port 3000):
```bash
cd client
npm run dev
```

Sau đó mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## 🗄️ Cấu Hình Kết Nối Cơ Sở Dữ Liệu & Biến Môi Trường (.env)

Hệ thống hỗ trợ cả MongoDB Atlas Cloud, MongoDB Local, và tự động kích hoạt MongoMemoryServer nội bộ nếu chưa có database để app luôn chạy được ngay khi khởi động.

### Hướng dẫn cấu hình:
1. Sao chép file mẫu `server/.env.example` thành `server/.env`:
   ```bash
   cd server
   cp .env.example .env   # hoặc copy trên Windows
   ```
2. Điền chuỗi kết nối và các khóa bí mật của bạn vào `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/clothing_store
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
   ADMIN_SECRET_KEY=your_secure_random_admin_access_key
   CLIENT_URL=http://localhost:3000
   ```
3. Khởi động lại server để nạp cấu hình mới.

> **LƯU Ý AN NINH**: Tuyệt đối **không commit file `.env` lên GitHub**. File này đã được thêm vào `.gitignore` để bảo vệ tài khoản và cơ sở dữ liệu của bạn.

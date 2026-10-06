# ⚡ AURA STUDIO - Website Thương Mại Điện Tử Thời Trang Fullstack (Production-Grade)

> Hệ thống website thương mại điện tử chuyên về thời trang Streetwear & Unisex cao cấp được xây dựng kiến trúc Fullstack hiện đại: **Frontend React (Vite)** giao diện Dark/Cyberpunk mượt mà, **Backend Node.js & Express RESTful API**, kết nối 100% **Cloud Database MongoDB Atlas** thực tế, tích hợp cổng thanh toán **MoMo & VNPay**, cổng hỗ trợ **Ticket & Live Chat**, trang **Tài khoản cá nhân (Customer Portal)** toàn diện và trang **Quản trị hệ thống (Admin Portal)** chuyên sâu.

---

## 🌟 Tổng Quan Tính Năng Hệ Thống

### 1. Phía Khách Hàng (Customer Experience)
- **Giao diện & Trải nghiệm đỉnh cao**:
  - Phong cách thiết kế Dark & Cyberpunk hiện đại, kính mờ Glassmorphism, đổ bóng mượt mà.
  - Micro-interactions khi rê chuột, chuyển ảnh đa góc nhìn, phóng to chi tiết sản phẩm.
  - Pháo hoa chúc mừng Confetti rực rỡ khi hoàn tất đặt hàng thành công.
- **Hero & Lookbook sống động**:
  - Banner thời trang phong cách editorial, bộ sưu tập giới hạn mùa mới.
  - Đồng hồ đếm ngược Flash Sale thời gian thực (Giờ : Phút : Giây) kèm tính năng 1-click sao chép mã giảm giá.
- **Bộ lọc & Tìm kiếm thông minh**:
  - Lọc theo danh mục: Áo thun, Áo khoác, Sơ mi, Quần & Shorts, Váy & Đầm, Phụ kiện.
  - Lọc kích cỡ (S, M, L, XL, XXL) và thanh kéo khoảng giá trực quan.
  - Sắp xếp: Mới nhất, Bán chạy nhất, Đánh giá cao, Giá tăng/giảm dần.
  - Thanh tìm kiếm gợi ý sản phẩm ngay khi gõ từ khóa.
- **Trang Chi Tiết Sản Phẩm (Product Details)**:
  - Thư viện ảnh sản phẩm nhiều góc độ, click chuyển ảnh chính tức thì.
  - Bảng quy đổi kích cỡ (Size Guide) chuẩn Streetwear theo chiều cao & cân nặng.
  - Chọn màu sắc với bảng màu trực quan (Color Swatches) và chọn size tương ứng.
  - Hệ thống đánh giá & bình luận sao (1-5 sao) kèm hình ảnh phản hồi thực tế từ khách hàng đã mua.
- **Giỏ Hàng & Khuyến Mãi (Cart Drawer)**:
  - Thanh trượt giỏ hàng từ cạnh phải (Slide-in Drawer) tiện lợi.
  - Thanh tiến trình Miễn Phí Giao Hàng (Tự động tính số tiền cần mua thêm để được Free Ship).
  - Tăng giảm số lượng sản phẩm, xóa sản phẩm, tính toán giá tự động.
  - Hỗ trợ mã giảm giá (Voucher): `STREETWEAR20` (Giảm 20%), `FREESHIP` (Miễn phí ship), `VIP50K` (Giảm 50k).
- **Quy Trình Đặt Hàng & Thanh Toán Đa Kênh (Checkout Flow)**:
  - Bước 1: Thông tin người nhận hàng — **Tự động điền theo Địa chỉ mặc định** đã cập nhật trong tài khoản cá nhân, kèm thanh chọn nhanh các địa chỉ đã lưu trong sổ địa chỉ.
  - Bước 2: Phương thức thanh toán linh hoạt:
    - **MoMo**: Tích hợp cổng thanh toán MoMo Sandbox QR/ATM chuẩn chữ ký điện tử HMAC-SHA256.
    - **VNPay**: Tích hợp cổng thanh toán VNPAY-QR với thuật toán mã hóa kiểm thử HMAC-SHA512.
    - **COD**: Thanh toán tiền mặt khi nhận hàng.
  - Bước 3: Đặt hàng thành công, cấp **Mã Đơn Hàng (Order Code)** định dạng `AURA-XXXXXX`.
- **Tra Cứu Đơn Hàng Nhanh Chóng (Order Tracking)**:
  - Khách hàng có thể nhập mã đơn hàng bất kỳ để xem sơ đồ tiến trình giao hàng theo thời gian thực (Đã đặt ➔ Đang xử lý ➔ Đang giao hàng ➔ Giao thành công).
- **Thông Báo Nổi Thông Minh Hẹn Giờ Tự Tắt (Smart Notification Alerts)**:
  - Tự động nhận diện sản phẩm trong giỏ hàng và danh sách yêu thích để thông báo: *"Sản phẩm bạn yêu thích vừa giảm 20%"* hoặc *"Size M sắp hết hàng"*.
  - Tích hợp thanh thời gian đếm ngược (Countdown bar) và tự động tắt sau 5 giây.

---

### 2. Trang Tài Khoản Cá Nhân Toàn Diện (Customer Account Portal)
Modal tài khoản cá nhân được tối ưu hóa với 7 phân hệ:
1. **Hồ sơ của tôi**: Cập nhật Họ và tên, Email, Số điện thoại, Ngày sinh, Giới tính, Ảnh đại diện (Avatar).
2. **Sổ địa chỉ nhận hàng (Address Book)**:
   - Danh sách địa chỉ đã lưu.
   - Thêm địa chỉ mới, Chỉnh sửa, Xóa địa chỉ.
   - Thiết lập một địa chỉ làm **Địa chỉ mặc định** (tự động áp dụng khi đặt hàng).
3. **Đơn hàng của tôi**:
   - Phân loại trạng thái: Tất cả, Chờ xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy, Hoàn tiền.
   - Hỗ trợ **Khách hàng tự hủy đơn** khi đơn còn ở trạng thái "Chờ xác nhận" (tự động hoàn tồn kho và hoàn voucher).
4. **Đánh giá của tôi (Reviews)**:
   - Tab "Chưa đánh giá": Danh sách các sản phẩm thuộc đơn hàng `Đã giao` chờ khách đánh giá.
   - Tab "Đã đánh giá": Lịch sử các nhận xét đã gửi.
   - Cho phép chấm điểm 1-5 sao, viết nhận xét và **tải ảnh sản phẩm thực tế** lên đánh giá.
5. **Kho Voucher của tôi**:
   - Phân loại: Voucher khả dụng, Voucher đã dùng, Voucher hết hạn.
   - Nút 1-click sao chép mã voucher nhanh chóng.
6. **Sản phẩm yêu thích (Wishlist)**:
   - Quản lý các mẫu đồ đã thích kèm nút thêm nhanh vào giỏ hàng.
7. **Bảo mật & Thiết bị đăng nhập**:
   - Đổi mật khẩu tài khoản (xác minh mật khẩu hiện tại, mã hóa Bcrypt).
   - Danh sách thiết bị đăng nhập đang hoạt động.
   - **Đăng xuất khỏi tất cả thiết bị**: Vô hiệu hóa ngay lập tức token của mọi phiên đăng nhập khác thông qua Token Versioning.

---

### 3. Cổng Hỗ Trợ Khách Hàng / FAQ / CSKH (`/support`)
- **Câu hỏi thường gặp (FAQ Accordion)**: Giải đáp chi tiết các chính sách đổi hàng 30 ngày, hoàn tiền, thời gian giao hàng, quy định đồng kiểm hàng, hướng dẫn chọn size, bảo hành 6 tháng.
- **Gửi Yêu Cầu Hỗ Trợ & Tạo Ticket**: Khách hàng điền form hỗ trợ sẽ nhận được mã vé hỗ trợ tự động (Ví dụ: `#TK-305265`) được lưu trực tiếp vào cơ sở dữ liệu.
- **Tra Cứu Ticket**: Tra cứu tiến độ xử lý và phản hồi từ nhân viên chăm sóc khách hàng bằng mã Ticket.
- **Trợ Lý Ảo / Live Chat Bot**: Chatbot AI trả lời tự động 24/7 về chọn size, giao nhận và chính sách đổi trả.

---

### 4. Hệ Thống Quản Trị Hệ Thống Chuyên Sâu (Admin Portal — `/admin`)
Hệ thống quản trị riêng biệt dành cho Admin tại đường dẫn `/admin`:
- **Dashboard & Phân tích kinh doanh**:
  - Thống kê doanh thu hôm nay, doanh thu tháng, tổng số đơn, đơn chờ xử lý, số lượng user, tỷ lệ chuyển đổi (Conversion Rate).
  - Biểu đồ phân bổ doanh thu theo danh mục và danh sách Top sản phẩm bán chạy nhất.
- **Quản lý Sản phẩm & Biến thể (Variants CRUD)**:
  - Thêm, sửa, xóa, ẩn/hiện sản phẩm.
  - Quản lý chi tiết biến thể: Kích thước (S, M, L, XL, XXL), Màu sắc, SKU, Chất liệu, Giá bán, Giá sale, Tồn kho.
- **Quản lý Đơn hàng (Order Hub)**:
  - Tìm kiếm, lọc theo trạng thái đơn hàng.
  - Cập nhật trạng thái đơn: Xác nhận, Đang giao, Đã giao, Hủy đơn, Hoàn tiền (Refund).
  - **In Hóa Đơn (Printable Invoice)**: Giao diện hóa đơn bán hàng chuyên nghiệp kèm mã QR, danh sách mặt hàng, sẵn sàng in hoặc xuất PDF.
  - Tự động hoàn lại số lượng tồn kho và hoàn lại lượt sử dụng Voucher khi đơn bị hủy hoặc hoàn tiền.
- **Quản lý Khách hàng (Customers)**:
  - Danh sách người dùng, tìm kiếm theo tên, email, SĐT.
  - Thống kê tổng số đơn hàng và tổng số tiền đã chi tiêu của từng khách hàng.
  - Khóa tài khoản (Ban/Unban) và Đặt lại mật khẩu (Reset password) cho tài khoản.
- **Quản lý Khuyến mãi & Coupon**:
  - Tạo mới mã coupon: Giảm theo %, Giảm tiền mặt, Miễn phí vận chuyển (Freeship), Giá trị đơn tối thiểu, Giảm tối đa, Giới hạn lượt dùng toàn sàn, Giới hạn lượt dùng mỗi người, Ngày bắt đầu/kết thúc.
  - Bật/tắt trạng thái kích hoạt mã.
  - Hoàn lượt sử dụng mã thủ công khi cần.
- **Quản lý Tồn kho (Inventory Tracking)**:
  - Theo dõi số lượng tồn kho từng sản phẩm theo thời gian thực.
  - Cảnh báo các mặt hàng sắp hết (`Kho <= 5`) hoặc đã hết hàng.
  - Nút nhập hàng nhanh (Quick Restock) cập nhật trực tiếp vào database.
- **Quản lý Đánh giá (Reviews Management)**:
  - Duyệt, ẩn hoặc xóa nhận xét của khách hàng.
- **Bàn Hỗ Trợ CSKH (Support Desk)**:
  - Quản lý danh sách Ticket khiếu nại của khách hàng.
  - Nhân viên/Admin trả lời trực tiếp vào Ticket và chuyển trạng thái hoàn tất (`Resolved`).

---

### 5. Kiến Trúc An Ninh & Bảo Mật Tuyệt Đối (Security Hardening)
- **Bảo Vệ Bí Mật (No Secrets in Code)**: Toàn bộ khóa bảo mật (JWT Secret, API Key, Database URI, MoMo/VNPay credentials) được lưu trong file `.env` được bảo vệ bằng `.gitignore`, tuyệt đối không lọt vào Git history.
- **Ẩn Đường Dẫn Admin (Stealth Cloaking)**: Các API quản trị viên và route admin trả về mã lỗi `404 Not Found` ngụy trang đối với các truy cập trái phép không có Token quyền Admin.
- **Hệ Thống Khiên Chắn Chống Tấn Công (Security Shield)**:
  - **Rate Limiting**: Giới hạn tần suất gửi request chống spam và brute-force.
  - **Honeypot WAF**: Bẫy và chặn IP các bot tự động dò quét các file nhạy cảm (`/wp-admin`, `/.env`, `/phpmyadmin`).
  - **Sanitize Input**: Ngăn chặn tấn công NoSQL Injection và XSS.
  - **Token Versioning**: Thu hồi quyền truy cập tức thì khi đổi mật khẩu hoặc bấm đăng xuất khỏi tất cả thiết bị.
  - **Bảo Vệ Giao Diện**: Vô hiệu hóa mở DevTools phím tắt, chặn sao chép nội dung trái phép.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**:
  - React 19 (Vite)
  - Vanilla Modern CSS (Design Tokens, Glassmorphism, Micro-animations)
  - Lucide React (Bộ biểu tượng hiện đại)
  - Canvas Confetti (Hiệu ứng pháo hoa ăn mừng)
- **Backend**:
  - Node.js & Express.js (Kiến trúc RESTful API chuẩn Enterprise)
  - Mongoose & MongoDB Atlas (Cơ sở dữ liệu đám mây đồng bộ 100% dữ liệu thực tế)
  - JWT (JSON Web Token) & Bcryptjs (Bảo mật tài khoản đa lớp)
  - Crypto HMAC-SHA256 & HMAC-SHA512 (Xác thực chữ ký cổng thanh toán)

---

## 🔑 Tài Khoản Đăng Nhập Hệ Thống

| Loại tài khoản | Email | Mật khẩu | Quyền hạn & Tính năng |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@streetwear.vn` | `admin123` | Toàn quyền trang Quản trị `/admin`, duyệt đơn, quản lý kho, coupon, user |
| **Khách hàng (Customer)** | `khachhang@gmail.com` | `user123` | Mua hàng, xem lịch sử đơn hàng đã giao, đánh giá sản phẩm |
| **Khách hàng (Đã có địa chỉ)** | `khachhang@aura.vn` | `Password123@` | Đã lưu sẵn sổ địa chỉ, trải nghiệm tự động điền form thanh toán |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt các thư viện phụ thuộc:
```bash
# Cài đặt cho Backend
cd server
npm install

# Cài đặt cho Frontend
cd ../client
npm install
```

### 2. Cấu hình biến môi trường:
Tạo file `server/.env` dựa trên file mẫu `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.bol8qel.mongodb.net/clothing_store?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long
ADMIN_SECRET_KEY=your_secure_stealth_admin_access_key
CLIENT_URL=http://localhost:3000

# Cổng thanh toán MoMo Sandbox
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_API_URL=https://test-payment.momo.vn/gw_payment/transactionProcessor

# Cổng thanh toán VNPay Sandbox
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### 3. Khởi chạy dự án:

- **Khởi chạy Backend (Port 5000)**:
  ```bash
  cd server
  npm run dev
  ```
- **Khởi chạy Frontend (Port 3000)**:
  ```bash
  cd client
  npm run dev
  ```

Mở trình duyệt truy cập:
* 🛍️ **Cửa hàng:** [http://localhost:3000](http://localhost:3000)
* ⚙️ **Trang Quản Trị:** [http://localhost:3000/admin](http://localhost:3000/admin)
* 📚 **API Dashboard:** [http://localhost:5000](http://localhost:5000)

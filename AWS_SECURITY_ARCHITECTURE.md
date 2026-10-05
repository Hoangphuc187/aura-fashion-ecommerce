# 🛡️ AURA STUDIO • KIẾN TRÚC BẢO MẬT & VẬN HÀNH PRODUCTION CLOUD (AWS)
> **Tài liệu Kỹ thuật dành cho Senior Backend Engineer, Security Engineer & Cloud Architect**  
> Thiết kế đáp ứng tiêu chuẩn an toàn cao nhất, tối ưu chi phí và sẵn sàng triển khai thực tế (Production-Ready).

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (ARCHITECTURE OVERVIEW)

```
[ Người Dùng & Web Client ] 
           │
           ▼
[ AWS CloudFront (CDN + Edge Caching + SSL Termination) ]
           │
           ├──▶ [ AWS WAF (Web Application Firewall) ]
           │      • OWASP Top 10 Rules
           │      • Amazon IP Reputation List (Anti-Bot & Scanner)
           │      • Rate-based Rules (Chống DDoS & Brute-force)
           │
           ▼
[ Application Load Balancer (ALB) - Public Subnet ]
           │
           ▼ (HTTPS / Private VPC Peering)
[ AWS ECS Fargate / EC2 Docker Containers - Private Subnet ]
     (Node.js Express API • AURA Security Shield WAF)
           │
   ┌───────┴───────────────────────────┐
   ▼                                   ▼
[ AWS S3 Private Bucket ]    [ MongoDB Atlas Cluster ]
   • CloudFront OAC             • AWS PrivateLink / VPC Peering
   • SSE-KMS Encryption        • IP Whitelist Strict
   • Block Public Access       • IAM Authentication
```

---

## 2. QUẢN TRỊ SECRET, PASSWORD & API KEY (ZERO HARDCODED SECRETS)

### A. Ngăn Chặn Rò Rỉ Secret trên Source Code & Git
1. **Loại bỏ hoàn toàn `.env` khỏi Git**:
   - File `.gitignore` đã chặn toàn bộ `.env`, `.env.*`, `*.pem`, `*.key`.
   - Cung cấp file `.env.example` làm mẫu cấu hình mà không chứa bất kỳ secret thật nào.
2. **Kiểm tra Startup Pre-Flight (`envValidator.js`)**:
   - Khi khởi động trên Production (`NODE_ENV=production`), hệ thống tự động kiểm tra `JWT_SECRET`, `ADMIN_SECRET_KEY`, `MONGODB_URI`.
   - Nếu phát hiện thiếu secret hoặc secret quá ngắn (< 24 ký tự), máy chủ **tự động dừng ngay lập tức** để tránh chạy với cấu hình không an toàn.
3. **Quản trị Secret trên AWS**:
   - **AWS Systems Manager (SSM) Parameter Store (SecureString)** hoặc **AWS Secrets Manager**:
     - Lưu trữ `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SECRET_KEY`.
     - Tự động mã hóa bằng **AWS KMS** (Key Management Service).
     - Trong ECS Fargate task definition, secret được inject trực tiếp vào container environment lúc khởi động thông qua IAM Role, **không bao giờ lưu thành file tĩnh trên ổ đĩa**.

---

## 3. BẢO MẬT TÀI KHOẢN, MẬT KHẨU & CHỐNG DÒ QUÉT (AUTHENTICATION & RATE LIMITING)

### A. Mã Hóa Mật Khẩu
- Sử dụng thuật toán **Bcrypt** với `saltRounds = 10`.
- Kiểm tra tính hợp lệ của mật khẩu: Tối thiểu 8 ký tự, bắt buộc có cả chữ cái và chữ số.

### B. Chống Dò Tài Khoản & Mật Khẩu (Anti-Brute-Force & Anti-Enumeration)
1. **Thông Báo Đăng Nhập Đồng Nhất**:
   - Khi đăng nhập sai (dù email không tồn tại hay sai mật khẩu), API luôn trả về:
     `"Email hoặc mật khẩu không chính xác"`
   - Kẻ tấn công không thể dò biết email nào đã đăng ký trong hệ thống.
2. **Khóa Tài Khoản Thông Minh (Lockout Policy)**:
   - Nhập sai mật khẩu liên tiếp **5 lần** -> Tài khoản tự động **tạm khóa 5 phút**.
   - Phản hồi mã lỗi `423 Locked` kèm thời gian chờ còn lại.
3. **Rate Limiting Đa Tầng**:
   - **Tầng Xác Thực (`/api/auth/*`)**: Giới hạn tối đa **10 requests/phút** trên mỗi địa chỉ IP (`authRateLimiter`).
   - **Tầng API Chung (`/api/*`)**: Giới hạn tối đa **150 requests/phút** trên mỗi địa chỉ IP (`apiRateLimiter`).
   - Vượt ngưỡng gấp đôi -> Hệ thống WAF tự động đưa IP vào Blacklist chặn ngay lập tức.
4. **Bảo Mật OTP Quên Mật Khẩu**:
   - Mã OTP 6 chữ số ngẫu nhiên, hiệu lực 10 phút.
   - **Tuyệt đối không gửi OTP trong JSON Response** về trình duyệt.
   - Trong môi trường Production, OTP được gửi an toàn qua Email (AWS SES).

---

## 4. CHỐNG INJECTION, REGEX DOS (ReDoS) & XSS

1. **NoSQL Injection Defense (`sanitizeInput`)**:
   - Tự động duyệt đệ quy toàn bộ `req.body`, `req.query`, `req.params`.
   - Loại bỏ triệt để các toán tử MongoDB chứa ký tự `$` (ví dụ `$gt`, `$ne`, `$where`) hoặc `.` trước khi chuyển đến Mongoose.
2. **ReDoS Protection (`escapeRegex`)**:
   - Các chuỗi tìm kiếm từ người dùng (`keyword`, `tag`) đều được làm sạch qua hàm `escapeRegex()`, vô hiệu hóa các ký tự điều khiển Regex nguy hiểm.
3. **Stored & Reflected XSS Neutralization**:
   - Tự động lọc bỏ các thẻ `<script>` và giao thức `javascript:` độc hại trong dữ liệu đầu vào.
4. **Giới Hạn Kích Thước Payload (Anti-DoS)**:
   - Cấu hình `express.json({ limit: '1mb' })` nhằm chặn đứng các cuộc tấn công gửi body dung lượng lớn gây tràn bộ nhớ (Out-Of-Memory).

---

## 5. PHÂN QUYỀN CHẶT CHẼ (RBAC) & CHỐNG IDOR

1. **Kiểm Soát Quyền Theo Đối Tượng (IDOR Defense)**:
   - API `GET /api/orders/:id`: Chỉ cho phép chủ sở hữu đơn hàng (so khớp `user._id`) hoặc Quản trị viên (`role === 'admin'`) truy cập. Khách vãng lai bắt buộc phải cung cấp số điện thoại đặt hàng khớp với đơn.
2. **Chống Leo Thang Quyền Hạn (Privilege Escalation)**:
   - Endpoint đăng ký tài khoản (`/register`) và OAuth (`/oauth`) bắt buộc gán `role = 'customer'`.
   - API cập nhật hồ sơ (`updateProfile`) không cho phép người dùng tự sửa đổi `role`.
3. **Ngụy Trang Ẩn Tuyến Quản Trị (Stealth 404 Cloaking)**:
   - Toàn bộ API Quản trị (`/api/dashboard/*`, Admin Product APIs, Admin Order APIs) và trang Portal bí mật (`/admin-portal`) nếu không có Token Admin hợp lệ sẽ phản hồi **404 Not Found** (thay vì 401 hoặc 403).
   - Các công cụ quét lỗ hổng tự động (Gobuster, ffuf, DirBuster, Nikto) sẽ phân loại các đường dẫn này là không tồn tại.

---

## 6. WAF NỘI BỘ & BẪY HONEYPOT TỰ ĐỘNG

1. **Bẫy Honeypot Độc Quyền (`honeypotShield`)**:
   - Lập bẫy các đường dẫn thường bị bot quét như `/.env`, `/.git`, `/wp-admin`, `/phpmyadmin`, `/.aws/credentials`, v.v.
   - Bất kỳ IP nào chạm vào bẫy sẽ bị **WAF đưa vào danh sách đen và khóa kết nối 24 giờ**.
2. **Nhận Diện Scanner User-Agents**:
   - Tự động nhận diện chữ ký của các công cụ thâm nhập như `sqlmap`, `nmap`, `gobuster`, `nikto`, `wpscan` và ngắt kết nối lập tức.
3. **Anti-Directory Fuzzing**:
   - Hệ thống theo dõi số lượng lỗi 404 liên tiếp từ mỗi IP. Nếu vượt quá 8 lỗi 404 trong vòng 30 giây -> Tự động kích hoạt khóa IP 2 giờ.

---

## 7. BẢO MẬT TRÊN ĐÁM MÂY AWS (AWS PRODUCTION BEST PRACTICES)

### A. AWS IAM (Identity & Access Management)
- **Tuyệt đối không dùng root account** cho các tác vụ hàng ngày.
- **Không tạo Access Key ID / Secret Access Key dài hạn**: Thay vào đó, gán **IAM Task Role** cho container ECS Fargate với quyền tối thiểu (Least Privilege).
  - Quyền đọc Secret trong SSM Parameter Store / Secrets Manager.
  - Quyền ghi ảnh lên S3 Bucket cụ thể.
  - Quyền gửi log vào CloudWatch Logs.

### B. AWS S3 & CloudFront Media Security
1. **S3 Bucket Private**:
   - Bật **Block All Public Access** (100% tài nguyên ảnh không thể truy cập trực tiếp từ Internet).
   - Kích hoạt mã hóa lưu trữ **Server-Side Encryption (SSE-KMS)**.
2. **CloudFront Origin Access Control (OAC)**:
   - Người dùng chỉ tải ảnh thông qua CDN CloudFront.
   - CloudFront xác thực với S3 qua OAC, vừa tăng tốc độ tải trang toàn cầu vừa bảo vệ bucket gốc.
3. **Upload An Toàn Bằng Presigned URL**:
   - Khi Admin cần upload ảnh sản phẩm mới:
     - Client gọi API Backend để xin một **S3 Presigned PUT URL** có thời gian hết hạn ngắn (5 phút).
     - Client upload trực tiếp lên S3 qua URL này.
     - Backend không phải làm trung gian trung chuyển file lớn, tiết kiệm 100% băng thông server.

### C. AWS WAF & CloudWatch Monitoring
1. **AWS WAF Web ACL**:
   - Đặt trước CloudFront hoặc Application Load Balancer (ALB).
   - Tích hợp bộ quy tắc chuẩn của Amazon:
     - `AWSManagedRulesCommonRuleSet` (OWASP Top 10).
     - `AWSManagedRulesKnownBadInputsRuleSet` (Chống injection, Log4j, buffer overflow).
     - `AWSManagedRulesAmazonIpReputationList` (Chặn IP spam, botnet, proxy độc hại đã biết).
2. **Giám Sát & Cảnh Báo (AWS CloudWatch + Alarms)**:
   - Đẩy toàn bộ audit log và error log từ Node.js vào CloudWatch Logs.
   - Thiết lập Alarm gửi thông báo Telegram / Email (qua AWS SNS) khi:
     - Tỷ lệ lỗi 5xx vượt quá 1% trong 5 phút.
     - Số lượng request 429 (Rate Limit) tăng đột biến.
     - Số lượng IP bị WAF chặn tăng vọt (Dấu hiệu bị tấn công DDoS / Scan).

---

## 8. DANH SÁCH KIỂM TRA ĐÃ THỰC HIỆN TRÊN SOURCE CODE

| Thành Phần | Tình Trạng Trước Audit | Giải Pháp Đã Triển Khai (Hardened) | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **Secrets & Env** | Fallback secret hardcode | `validateEnv()` chặn startup nếu thiếu secret, `.env.example` chuẩn hóa | ✅ PASS |
| **Password Hash** | Bcrypt cơ bản | Bổ sung kiểm tra độ phức tạp, guard empty password | ✅ PASS |
| **Chống Dò Email** | Báo rõ "Email chưa đăng ký" | Chuẩn hóa thông báo lỗi đồng nhất, che giấu sự tồn tại tài khoản | ✅ PASS |
| **Khóa Tài Khoản** | Chưa hoàn thiện | Tự động tạm khóa 5 phút khi sai mật khẩu 5 lần, audit log chi tiết | ✅ PASS |
| **Lộ OTP Reset** | Trả OTP về response JSON | Bỏ hoàn toàn OTP khỏi response, dispatch an toàn | ✅ PASS |
| **Rate Limiting** | Chưa có rate limit | Tích hợp Sliding Window (10 req/phút cho Auth, 150 req/phút cho API) | ✅ PASS |
| **NoSQL Injection** | Chưa sanitize query | Tự động loại bỏ `$`, `.` và ký tự điều khiển trong request body/query | ✅ PASS |
| **ReDoS Injection** | Regex chưa escape | Sử dụng `escapeRegex()` bảo vệ tìm kiếm sản phẩm | ✅ PASS |
| **Chống IDOR** | Đơn hàng xem tự do theo ID | Kiểm tra quyền sở hữu đơn hàng (User / Admin / Phone verification) | ✅ PASS |
| **Stealth Admin** | Dễ bị scan | Ngụy trang 404 hoàn toàn cho mọi route admin khi chưa xác thực | ✅ PASS |
| **Honeypot WAF** | Cơ bản | Khóa tự động IP quét `.env`, `wp-admin`, bot User-Agents | ✅ PASS |
| **Security Headers** | Cơ bản | Bổ sung HSTS, nosniff, SAMEORIGIN, CSP, Permissions-Policy | ✅ PASS |
| **CORS Policy** | Cho phép localhost rộng | Kiểm soát nghiêm ngặt theo môi trường production/development | ✅ PASS |
| **Error Handling** | Có thể lộ stack trace | Che giấu toàn bộ chi tiết lỗi nội bộ trên môi trường production | ✅ PASS |

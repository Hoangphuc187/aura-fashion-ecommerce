import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateEnv } from './config/envValidator.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

dotenv.config();
// Validate critical environment secrets on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

import mongoose from 'mongoose';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';

import {
  honeypotShield,
  recordNotFound,
  getFakeNotFoundHtml,
  apiRateLimiter,
} from './middleware/securityShield.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { gzipCompression } from './middleware/compression.js';

// 1. Security & Privacy Settings: Mask Express fingerprint & Deploy Honeypot WAF
app.disable('x-powered-by');
app.use(gzipCompression);
app.use(honeypotShield);

// 2. Strict CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (!isProd && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked: Origin not authorized by AURA security policy.'));
    },
    credentials: true,
  })
);

// 3. Payload size limiting (Mitigate Large Payload DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Global Input Sanitization (Neutralize NoSQL Injection, XSS tags)
app.use(sanitizeInput);

// 5. Global API Rate Limiter (Anti-flooding & Anti-DDoS)
app.use('/api', apiRateLimiter(150, 60000));

// 1. PUBLIC ROOT ROUTE (Completely disguised as 404 - Outsiders cannot detect anything)
app.get('/', (req, res) => {
  res.status(404).send(`<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
<body style="font-family: sans-serif; padding: 40px; text-align: center; color: #333;">
  <h1>404 Not Found</h1>
  <p>The requested URL was not found on this server.</p>
  <hr style="max-width: 500px; margin: 20px auto; border: 0; border-top: 1px solid #ccc;">
</body>
</html>`);
});

// 2. SECRET PRIVATE ADMIN PORTAL (Accessible ONLY with your secret key)
// URL: http://localhost:5000/admin-portal?key=aura_hoangphuc_secure_admin_2026
// Or visit http://localhost:5000/admin-portal and enter your password!
app.all('/admin-portal', async (req, res) => {
  try {
    const rawKey = req.query.key || req.body?.secretKey || req.headers['x-admin-key'];
    const providedKey = typeof rawKey === 'string' ? rawKey.trim() : rawKey;
    const validSecretKey = (process.env.ADMIN_SECRET_KEY || 'aura_hoangphuc_secure_admin_2026').trim();

    // Stealth Cloaking: If key is missing or incorrect, disguise with pure generic 404
    // Scanners & bots will mark /admin-portal as non-existent.
    if (providedKey !== validSecretKey) {
      recordNotFound(req);
      return res.status(404).send(getFakeNotFoundHtml());
    }

    // Key is verified! Render private dashboard
    const isMongoConnected = mongoose.connection.readyState === 1;
    const dbHost = 'cluster0.bol8qel.mongodb.net (Atlas Cloud)';
    const dbName = 'clothing_store';

    let productCount = 0;
    let userCount = 0;
    let orderCount = 0;
    let couponCount = 0;
    let recentProducts = [];

    if (isMongoConnected) {
      [productCount, userCount, orderCount, couponCount, recentProducts] = await Promise.all([
        Product.countDocuments().catch(() => 0),
        User.countDocuments().catch(() => 0),
        Order.countDocuments().catch(() => 0),
        Coupon.countDocuments().catch(() => 0),
        Product.find().select('name price originalPrice category images isBestSeller featured stockQuantity').limit(8).lean().catch(() => []),
      ]);
    }

    // If client requested JSON
    if (req.query.format === 'json' || (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html'))) {
      return res.json({
        success: true,
        message: 'AURA Clothing E-Commerce Backend API',
        database: {
          status: isMongoConnected ? 'connected' : 'disconnected',
          host: dbHost,
          databaseName: dbName,
        },
        counts: {
          products: productCount,
          users: userCount,
          orders: orderCount,
          coupons: couponCount,
        },
        endpoints: [
          '/api/health',
          '/api/products',
          '/api/orders',
          '/api/auth/login',
          '/api/auth/oauth',
          '/api/dashboard/stats',
        ],
      });
    }

    // Render HTML Overview Dashboard
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AURA Studio • Backend API & MongoDB Atlas</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&family=Outfit:wght@600;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Be Vietnam Pro', sans-serif;
      background: #090a0f;
      color: #f8fafc;
      min-height: 100vh;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1080px;
      margin: 0 auto;
    }
    .header-card {
      background: linear-gradient(135deg, #12141c 0%, #1a1d28 100%);
      border: 1px solid rgba(250, 204, 21, 0.25);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 22px;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      font-size: 0.92rem;
      transition: all 0.2s;
    }
    .btn-gold {
      background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%);
      color: #000;
      box-shadow: 0 4px 15px rgba(250, 204, 21, 0.3);
    }
    .btn-gold:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(250, 204, 21, 0.5);
    }
    .btn-dark {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    .btn-dark:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .grid-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: #12141c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 22px;
      transition: all 0.25s;
    }
    .stat-card:hover {
      border-color: rgba(250, 204, 21, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    }
    .stat-num {
      font-family: 'Space Grotesk', monospace;
      font-size: 2.2rem;
      font-weight: 800;
      color: #facc15;
      margin: 6px 0 2px;
    }
    .panel {
      background: #12141c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 26px;
      margin-bottom: 28px;
    }
    .panel-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .endpoint-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .endpoint-table th, .endpoint-table td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .endpoint-table th {
      color: #94a3b8;
      font-weight: 700;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .endpoint-link {
      color: #38bdf8;
      text-decoration: none;
      font-family: 'Space Grotesk', monospace;
      font-weight: 600;
    }
    .endpoint-link:hover {
      text-decoration: underline;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 14px;
      margin-top: 14px;
    }
    .product-item {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 10px;
      text-align: center;
    }
    .product-item img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .code-badge {
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.8rem;
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header-card">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <h1 style="font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.5px;">
            AURA Fashion Backend API
          </h1>
          <span class="badge badge-success">
            <span class="dot"></span>
            <span>MONGODB ATLAS ONLINE</span>
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 0.92rem;">
          Hệ thống máy chủ REST API & Cơ sở dữ liệu Cloud MongoDB Atlas của cửa hàng thời trang AURA Studio.
        </p>
        <p style="color: #64748b; font-size: 0.82rem; margin-top: 6px;">
          Database Cluster: <span class="code-badge">${dbHost}</span> • Database: <span class="code-badge">${dbName}</span>
        </p>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="http://localhost:3000/admin" target="_blank" class="btn btn-gold">
          🛡️ Mở Trang Quản Trị (/admin)
        </a>
        <a href="http://localhost:3000" target="_blank" class="btn btn-dark">
          🛍️ Mở Web Cửa Hàng
        </a>
        <a href="/api/products" target="_blank" class="btn btn-dark">
          📦 Xem JSON Sản Phẩm
        </a>
      </div>
    </div>

    <!-- Live Statistics Cards -->
    <div class="grid-stats">
      <div class="stat-card">
        <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 700; text-transform: uppercase;">
          👕 Sản Phẩm Trong Atlas
        </div>
        <div class="stat-num">${productCount}</div>
        <div style="font-size: 0.78rem; color: #10b981;">✓ Đã đồng bộ & sẵn sàng bán</div>
      </div>

      <div class="stat-card">
        <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 700; text-transform: uppercase;">
          👥 Tài Khoản Người Dùng
        </div>
        <div class="stat-num">${userCount}</div>
        <div style="font-size: 0.78rem; color: #38bdf8;">✓ Bao gồm Google & Local Users</div>
      </div>

      <div class="stat-card">
        <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 700; text-transform: uppercase;">
          📦 Đơn Hàng Hệ Thống
        </div>
        <div class="stat-num">${orderCount}</div>
        <div style="font-size: 0.78rem; color: #facc15;">✓ Quản lý đơn mua & tracking</div>
      </div>

      <div class="stat-card">
        <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 700; text-transform: uppercase;">
          🎟️ Mã Giảm Giá Hoạt Động
        </div>
        <div class="stat-num">${couponCount}</div>
        <div style="font-size: 0.78rem; color: #ff5722;">✓ STREETWEAR20, AURA30...</div>
      </div>
    </div>

    <!-- Admin Management Guide Panel -->
    <div class="panel" style="border: 1px solid rgba(250, 204, 21, 0.4); background: linear-gradient(135deg, rgba(250, 204, 21, 0.05) 0%, rgba(18, 20, 28, 1) 100%);">
      <div class="panel-title" style="color: #facc15;">
        <span>🛠️ Hướng Dẫn Quản Lý Sản Phẩm (Thêm / Sửa / Đổi Giá / Best Seller / Hết Hàng)</span>
      </div>
      <div style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.8;">
        <p style="margin-bottom: 10px;">
          Để chỉnh sửa, xóa sửa, úp load hoặc bật/tắt tình trạng sản phẩm trực quan, bạn thao tác trực tiếp tại:
        </p>
        <div style="background: rgba(0, 0, 0, 0.35); padding: 14px 18px; border-radius: 12px; border-left: 4px solid #facc15; margin-bottom: 14px;">
          <div style="margin-bottom: 6px;">
            <strong>Bước 1:</strong> Truy cập Cửa Hàng <a href="http://localhost:3000" target="_blank" style="color: #facc15; font-weight: 700;">http://localhost:3000</a> và đăng nhập tài khoản Quản trị viên (Email: <span class="code-badge">admin@streetwear.vn</span>).
          </div>
          <div style="margin-bottom: 6px;">
            <strong>Bước 2:</strong> Bấm nút màu vàng <span style="background: #facc15; color: #000; font-weight: 800; padding: 2px 8px; border-radius: 6px; font-size: 0.78rem;">[ Quản Trị ]</span> ở góc trên bên phải thanh Menu.
          </div>
          <div style="margin-bottom: 6px;">
            <strong>Bước 3 (Tab Quản Lý Sản Phẩm):</strong>
            <ul style="margin-left: 20px; margin-top: 4px;">
              <li><strong>Upload thêm đồ mới:</strong> Bấm <span class="code-badge">+ Thêm Sản Phẩm Mới</span>, điền tên, danh mục, giá bán, giá gốc, link ảnh -> Bấm Lưu.</li>
              <li><strong>Chỉnh giảm giá:</strong> Bấm nút <span class="code-badge">Sửa</span> -> Điền <em>Giá gốc</em> cao hơn <em>Giá bán</em> (Hệ thống tự động tính % giảm giá và hiện nhãn đỏ <span style="color: #ef4444; font-weight: bold;">-XX%</span> ngoài cửa hàng).</li>
              <li><strong>Hết hàng / Còn hàng:</strong> Bấm trực tiếp nút <span class="code-badge" style="color: #10b981;">🟢 Còn hàng</span> để chuyển thành <span class="code-badge" style="color: #ef4444;">🔴 HẾT HÀNG</span> (hoặc sửa tồn kho = 0). Sản phẩm sẽ tự động khóa nút mua trên web!</li>
              <li><strong>Best Seller / Bán chạy:</strong> Bấm 1-click vào nút <span class="code-badge" style="color: #facc15;">🔥 Best Seller</span> để gắn hoặc gỡ huy hiệu bán chạy.</li>
              <li><strong>Nổi bật (Featured):</strong> Bấm 1-click vào nút <span class="code-badge" style="color: #f59e0b;">⭐ Nổi Bật</span> để hiển thị ở mục nổi bật trang chủ.</li>
            </ul>
          </div>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
          <a href="http://localhost:3000" target="_blank" class="btn btn-gold">
            🚀 Mở Ngay Bảng Quản Trị Admin (Port 3000)
          </a>
        </div>
      </div>
    </div>

    <!-- Sample Products Preview from Atlas -->
    <div class="panel">
      <div class="panel-title">
        <span>✨ Danh Sách Sản Phẩm Mới Nhất Trong Database MongoDB Atlas (${productCount} mẫu)</span>
      </div>
      <div class="product-grid" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
        ${recentProducts.map(p => `
          <div class="product-item" style="text-align: left; padding: 12px;">
            <div style="position: relative; width: 100%; height: 130px; margin-bottom: 8px;">
              <img src="${(p.images && p.images[0]) || ''}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
              ${(p.stockQuantity <= 0) ? `
                <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; color: #ef4444; font-size: 0.72rem; font-weight: 800; border-radius: 8px;">
                  HẾT HÀNG
                </div>
              ` : ''}
            </div>
            <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">
              ${p.category || 'Thời trang'}
            </div>
            <div style="font-size: 0.84rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
              ${p.name}
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 4px;">
              <span style="font-size: 0.85rem; color: #facc15; font-weight: 800; font-family: monospace;">
                ${p.price ? p.price.toLocaleString('vi-VN') + '₫' : ''}
              </span>
              ${(p.originalPrice > p.price) ? `
                <span style="font-size: 0.72rem; color: #64748b; text-decoration: line-through;">
                  ${p.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              ` : ''}
            </div>
            <div style="display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap;">
              ${p.isBestSeller ? '<span style="font-size: 0.65rem; background: #facc15; color: #000; padding: 1px 5px; border-radius: 4px; font-weight: 800;">🔥 HOT</span>' : ''}
              ${p.featured ? '<span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: #f59e0b; padding: 1px 5px; border-radius: 4px; font-weight: 700;">⭐ NỔI BẬT</span>' : ''}
              ${(p.stockQuantity <= 0) ? '<span style="font-size: 0.65rem; background: rgba(239,68,68,0.2); color: #f87171; padding: 1px 5px; border-radius: 4px; font-weight: 700;">Hết hàng</span>' : `<span style="font-size: 0.65rem; background: rgba(16,185,129,0.2); color: #10b981; padding: 1px 5px; border-radius: 4px; font-weight: 700;">Kho: ${p.stockQuantity}</span>`}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- API Endpoints Directory -->
    <div class="panel">
      <div class="panel-title">
        <span>📚 Danh Sách REST API Endpoints</span>
      </div>
      <table class="endpoint-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Mô Tả Chức Năng</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="code-badge" style="color: #10b981; font-weight: bold;">GET</span></td>
            <td><a href="/api/products" target="_blank" class="endpoint-link">/api/products</a></td>
            <td>Lấy danh sách toàn bộ sản phẩm từ MongoDB Atlas (hỗ trợ lọc category, sort, price)</td>
            <td><span style="color: #10b981;">✓ 200 OK</span></td>
          </tr>
          <tr>
            <td><span class="code-badge" style="color: #10b981; font-weight: bold;">GET</span></td>
            <td><a href="/api/orders" target="_blank" class="endpoint-link">/api/orders</a></td>
            <td>Lấy danh sách các đơn hàng đã tạo trong database</td>
            <td><span style="color: #10b981;">✓ 200 OK</span></td>
          </tr>
          <tr>
            <td><span class="code-badge" style="color: #10b981; font-weight: bold;">GET</span></td>
            <td><a href="/api/health" target="_blank" class="endpoint-link">/api/health</a></td>
            <td>Health check trạng thái máy chủ</td>
            <td><span style="color: #10b981;">✓ 200 OK</span></td>
          </tr>
          <tr>
            <td><span class="code-badge" style="color: #f59e0b; font-weight: bold;">POST</span></td>
            <td><span class="endpoint-link" style="color: #f59e0b;">/api/auth/oauth</span></td>
            <td>Xác thực đăng nhập Google & đồng bộ người dùng vào Atlas</td>
            <td><span style="color: #10b981;">✓ 200 OK</span></td>
          </tr>
          <tr>
            <td><span class="code-badge" style="color: #f59e0b; font-weight: bold;">POST</span></td>
            <td><span class="endpoint-link" style="color: #f59e0b;">/api/auth/login</span></td>
            <td>Đăng nhập bằng Email & Mật khẩu</td>
            <td><span style="color: #10b981;">✓ 200 OK</span></td>
          </tr>
          <tr>
            <td><span class="code-badge" style="color: #10b981; font-weight: bold;">GET</span></td>
            <td><a href="/api/dashboard/stats" target="_blank" class="endpoint-link">/api/dashboard/stats</a></td>
            <td>Thống kê doanh thu, số lượng đơn hàng, người dùng</td>
            <td><span style="color: #10b981;">✓ 200 OK</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- How to view directly on MongoDB Atlas Cloud -->
    <div class="panel" style="border-color: rgba(16, 185, 129, 0.25);">
      <div class="panel-title" style="color: #10b981;">
        <span>🌿 Cách Xem & Chỉnh Sửa Trực Tiếp Trên MongoDB Atlas Cloud</span>
      </div>
      <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 12px;">
        Dữ liệu của bạn được lưu trữ trên Cloud MongoDB Atlas cluster <strong>Cluster0</strong>. Bạn có thể mở giao diện quản trị đồ họa chính thức của MongoDB:
      </p>
      <ol style="font-size: 0.86rem; color: #94a3b8; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
        <li>Truy cập <a href="https://cloud.mongodb.com/" target="_blank" style="color: #38bdf8; text-decoration: underline;">https://cloud.mongodb.com/</a> và đăng nhập vào tài khoản của bạn.</li>
        <li>Bấm vào menu <strong>Database</strong> bên trái, chọn cluster <strong>Cluster0</strong>.</li>
        <li>Bấm vào tab <strong>Collections</strong>. Bạn sẽ thấy database <code class="code-badge">clothing_store</code> với 4 collections: <code class="code-badge">products</code>, <code class="code-badge">users</code>, <code class="code-badge">orders</code>, <code class="code-badge">coupons</code>.</li>
        <li>Hoặc bạn có thể tải phần mềm <strong>MongoDB Compass</strong> trên máy tính và dán chuỗi kết nối URI trong file <code class="code-badge">.env</code> để xem dạng bảng trực quan.</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error serving root dashboard:', error);
    res.status(500).send('<h1>Server Error</h1><p>' + error.message + '</p>');
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AURA Clothing E-Commerce API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/support', supportRoutes);

// Catch-all 404 Handler for undefined routes (Anti-Directory Fuzzing Detection)
app.use((req, res) => {
  // Track consecutive 404s for anti-fuzzing
  recordNotFound(req);

  if (req.accepts('html')) {
    return res.status(404).send(getFakeNotFoundHtml());
  }
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(status).json({
    success: false,
    message:
      isProduction && status === 500
        ? 'Đã xảy ra sự cố trên hệ thống máy chủ. Vui lòng thử lại sau.'
        : err.message || 'Lỗi hệ thống máy chủ',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n🚀 ===============================================`);
      console.log(`✨ AURA Fashion Backend đang chạy tại: http://localhost:${PORT}`);
      console.log(`📚 Health check endpoint: http://localhost:${PORT}/api/health`);
      console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/login`);
      console.log(`===============================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

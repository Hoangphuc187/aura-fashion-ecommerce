import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';

dotenv.config();

const BASE_URL = 'http://localhost:5000';

const assert = (condition, title, details = '') => {
  if (condition) {
    console.log(`  ✅ [PASS] ${title} ${details}`);
    return true;
  } else {
    console.error(`  ❌ [FAIL] ${title} ${details}`);
    return false;
  }
};

/**
 * Modern standard stream reader using Fetch Web Streams API
 */
async function listenSSE(url, onEvent) {
  const res = await fetch(url);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  (async () => {
    let buffer = '';
    while (true) {
      try {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();
        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split('\n');
          let event = 'message';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
          }
          try {
            onEvent({ event, data: JSON.parse(dataStr) });
          } catch {
            onEvent({ event, data: dataStr });
          }
        }
      } catch (err) {
        break;
      }
    }
  })().catch(() => {});

  return {
    status: res.status,
    headers: res.headers,
    close: () => reader.cancel().catch(() => {}),
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 KIỂM THỬ TÍNH NĂNG 3 & 4 (SSE & ORDER EXPIRY WORKER)');
  console.log('====================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  const check = (cond, title, details = '') => {
    totalCount++;
    if (assert(cond, title, details)) passedCount++;
  };

  // 1. Health check & Stats
  console.log('1️⃣ Kiểm tra Realtime Stats API:');
  const statsRes = await fetch(`${BASE_URL}/api/realtime/stats`);
  const statsData = await statsRes.json();
  check(statsRes.status === 200, 'Endpoint /api/realtime/stats trả về HTTP 200');
  check(statsData.success === true, 'Trả về thuộc tính success: true');
  check(typeof statsData.stats?.activeAdminConnections === 'number', 'activeAdminConnections là kiểu number');

  // 2. Admin Authentication
  console.log('\n2️⃣ Đăng nhập Admin lấy JWT Token:');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@streetwear.vn', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  const adminToken = loginData.user?.token;
  check(!!adminToken, 'Đăng nhập Admin thành công và nhận JWT Token');

  // 3. Admin SSE Authorization & Handshake
  console.log('\n3️⃣ Kiểm tra Bảo Mật & Kết Nối Admin SSE Stream (/api/realtime/admin):');
  const unauthSSERes = await fetch(`${BASE_URL}/api/realtime/admin`);
  check(unauthSSERes.status === 401, 'Truy cập Admin SSE không có token bị chặn 401 Unauthorized');

  const adminEvents = [];
  const adminStream = await listenSSE(`${BASE_URL}/api/realtime/admin?token=${adminToken}`, (evt) => {
    adminEvents.push(evt);
  });

  // Wait 600ms for connection handshake
  await new Promise((r) => setTimeout(r, 600));
  check(adminStream.status === 200, 'Kết nối Admin SSE thành công (HTTP 200 text/event-stream)');
  check(
    adminEvents.some((e) => e.event === 'connected'),
    'Admin nhận sự kiện bắt tay (event: connected)'
  );

  // 4. Test Customer Order Tracking SSE
  console.log('\n4️⃣ Kiểm tra Kênh Live Tracking Khách Hàng (/api/realtime/order/:orderCode):');
  const testOrderCode = 'AURATEST-' + Date.now();
  const dummyEvents = [];
  const dummyStream = await listenSSE(`${BASE_URL}/api/realtime/order/${testOrderCode}`, (evt) => {
    dummyEvents.push(evt);
  });

  await new Promise((r) => setTimeout(r, 600));
  check(dummyStream.status === 200, `Subscribed thành công vào kênh đơn hàng ${testOrderCode}`);
  check(
    dummyEvents.some((e) => e.event === 'connected'),
    'Khách nhận sự kiện bắt tay (event: connected)'
  );

  // 5. Place an Order & Check Admin SSE Real-time Notification
  console.log('\n5️⃣ Kiểm tra Bắn Thông Báo SSE Khi Tạo Đơn Hàng Mới:');
  const productsRes = await fetch(`${BASE_URL}/api/products?limit=1`);
  const productsData = await productsRes.json();
  const testProduct = productsData.products?.[0];
  check(!!testProduct, `Lấy sản phẩm mẫu thành công: "${testProduct?.name}"`);

  const initialStock = testProduct?.stockQuantity || 100;

  const orderPayload = {
    orderItems: [
      {
        product: testProduct._id,
        name: testProduct.name,
        image: testProduct.images?.[0] || 'https://via.placeholder.com/150',
        price: testProduct.price,
        size: 'L',
        color: 'Đen',
        quantity: 2,
      },
    ],
    shippingAddress: {
      fullName: 'Nguyễn Văn Test SSE',
      phone: '0988776655',
      email: 'test_sse@example.com',
      address: '123 Đường Công Nghệ',
      ward: 'Phường 1',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      note: 'Giao trong giờ hành chính',
    },
    shippingMethod: 'standard',
    paymentMethod: 'VNPAY', // Online payment for testing expiry worker later
  };

  const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  const createdOrderData = await createOrderRes.json();
  check(createOrderRes.status === 201, 'Tạo đơn hàng online mới thành công (HTTP 201)');
  const newOrder = createdOrderData.order;
  check(!!newOrder?.orderCode, `Mã đơn hàng được tạo: ${newOrder?.orderCode}`);

  // Subscribe this new order to customer SSE
  const newOrderEvents = [];
  const realOrderStream = await listenSSE(`${BASE_URL}/api/realtime/order/${newOrder.orderCode}`, (evt) => {
    newOrderEvents.push(evt);
  });

  // Allow events to propagate
  await new Promise((r) => setTimeout(r, 1000));

  check(
    adminEvents.some((e) => e.event === 'new_order' && e.data?.orderCode === newOrder.orderCode),
    'Admin SSE nhận thông báo đơn mới (event: new_order) ngay lập tức'
  );

  // Check product stock deducted
  const productAfterOrder = await Product.findById(testProduct._id);
  check(
    productAfterOrder.stockQuantity === initialStock - 2,
    `Tồn kho sản phẩm bị trừ chính xác 2 cái (${initialStock} -> ${productAfterOrder.stockQuantity})`
  );

  // 6. Test Status Update Broadcast
  console.log('\n6️⃣ Kiểm tra Admin Đổi Trạng Thái -> Khách Hàng Nhận Timeline SSE Tức Thì:');
  const updateRes = await fetch(`${BASE_URL}/api/orders/${newOrder._id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      orderStatus: 'Processing',
      note: 'Đơn hàng đã được xác nhận và đang đóng gói.',
    }),
  });
  check(updateRes.status === 200, 'Admin cập nhật trạng thái đơn sang Processing thành công');

  await new Promise((r) => setTimeout(r, 1000));
  check(
    newOrderEvents.some((e) => e.event === 'order_updated' && e.data?.order?.orderStatus === 'Processing'),
    'Kênh khách hàng nhận sự kiện order_updated nhảy trạng thái sang Processing'
  );

  // 7. Test Order Expiry Background Worker & Stock Rollback
  console.log('\n7️⃣ Kiểm tra Order Expiry Worker & Transactional Stock Rollback:');
  // Giả lập đơn hàng quá hạn 15 phút bằng cách cập nhật trực tiếp BSON createdAt qua collection
  const twentyMinutesAgo = new Date(Date.now() - 25 * 60 * 1000);
  await Order.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(newOrder._id) },
    {
      $set: {
        createdAt: twentyMinutesAgo,
        orderStatus: 'Pending',
        paymentStatus: 'Pending',
        paymentMethod: 'VNPAY',
      },
    }
  );
  console.log('  🕒 Đã lùi BSON createdAt về 25 phút trước để giả lập đơn online hết hạn thanh toán...');

  // Kích hoạt API quét đơn quá hạn của Admin
  const triggerRes = await fetch(`${BASE_URL}/api/orders/admin/trigger-expiry-check`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const triggerData = await triggerRes.json();
  check(triggerRes.status === 200, 'Admin gọi API trigger-expiry-check thành công (HTTP 200)');
  check(triggerData.success === true, 'Kết quả quét trả về success: true');
  check(triggerData.result?.count >= 1, `Worker đã tìm thấy và xử lý ${triggerData.result?.count} đơn quá hạn`);

  // Verify order in database
  const expiredOrderInDb = await Order.findById(newOrder._id);
  check(expiredOrderInDb.orderStatus === 'Cancelled', 'Trạng thái đơn hàng tự động chuyển sang "Cancelled"');
  check(
    expiredOrderInDb.refundReason.includes('quá hạn thanh toán 15 phút'),
    `Lý do hủy được ghi nhận chính xác: "${expiredOrderInDb.refundReason}"`
  );
  check(
    expiredOrderInDb.timeline.some((t) => t.status === 'Cancelled'),
    'Timeline của đơn hàng tự động bổ sung mốc lịch sử "Tự động hủy đơn do quá thời hạn thanh toán"'
  );

  // Verify stock rolled back
  const productAfterExpiry = await Product.findById(testProduct._id);
  check(
    productAfterExpiry.stockQuantity === initialStock,
    `Tồn kho sản phẩm được hoàn trả (rollback) chính xác về ${initialStock} cái`
  );

  // Verify SSE events fired for expiry
  await new Promise((r) => setTimeout(r, 1000));
  check(
    adminEvents.some((e) => e.event === 'order_expired' && e.data?.orderCode === newOrder.orderCode),
    'Admin SSE nhận thông báo đơn bị hủy quá hạn (event: order_expired)'
  );
  check(
    newOrderEvents.some((e) => e.event === 'order_updated' && e.data?.order?.orderStatus === 'Cancelled'),
    'Khách hàng xem live tracking nhận thông báo đơn đã bị hủy'
  );

  // Clean up connections
  adminStream.close();
  dummyStream.close();
  realOrderStream.close();

  console.log('\n====================================================');
  console.log(`📊 TỔNG KẾT: ${passedCount}/${totalCount} BÀI TEST THÀNH CÔNG (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('====================================================\n');

  if (passedCount === totalCount) {
    console.log('🎉 TẤT CẢ TÍNH NĂNG HOẠT ĐỘNG HOÀN HẢO 100%!');
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

// Connect to MongoDB to verify directly if needed
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing_store')
  .then(() => {
    runTests();
  })
  .catch((err) => {
    console.error('Không thể kết nối MongoDB:', err.message);
    process.exit(1);
  });

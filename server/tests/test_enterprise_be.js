import assert from 'assert';
import { ApiResponse } from '../src/utils/ApiResponse.js';
import { correlationIdMiddleware } from '../src/middleware/correlationId.js';
import { logger } from '../src/config/logger.js';
import { validateDto } from '../src/dtos/validator.js';
import { RegisterDtoSchema, UserResponseDto } from '../src/dtos/auth.dto.js';
import { CreateOrderDtoSchema, OrderResponseDto } from '../src/dtos/order.dto.js';
import { ProductResponseDto } from '../src/dtos/product.dto.js';

console.log('🏛️ =======================================================');
console.log('🏛️ KIỂM THỬ TOÀN DIỆN CÁC TIÊU CHUẨN BACKEND ENTERPRISE');
console.log('🏛️ (DTO, Standard Response Envelope, UUID, Logging Stack, Procedures)');
console.log('🏛️ =======================================================\n');

// 1. Test UUID Request Correlation ID Middleware
console.log('1️⃣ Kiểm thử Request Correlation ID Middleware (UUID v4):');
const mockReq = { headers: {} };
const mockRes = {
  headers: {},
  setHeader(k, v) { this.headers[k] = v; },
};
correlationIdMiddleware(mockReq, mockRes, () => {});

assert.ok(mockReq.id, 'req.id phải được sinh ra');
assert.ok(mockRes.headers['X-Request-Id'], 'X-Request-Id header phải được đính kèm');
assert.match(
  mockReq.id,
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  'Correlation ID phải là UUID v4 hợp lệ'
);
console.log(`   ✓ Sinh UUID Trace thành công: ${mockReq.id}`);
console.log(`   ✓ Đính kèm Header X-Request-Id thành công.\n`);

// 2. Test Standard API Response Envelope
console.log('2️⃣ Kiểm thử Standard API Response Envelope:');
let capturedResponse = null;
let capturedStatus = 0;
const mockExpressRes = {
  req: mockReq,
  status(code) { capturedStatus = code; return this; },
  json(data) { capturedResponse = data; return this; },
};

ApiResponse.success(mockExpressRes, {
  data: { products: [{ id: 1, name: 'AURA T-Shirt' }], total: 1 },
  message: 'Lấy sản phẩm thành công',
  statusCode: 200,
});

assert.strictEqual(capturedStatus, 200);
assert.strictEqual(capturedResponse.success, true);
assert.strictEqual(capturedResponse.statusCode, 200);
assert.strictEqual(capturedResponse.message, 'Lấy sản phẩm thành công');
assert.strictEqual(capturedResponse.meta.requestId, mockReq.id);
assert.ok(capturedResponse.meta.timestamp);
// Backward compatibility check
assert.ok(Array.isArray(capturedResponse.products), 'Phải giữ trường products ở root level cho Client cũ');
console.log('   ✓ ApiResponse.success envelope chuẩn xác định dạng RESTful enterprise.');
console.log('   ✓ Backward compatibility: Tự động giữ trường data ở top-level cho React UI.\n');

// Test Error Envelope
ApiResponse.error(mockExpressRes, {
  statusCode: 400,
  errorCode: 'VALIDATION_FAILED',
  message: 'Dữ liệu không hợp lệ',
  errors: [{ field: 'email', message: 'Email sai định dạng' }],
});

assert.strictEqual(capturedStatus, 400);
assert.strictEqual(capturedResponse.success, false);
assert.strictEqual(capturedResponse.errorCode, 'VALIDATION_FAILED');
assert.strictEqual(capturedResponse.errors[0].field, 'email');
console.log('   ✓ ApiResponse.error envelope chuẩn xác định dạng mã lỗi & field-level details.\n');

// 3. Test DTO Request Validator
console.log('3️⃣ Kiểm thử DTO Validation Engine:');
const validatorMiddleware = validateDto(RegisterDtoSchema);

// 3a. Invalid payload (missing email, weak password)
const invalidReq = {
  body: { name: 'A', email: 'not-an-email', password: '123' },
};
let validationErrorOutput = null;
const invalidRes = {
  req: mockReq,
  status(code) { this.statusCode = code; return this; },
  json(data) { validationErrorOutput = data; return this; },
};

validatorMiddleware(invalidReq, invalidRes, () => {});
assert.strictEqual(validationErrorOutput.success, false);
assert.strictEqual(validationErrorOutput.errorCode, 'VALIDATION_FAILED');
assert.ok(validationErrorOutput.errors.length >= 2, 'Phải bắt được nhiều lỗi validation');
console.log(`   ✓ DTO Validator chặn thành công request lỗi: ${validationErrorOutput.errors.map(e => e.field).join(', ')}`);

// 3b. Valid payload
const validReq = {
  body: { name: 'Hoang Phuc', email: 'phuc@aura.vn', password: 'SecurePassword@2026' },
};
let nextCalled = false;
validatorMiddleware(validReq, invalidRes, () => { nextCalled = true; });
assert.strictEqual(nextCalled, true, 'Next() phải được gọi khi DTO hợp lệ');
assert.strictEqual(validReq.dto.name, 'Hoang Phuc');
console.log('   ✓ DTO Validator xác thực và sanitize dữ liệu thành công khi payload hợp lệ.\n');

// 4. Test Serializer DTOs (Masking secrets & adding UUIDs)
console.log('4️⃣ Kiểm thử Output Serializer DTOs:');
const rawUser = {
  _id: '67123abc456def789',
  uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'Hoang Phuc',
  email: 'phuc@aura.vn',
  password: '$2a$10$hashedpasswordhere',
  twoFactorOtp: '123456',
  role: 'customer',
  avatar: 'avatar.png',
};
const userDto = UserResponseDto.transform(rawUser);
assert.strictEqual(userDto.uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
assert.strictEqual(userDto.password, undefined, 'Mật khẩu tuyệt đối không được rò rỉ ra DTO');
assert.strictEqual(userDto.twoFactorOtp, undefined, 'OTP tuyệt đối không được rò rỉ ra DTO');
console.log('   ✓ UserResponseDto đã ẩn triệt để trường nhạy cảm và gán UUID an toàn.');

const rawOrder = {
  _id: '67123abc456def789',
  orderCode: 'AURA-123456',
  trackingUuid: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
  orderItems: [{ product: 'prod-1', name: 'Shirt', price: 200000, quantity: 2, image: '', size: 'L', color: 'Black' }],
  itemsPrice: 400000,
  shippingPrice: 30000,
  discountAmount: 0,
  totalPrice: 430000,
};
const orderDto = OrderResponseDto.transform(rawOrder);
assert.strictEqual(orderDto.trackingUuid, 'c9bf9e57-1685-4c89-bafb-ff5af830be8a');
assert.strictEqual(orderDto.orderItems[0].subtotal, 400000);
console.log('   ✓ OrderResponseDto tính toán subtotal và đính kèm public trackingUuid.\n');

// 5. Test Structured Logging Stack
console.log('5️⃣ Kiểm thử Winston Structured Logging Stack:');
logger.info('Test Info Message', { requestId: mockReq.id, action: 'UNIT_TEST' });
logger.warn('Test Warning Message', { requestId: mockReq.id, reason: 'THRESHOLD_ALERT' });
logger.error('Test Error Log with Stack Trace', { requestId: mockReq.id, error: 'Simulated exception' });

const recentLogs = logger.getRecentLogs(10);
assert.ok(recentLogs.length >= 3, 'Memory log buffer phải lưu trữ log gần nhất');
const lastLog = recentLogs[0];
assert.strictEqual(lastLog.requestId, mockReq.id);
console.log(`   ✓ Logging stack hoạt động xuất sắc. Lấy được ${recentLogs.length} logs từ bộ đệm real-time.`);
console.log(`   ✓ Log mang đầy đủ Timestamp, Log Level, Correlation ID (${mockReq.id}) và Metadata.\n`);

console.log('🎉 =======================================================');
console.log('🎉 TẤT CẢ 5 HẠNG MỤC BACKEND NÂNG CẤP ĐỀU ĐẠT CHUẨN 100%!');
console.log('🎉 =======================================================');


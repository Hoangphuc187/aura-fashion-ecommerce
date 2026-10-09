// Automated Security Test Suite
const testSecurity = async () => {
  const baseUrl = 'http://localhost:5000';
  console.log('🧪 Bắt đầu kiểm tra bảo mật AURA Security Shield...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName} ${extraInfo}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${extraInfo}`);
      failed++;
    }
  };

  try {
    // 1. Health check & security headers
    console.log('1️⃣ Kiểm tra Health check & Security Headers:');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds 200 OK');
    assert(!healthRes.headers.get('x-powered-by'), 'X-Powered-By is hidden');
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff present');
    assert(healthRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN present');

    // 2. Stealth Admin Cloaking
    console.log('\n2️⃣ Kiểm tra Stealth Cloaking (Ngụy trang Admin):');
    const adminRes = await fetch(`${baseUrl}/api/dashboard/stats`);
    assert(adminRes.status === 404, 'Admin endpoint returns 404 Not Found for unauthenticated caller');

    const adminPortalRes = await fetch(`${baseUrl}/admin-portal`);
    assert(adminPortalRes.status === 404, '/admin-portal returns 404 without secret key');

    // 3. IDOR Protection on Orders
    console.log('\n3️⃣ Kiểm tra Chống IDOR (Đơn hàng):');
    const orderRes = await fetch(`${baseUrl}/api/orders/AURA-123456`);
    assert(orderRes.status === 404, 'Unauthenticated access to specific order is blocked (404)');

    // 4. Anti-Enumeration & Password Protection
    console.log('\n4️⃣ Kiểm tra Chống Dò Email (Anti-Enumeration):');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_hacker_test@aura.com', password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 401, 'Failed login returns 401');
    assert(
      loginData.message.includes('Email hoặc mật khẩu không chính xác'),
      'Returns generic error message (no account existence leakage)'
    );

    // 5. Anti-OTP Leakage on Forgot Password
    console.log('\n5️⃣ Kiểm tra Chống lộ OTP khi Quên mật khẩu:');
    const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@streetwear.vn' }),
    });
    const forgotData = await forgotRes.json().catch(() => ({}));
    assert(
      forgotRes.status === 200 || forgotRes.status === 429,
      `Forgot password responds 200 OK or 429 Rate Limited (Status: ${forgotRes.status})`
    );
    assert(!forgotData.otp, 'OTP is NOT exposed in standard JSON response');

    // 6. NoSQL Injection Neutralization
    console.log('\n6️⃣ Kiểm tra Chống NoSQL Injection:');
    const nosqlRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: { $gt: '' }, password: { $gt: '' } }),
    });
    assert(nosqlRes.status === 400 || nosqlRes.status === 401, 'NoSQL injection payload is safely rejected without server crash');

    // 7. ReDoS Regex Injection Protection
    console.log('\n7️⃣ Kiểm tra Chống ReDoS Regex Injection:');
    const redosRes = await fetch(`${baseUrl}/api/products?keyword=(((a%2B)%2B)%2B)%2B%24`);
    assert(redosRes.status === 200, 'Special regex characters are safely escaped without crash or lag');

    console.log(`\n==============================================`);
    console.log(`🎉 KẾT QUẢ KIỂM TRA BẢO MẬT: ${passed} PASS, ${failed} FAIL`);
    console.log(`==============================================\n`);
  } catch (err) {
    console.error('Lỗi khi chạy test:', err);
  }
};

testSecurity();

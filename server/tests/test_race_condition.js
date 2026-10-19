// Node.js native fetch used
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

let passed = 0;
let failed = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runRaceConditionTests() {
  console.log('\n⚡ =======================================================');
  console.log('⚡ KIỂM THỬ ATOMIC INVENTORY LOCKING & CHỐNG BÁN ÂM KHO');
  console.log('⚡ =======================================================\n');

  try {
    // 1. Lấy danh sách sản phẩm thực tế từ server
    console.log('1️⃣ Chuẩn bị dữ liệu kiểm thử Flash Sale:');
    const prodsRes = await fetch(`${BASE_URL}/api/products?limit=5`);
    const prodsData = await prodsRes.json();
    const products = prodsData.products || [];

    if (products.length === 0) {
      console.error('Không tìm thấy sản phẩm nào trong DB để kiểm thử.');
      process.exit(1);
    }

    const targetProduct = products[0];
    const originalStock = targetProduct.stockQuantity;
    console.log(`  📦 Sản phẩm kiểm thử: "${targetProduct.name}" (_id: ${targetProduct._id})`);
    console.log(`  📊 Tồn kho ban đầu: ${originalStock} cái`);

    // 2. Đăng nhập Admin để chuẩn bị đặt stock giả lập Flash Sale
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@streetwear.vn',
        password: 'admin123',
      }),
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.user?.token || loginData.token;

    check(!!adminToken, 'Đăng nhập Admin thành công để quản lý kho');

    // Cập nhật tồn kho của targetProduct về ĐÚNG 2 CÁI (Flash Sale hàng hiếm)
    const setStockRes = await fetch(`${BASE_URL}/api/products/${targetProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ stockQuantity: 2 }),
    });
    check(setStockRes.status === 200, 'Thiết lập tồn kho giới hạn = 2 sản phẩm (Flash Sale)');

    // 3. BẮT ĐẦU BẮN 10 REQUEST TẠO ĐƠN HÀNG ĐỒNG THỜI (HIGH CONCURRENCY)
    console.log('\n2️⃣ Bắn đồng thời 10 đơn hàng (Concurrency = 10) tranh chấp 2 sản phẩm còn lại:');

    const concurrentRequests = [];
    const NUM_BUYERS = 10;

    for (let i = 0; i < NUM_BUYERS; i++) {
      const buyerPhone = `090${Math.floor(1000000 + Math.random() * 9000000)}`;
      const reqPromise = fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems: [
            {
              product: targetProduct._id,
              quantity: 1,
              size: 'L',
              color: 'Đen',
            },
          ],
          shippingAddress: {
            fullName: `Khách Hàng Flash Sale #${i + 1}`,
            phone: buyerPhone,
            address: '123 Đường Săn Sale, Phường 1',
            city: 'Hồ Chí Minh',
          },
          paymentMethod: 'COD',
        }),
      }).then(async (res) => ({
        status: res.status,
        data: await res.json(),
        buyerIndex: i + 1,
      }));

      concurrentRequests.push(reqPromise);
    }

    const results = await Promise.all(concurrentRequests);

    const successOrders = results.filter((r) => r.status === 201 && r.data?.success === true);
    const rejectedOrders = results.filter((r) => r.status === 400 && r.data?.success === false);

    console.log(`  🏁 Số đơn mua thành công (201): ${successOrders.length}`);
    console.log(`  🚫 Số đơn bị từ chối do hết kho (400): ${rejectedOrders.length}`);

    check(
      successOrders.length === 2,
      `Đúng chính xác 2 đơn hàng mua thành công (Kỳ vọng: 2, Thực tế: ${successOrders.length})`
    );
    check(
      rejectedOrders.length === NUM_BUYERS - 2,
      `Chính xác 8 đơn bị chặn sạch sẽ không cho mua âm (Kỳ vọng: 8, Thực tế: ${rejectedOrders.length})`
    );
    check(
      rejectedOrders.every((r) => r.data?.insufficientStock === true || r.data?.message?.includes('hết hàng')),
      'Tất cả 8 đơn bị từ chối đều nhận thông báo hết hàng Flash Sale minh bạch'
    );

    // 4. Kiểm tra tồn kho trong cơ sở dữ liệu sau trận Flash Sale
    console.log('\n3️⃣ Kiểm tra tính toàn vẹn tồn kho trong Database sau bão Flash Sale:');
    const verifyProdRes = await fetch(`${BASE_URL}/api/products/${targetProduct._id}`);
    const verifyProdData = await verifyProdRes.json();
    const finalStock = verifyProdData.product?.stockQuantity;

    console.log(`  📊 Tồn kho thực tế sau Flash Sale: ${finalStock} cái`);
    check(finalStock === 0, 'Tồn kho giảm chính xác về 0 cái (Tuyệt đối KHÔNG BỊ ÂM KHO)');

    // 5. Kiểm tra Compensating Transaction (Rollback đa sản phẩm khi 1 món trong giỏ hết hàng)
    console.log('\n4️⃣ Kiểm tra Rollback Transaction khi Giỏ hàng có 1 món hết hàng:');
    
    // Món A còn 5 cái, Món B (targetProduct) còn 0 cái
    const productA = products[1];
    const stockABefore = productA.stockQuantity;

    const multiItemOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderItems: [
          {
            product: productA._id,
            quantity: 2, // Món này còn hàng
            size: 'M',
            color: 'Đen',
          },
          {
            product: targetProduct._id,
            quantity: 1, // Món này ĐÃ HẾT HÀNG (stock = 0)
            size: 'L',
            color: 'Đen',
          },
        ],
        shippingAddress: {
          fullName: 'Khách Hàng Test Rollback',
          phone: '0988776655',
          address: '456 Test Street',
          city: 'Hồ Chí Minh',
        },
        paymentMethod: 'COD',
      }),
    });

    const multiItemData = await multiItemOrderRes.json();
    check(multiItemOrderRes.status === 400, 'Đơn hàng 2 món bị từ chối vì 1 món hết hàng');
    check(multiItemData.success === false, 'Trả về success: false');

    // Kiểm tra món A có bị trừ nhầm không (phải được rollback về nguyên vẹn)
    const verifyProdARes = await fetch(`${BASE_URL}/api/products/${productA._id}`);
    const verifyProdAData = await verifyProdARes.json();
    const stockAAfter = verifyProdAData.product?.stockQuantity;

    check(
      stockAAfter === stockABefore,
      `Món A được rollback tồn kho nguyên vẹn (${stockABefore} -> ${stockAAfter})`
    );

    // 6. Hoàn trả tồn kho ban đầu cho sản phẩm kiểm thử
    await fetch(`${BASE_URL}/api/products/${targetProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ stockQuantity: originalStock }),
    });
    console.log(`\n🧹 Đã dọn dẹp và khôi phục tồn kho sản phẩm về ${originalStock} cái.`);

    console.log('\n==============================================');
    console.log(`🎉 KẾT QUẢ KIỂM THỬ RACE CONDITION: ${passed} PASS, ${failed} FAIL`);
    console.log('==============================================\n');

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi kiểm thử Race Condition:', err);
    process.exit(1);
  }
}

runRaceConditionTests();

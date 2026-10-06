import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const OUTPUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return res.result?.value;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`📸 Saved screenshot: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('🚀 Khởi động Headless Chrome tại http://localhost:3000 ...');
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--window-size=1920,1080',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--remote-allow-origins=*',
      '--user-data-dir=C:\\Users\\ACERNITRO\\AppData\\Local\\Temp\\chrome_cdp_profile_4',
      'http://localhost:3000',
    ],
    { stdio: 'ignore' }
  );

  await delay(3500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = await listRes.json();
    const targetTab = tabs.find((t) => t.type === 'page' && t.url.includes('localhost:3000')) || tabs[0];
    if (!targetTab) throw new Error('Không tìm thấy tab trang web localhost:3000');

    console.log('Đang kết nối CDP...');
    const cdp = new CDPClient(targetTab.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('CDP đã kết nối thành công!');

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('Chờ tải dữ liệu trang chủ...');
    await delay(3500);

    // ==========================================
    // PHẦN 1: STOREFRONT & MUA SẮM
    // ==========================================

    // 01. Home Hero
    console.log('Đang chụp: 01_home_hero.png');
    await cdp.eval(`window.scrollTo(0, 0);`);
    await delay(800);
    await cdp.screenshot('01_home_hero.png');

    // 02. Catalog & Filters
    console.log('Đang chụp: 02_catalog_filters.png');
    await cdp.eval(`
      const cat = document.getElementById('catalog-section');
      if (cat) cat.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await delay(1200);
    await cdp.screenshot('02_catalog_filters.png');

    // 03. Product Details Modal & Add to Cart
    console.log('Đang chụp: 03_product_modal.png');
    await cdp.eval(`
      const card = document.querySelector('.card-3d-interactive');
      if (card) card.click();
    `);
    await delay(1800);
    await cdp.screenshot('03_product_modal.png');

    // Thêm sản phẩm vào giỏ để cart có sản phẩm thật (case-insensitive)
    await cdp.eval(`
      const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('thêm vào giỏ'));
      if (addBtn) addBtn.click();
    `);
    await delay(1200);

    // Đóng Modal sản phẩm
    await cdp.eval(`
      const closeBtn = document.querySelector('.modal-backdrop button, [style*="z-index"] button');
      if (closeBtn) closeBtn.click();
    `);
    await delay(800);

    // 04. Cart Drawer (với sản phẩm thật trong giỏ)
    console.log('Đang chụp: 04_cart_drawer.png');
    await cdp.eval(`
      const cartBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('₫') || b.textContent.toLowerCase().includes('giỏ')));
      if (cartBtn) cartBtn.click();
    `);
    await delay(1500);
    await cdp.screenshot('04_cart_drawer.png');

    // 05. Checkout Modal (Click 'Tiến Hành Thanh Toán' từ Drawer)
    console.log('Đang chụp: 05_checkout_modal.png');
    await cdp.eval(`
      const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('tiến hành thanh toán'));
      if (checkoutBtn) checkoutBtn.click();
    `);
    await delay(1800);
    await cdp.screenshot('05_checkout_modal.png');

    // Đóng Modal Checkout
    await cdp.eval(`
      const closeCheckout = document.querySelector('.modal-backdrop button');
      if (closeCheckout) closeCheckout.click();
    `);
    await delay(800);

    // 06. Order Tracking Modal
    console.log('Đang chụp: 06_order_tracking.png');
    await cdp.eval(`
      const trackBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('tra cứu đơn'));
      if (trackBtn) trackBtn.click();
    `);
    await delay(1500);
    await cdp.screenshot('06_order_tracking.png');

    // Đóng Modal Tracking
    await cdp.eval(`
      const closeTrack = document.querySelector('.modal-backdrop button');
      if (closeTrack) closeTrack.click();
    `);
    await delay(800);

    // 07. Support Portal - FAQ
    console.log('Đang chụp: 07_support_faq.png');
    await cdp.eval(`
      const supportBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('hỗ trợ & faq'));
      if (supportBtn) supportBtn.click();
    `);
    await delay(1500);
    await cdp.screenshot('07_support_faq.png');

    // 08. Support Portal - Ticket Form
    console.log('Đang chụp: 08_support_ticket_form.png');
    await cdp.eval(`
      const ticketTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('gửi yêu cầu'));
      if (ticketTab) ticketTab.click();
    `);
    await delay(1200);
    await cdp.screenshot('08_support_ticket_form.png');

    // 09. Support Portal - Live Chat Bot
    console.log('Đang chụp: 09_support_livechat_bot.png');
    await cdp.eval(`
      const chatTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('bot trợ lý'));
      if (chatTab) chatTab.click();
    `);
    await delay(1200);
    await cdp.screenshot('09_support_livechat_bot.png');

    // Đóng Modal Support
    await cdp.eval(`
      const closeSupport = document.querySelector('.modal-backdrop button');
      if (closeSupport) closeSupport.click();
    `);
    await delay(800);

    // 10. Auth Modal
    console.log('Đang chụp: 10_auth_modal.png');
    await cdp.eval(`
      const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('đăng nhập'));
      if (loginBtn) loginBtn.click();
    `);
    await delay(1200);
    await cdp.screenshot('10_auth_modal.png');

    // Đóng Auth Modal
    await cdp.eval(`
      const closeAuth = document.querySelector('.modal-backdrop button');
      if (closeAuth) closeAuth.click();
    `);
    await delay(800);

    // ==========================================
    // PHẦN 2: TÀI KHOẢN KHÁCH HÀNG (CUSTOMER PORTAL)
    // ==========================================
    console.log('Đang đăng nhập tài khoản Khách Hàng...');
    await cdp.eval(`
      (async () => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'khachhang@gmail.com', password: 'user123' })
        });
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('aura_user', JSON.stringify(data.user));
          window.location.reload();
        }
      })();
    `);
    await delay(3500);

    // 11. User Dropdown Menu
    console.log('Đang chụp: 11_user_dropdown_menu.png');
    await cdp.eval(`
      const userBtn = document.querySelector('button img[alt]')?.closest('button');
      if (userBtn) userBtn.click();
    `);
    await delay(1000);
    await cdp.screenshot('11_user_dropdown_menu.png');

    // 12. Customer Account - Profile
    console.log('Đang chụp: 12_customer_profile.png');
    await cdp.eval(`
      const profileBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('hồ sơ của tôi'));
      if (profileBtn) profileBtn.click();
    `);
    await delay(1500);
    await cdp.screenshot('12_customer_profile.png');

    // 13. Customer Account - Address Book
    console.log('Đang chụp: 13_customer_address_book.png');
    await cdp.eval(`
      const addrTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('sổ địa chỉ'));
      if (addrTab) addrTab.click();
    `);
    await delay(1200);
    await cdp.screenshot('13_customer_address_book.png');

    // 14. Customer Account - Orders
    console.log('Đang chụp: 14_customer_orders.png');
    await cdp.eval(`
      const ordersTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('đơn mua'));
      if (ordersTab) ordersTab.click();
    `);
    await delay(1200);
    await cdp.screenshot('14_customer_orders.png');

    // 15. Customer Account - Reviews
    console.log('Đang chụp: 15_customer_reviews.png');
    await cdp.eval(`
      const reviewsTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('đánh giá sản phẩm'));
      if (reviewsTab) reviewsTab.click();
    `);
    await delay(1200);
    await cdp.screenshot('15_customer_reviews.png');

    // 16. Customer Account - Vouchers
    console.log('Đang chụp: 16_customer_vouchers.png');
    await cdp.eval(`
      const vouchersTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('kho voucher'));
      if (vouchersTab) vouchersTab.click();
    `);
    await delay(1200);
    await cdp.screenshot('16_customer_vouchers.png');

    // 17. Customer Account - Security
    console.log('Đang chụp: 17_customer_security.png');
    await cdp.eval(`
      const secTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('bảo mật & thiết bị'));
      if (secTab) secTab.click();
    `);
    await delay(1200);
    await cdp.screenshot('17_customer_security.png');

    // Đóng Account Modal
    await cdp.eval(`
      const closeAccount = document.querySelector('.modal-backdrop button');
      if (closeAccount) closeAccount.click();
    `);
    await delay(800);

    // ==========================================
    // PHẦN 3: HỆ THỐNG QUẢN TRỊ ADMIN (/admin)
    // ==========================================
    console.log('Đang đăng nhập tài khoản Quản Trị Viên (Admin) và chuyển hướng tới /admin ...');
    await cdp.eval(`
      (async () => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@streetwear.vn', password: 'admin123' })
        });
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('aura_user', JSON.stringify(data.user));
          window.location.href = '/admin';
        }
      })();
    `);
    await delay(4000);

    // 18. Admin Dashboard (Tổng Quan Báo Cáo)
    console.log('Đang chụp: 18_admin_dashboard.png');
    await cdp.eval(`
      const statsTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('tổng quan báo cáo'));
      if (statsTab) statsTab.click();
    `);
    await delay(1800);
    await cdp.screenshot('18_admin_dashboard.png');

    // 19. Admin Products (Quản Lý Sản Phẩm)
    console.log('Đang chụp: 19_admin_products.png');
    await cdp.eval(`
      const prodTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('quản lý sản phẩm'));
      if (prodTab) prodTab.click();
    `);
    await delay(1500);
    await cdp.screenshot('19_admin_products.png');

    // 20. Admin Orders (Quản Lý Đơn Hàng)
    console.log('Đang chụp: 20_admin_orders.png');
    await cdp.eval(`
      const ordTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('quản lý đơn hàng'));
      if (ordTab) ordTab.click();
    `);
    await delay(1500);
    await cdp.screenshot('20_admin_orders.png');

    // 21. Admin Invoice Modal (In Hóa Đơn Chuẩn QR)
    console.log('Đang chụp: 21_admin_invoice_modal.png');
    await cdp.eval(`
      const invoiceBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('in hóa đơn'));
      if (invoiceBtn) invoiceBtn.click();
    `);
    await delay(1800);
    await cdp.screenshot('21_admin_invoice_modal.png');

    // Đóng Invoice Modal
    await cdp.eval(`
      const closeInv = document.querySelector('.modal-backdrop button, [style*="z-index"] button');
      if (closeInv) closeInv.click();
    `);
    await delay(800);

    // 22. Admin Inventory (Kho Hàng & Cảnh Báo)
    console.log('Đang chụp: 22_admin_inventory.png');
    await cdp.eval(`
      const invTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('kho hàng & cảnh báo'));
      if (invTab) invTab.click();
    `);
    await delay(1500);
    await cdp.screenshot('22_admin_inventory.png');

    // 23. Admin Coupons (Mã Giảm Giá / Coupon)
    console.log('Đang chụp: 23_admin_coupons.png');
    await cdp.eval(`
      const coupTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('mã giảm giá / coupon'));
      if (coupTab) coupTab.click();
    `);
    await delay(1500);
    await cdp.screenshot('23_admin_coupons.png');

    // 24. Admin Support Tickets Desk (Hỗ Trợ & Ticket CSKH)
    console.log('Đang chụp: 24_admin_support_tickets.png');
    await cdp.eval(`
      const tickTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('hỗ trợ & ticket cskh'));
      if (tickTab) tickTab.click();
    `);
    await delay(1500);
    await cdp.screenshot('24_admin_support_tickets.png');

    console.log('🎉 TOÀN BỘ 24 ẢNH CHỤP MÀN HÌNH TỪ A-Z ĐÃ HOÀN TẤT THÀNH CÔNG!');
    cdp.close();
  } catch (err) {
    console.error('Lỗi trong quá trình chụp ảnh:', err);
  } finally {
    try {
      chrome.kill();
    } catch {}
  }
}

run();

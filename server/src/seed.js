import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';

export const initialProducts = [
  {
    name: 'Áo Hoodie Cyberpunk Acid Wash Oversized',
    category: 'Áo khoác',
    price: 680000,
    originalPrice: 850000,
    description: 'Chiếc hoodie mang hơi hướng Cyberpunk và Grunge hiện đại với kỹ thuật xử lý giặt Acid Wash độc quyền. Chất liệu nỉ bông chần cao cấp định lượng 420gsm giữ form chuẩn boxy, tay áo phồng nhẹ cá tính.',
    details: {
      material: 'Nỉ bông chần 420gsm 100% cotton cao cấp',
      fit: 'Form Boxy Oversized hiện đại, vai rơi',
      care: 'Giặt lộn mặt trái, sấy nhiệt độ thấp, không ủi trực tiếp lên hình in',
    },
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Xám Khói Acid', hex: '#4b5563', inStock: true },
      { name: 'Đen Washed', hex: '#1f2937', inStock: true },
      { name: 'Rêu Rêu Vintage', hex: '#374151', inStock: true },
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    stockQuantity: 45,
    rating: 4.9,
    numReviews: 28,
    featured: true,
    isNewArrival: true,
    isBestSeller: true,
    tags: ['Streetwear', 'Oversized', 'AcidWash', 'Hoodie', 'Unisex'],
  },
  {
    name: 'Áo Thun Typography AURA Matrix Heavyweight Tee',
    category: 'Áo thun',
    price: 360000,
    originalPrice: 450000,
    description: 'Mẫu áo thun best-seller với chất liệu 100% Cotton 2 chiều dệt sợi chải kỹ định lượng 260gsm dày dặn, thấm hút mồ hôi vượt trội và không bao giờ xù lông. Họa tiết in lụa nổi cao cấp không bong tróc.',
    details: {
      material: '100% Cotton 2-way định lượng 260gsm dày mịn',
      fit: 'Oversized Streetwear rộng rãi thoáng mát',
      care: 'Giặt máy bình thường, phơi ngang áo tránh giãn cổ',
    },
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Trắng Ngà (Off-White)', hex: '#f4f4f5', inStock: true },
      { name: 'Đen Jet Black', hex: '#18181b', inStock: true },
      { name: 'Xanh Rêu Đậm', hex: '#27272a', inStock: true },
    ],
    sizes: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    stockQuantity: 120,
    rating: 4.8,
    numReviews: 42,
    featured: true,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['Tee', 'Cotton', 'Streetwear', 'Heavyweight', 'Unisex'],
  },
  {
    name: 'Áo Khoác Bomber Da Lộn Minimalist Zip Jacket',
    category: 'Áo khoác',
    price: 950000,
    originalPrice: 1200000,
    description: 'Áo bomber da lộn lót dù trần bông cao cấp, khóa kéo kim loại hai chiều YKK mạ crom bóng bẩy. Thiết kế thanh lịch nhưng không làm mất đi chất ngầu phóng khoáng của văn hóa đường phố.',
    details: {
      material: 'Chất liệu da lộn nhân tạo cao cấp bề mặt mềm mịn, lót gió chống thấm',
      fit: 'Form Regular fit thoải mái, bo gấu tay co giãn',
      care: 'Nên giặt khô hoặc lau bề mặt bằng khăn ẩm mềm',
    },
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Nâu Cà Phê (Mocha)', hex: '#523a28', inStock: true },
      { name: 'Đen Tuyển (Matte Black)', hex: '#1c1917', inStock: true },
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true },
    ],
    stockQuantity: 32,
    rating: 5.0,
    numReviews: 19,
    featured: true,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['Bomber', 'Leather', 'Luxury', 'Streetwear', 'Jacket'],
  },
  {
    name: 'Quần Cargo Nhiều Túi Parachute Trousers',
    category: 'Quần & Shorts',
    price: 520000,
    originalPrice: 650000,
    description: 'Quần dù dùi parachute phong cách techwear với 6 túi tiện dụng, có dây rút gấu quần để bạn có thể điều chỉnh giữa dáng thụng suông và jogger bo ống chỉ trong 3 giây.',
    details: {
      material: 'Chất vải dù gân ripstop chống xước và cản gió nhẹ',
      fit: 'Baggy Relaxed fit, đai chun kèm khóa điều chỉnh',
      care: 'Giặt máy nước mát, phơi nơi râm mát',
    },
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Xanh Rêu Quân Đội (Army Green)', hex: '#3f4e3c', inStock: true },
      { name: 'Đen Phantom', hex: '#0f172a', inStock: true },
      { name: 'Xám Xi Măng', hex: '#64748b', inStock: true },
    ],
    sizes: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    stockQuantity: 60,
    rating: 4.7,
    numReviews: 35,
    featured: true,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['Cargo', 'Techwear', 'Pants', 'Parachute', 'Unisex'],
  },
  {
    name: 'Áo Sơ Mi Cubian Collar Họa Tiết Retro Abstract',
    category: 'Sơ mi',
    price: 420000,
    originalPrice: 520000,
    description: 'Áo sơ mi cổ Cuba phong cách phóng khoáng với chất liệu lụa viscose rũ nhẹ, bay bổng. Họa tiết abstract mang đậm phong cách nghệ thuật retro thời thượng.',
    details: {
      material: 'Lụa tuyết Viscose tự nhiên mát lạnh',
      fit: 'Form Loose fit phóng khoáng rũ nhẹ',
      care: 'Ủi ở nhiệt độ trung bình hoặc ủi hơi nước',
    },
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Họa Tiết Xám Đen', hex: '#334155', inStock: true },
      { name: 'Họa Tiết Trắng Cát', hex: '#e2e8f0', inStock: true },
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    stockQuantity: 40,
    rating: 4.9,
    numReviews: 15,
    featured: false,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['Shirt', 'CubanCollar', 'Retro', 'Summer', 'Unisex'],
  },
  {
    name: 'Quần Jeans Ống Rộng Rách Vintage Wide-Leg Denim',
    category: 'Quần & Shorts',
    price: 620000,
    originalPrice: 790000,
    description: 'Chất bò denim 13oz bền bỉ với màu wash xanh sáng cổ điển thập niên 90. Các vết rách xước và mài thủ công tạo nên điểm nhấn bất quy tắc đầy cuốn hút.',
    details: {
      material: '100% Bò denim dệt thoi 13oz không co giãn',
      fit: 'Wide Leg ống thụng suông dài phủ giày',
      care: 'Lộn trái khi phơi, giặt lần đầu bằng nước muối loãng để giữ màu lâu',
    },
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Xanh Wash Cổ Điển', hex: '#60a5fa', inStock: true },
      { name: 'Đen Khói Rách Nhẹ', hex: '#374151', inStock: true },
    ],
    sizes: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    stockQuantity: 50,
    rating: 4.8,
    numReviews: 22,
    featured: false,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['Jeans', 'Denim', 'WideLeg', 'Vintage', 'Streetwear'],
  },
  {
    name: 'Áo Len Dệt Kim Distressed Knitted Sweater',
    category: 'Áo khoác',
    price: 580000,
    originalPrice: 720000,
    description: 'Mẫu áo len dệt kim sợi to phong cách Grunge rách gấu độc đáo. Thiết kế unisex giữ ấm tốt cho mùa thu đông nhưng vẫn cực kỳ trendy khi phối layer với sơ mi hay áo thun bên trong.',
    details: {
      material: 'Sợi len acrylic mềm mại không ngứa da',
      fit: 'Oversized vai trễ rủ nhẹ',
      care: 'Giặt tay nhẹ nhàng, phơi nằm ngang trên mặt phẳng',
    },
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Xanh Rêu Rêu', hex: '#2d3748', inStock: true },
      { name: 'Kem Nâu Cát', hex: '#e2d9cc', inStock: true },
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
    ],
    stockQuantity: 25,
    rating: 4.9,
    numReviews: 12,
    featured: true,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['Sweater', 'Knitted', 'Winter', 'Distressed', 'Unisex'],
  },
  {
    name: 'Chân Váy Chữ A Túi Hộp Xếp Ly Cargo Skirt',
    category: 'Váy & Đầm',
    price: 410000,
    originalPrice: 490000,
    description: 'Chân váy chữ A cá tính kết hợp các chi tiết túi hộp và xếp ly chuẩn phong cách Y2K Cyberpunk. Tích hợp quần bảo hộ mềm mại bên trong giúp tự tin trong mọi chuyển động.',
    details: {
      material: 'Chất kaki thun co giãn nhẹ giữ nếp tốt',
      fit: 'Dáng chữ A cạp cao tôn dáng kèm quần bảo hộ bên trong',
      care: 'Giặt máy bình thường',
    },
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Đen Tuyền', hex: '#111827', inStock: true },
      { name: 'Màu Khaki Cát', hex: '#d4b996', inStock: true },
    ],
    sizes: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
    ],
    stockQuantity: 38,
    rating: 4.8,
    numReviews: 17,
    featured: false,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['Skirt', 'Y2K', 'Cargo', 'Fashion', 'Women'],
  },
  {
    name: 'Túi Đeo Chéo Tactical Crossbody Bag Chống Nước',
    category: 'Phụ kiện',
    price: 290000,
    originalPrice: 380000,
    description: 'Túi đeo chéo phong cách Tactical Techwear với vải Cordura 1000D chống thấm nước, nhiều ngăn chứa phụ kiện công nghệ, điện thoại và ví. Quai đeo chịu lực êm ái tháo lắp nhanh.',
    details: {
      material: 'Vải chống thấm Cordura phủ PU chịu lực',
      fit: 'Dây đeo có thể tăng giảm chiều dài từ 70cm - 130cm',
      care: 'Lau sạch bằng khăn ướt khi dính bẩn',
    },
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Đen All Black', hex: '#0a0a0a', inStock: true },
      { name: 'Xám Kim Loại', hex: '#4b5563', inStock: true },
    ],
    sizes: [
      { size: 'Free Size', inStock: true },
    ],
    stockQuantity: 70,
    rating: 4.9,
    numReviews: 54,
    featured: true,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['Accessories', 'Bag', 'Techwear', 'Waterproof'],
  },
  {
    name: 'Mũ Lưỡi Trai Vintage Washed Cap Thêu Nổi',
    category: 'Phụ kiện',
    price: 190000,
    originalPrice: 250000,
    description: 'Nón kết form mềm unisex phong cách dad cap retro với chất vải cotton wash bạc màu tự nhiên, logo chữ thêu nổi sắc nét và khóa cài kim loại đồng cổ điển sang trọng.',
    details: {
      material: '100% Cotton Washed mềm mại thấm mồ hôi',
      fit: 'Vòng đầu từ 54 - 60cm có đai khóa kim loại đồng chỉnh kích thước',
      care: 'Nên giặt tay nhẹ để giữ form nón chuẩn nhất',
    },
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Đen Washed', hex: '#262626', inStock: true },
      { name: 'Xanh Navy Bạc', hex: '#1e293b', inStock: true },
      { name: 'Nâu Cổ Điển', hex: '#78350f', inStock: true },
    ],
    sizes: [
      { size: 'Free Size', inStock: true },
    ],
    stockQuantity: 85,
    rating: 4.8,
    numReviews: 31,
    featured: false,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['Cap', 'Hat', 'Vintage', 'Accessories', 'Streetwear'],
  },
  {
    name: 'Áo Khoác Varsity Leather Sleeve Phối Da Bóng',
    category: 'Áo khoác',
    price: 890000,
    originalPrice: 1150000,
    description: 'Áo khoác bóng chày học đường phong cách đại học Mỹ kinh điển. Thân áo dạ mịn ấm áp phối cùng tay áo da PU chống nứt gãy và các miếng vá chenille thêu nổi tỉ mỉ.',
    details: {
      material: 'Thân vải dạ ép mịn phối tay da PU cao cấp, trần bông quả trám bên trong',
      fit: 'Form Boxy thể thao năng động',
      care: 'Giặt khô hoặc lau chùi tay da cẩn thận',
    },
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Xanh Rêu Phối Kem', hex: '#1e3a1e', inStock: true },
      { name: 'Đen Phối Trắng Tinh', hex: '#18181b', inStock: true },
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    stockQuantity: 28,
    rating: 5.0,
    numReviews: 24,
    featured: true,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['Varsity', 'Jacket', 'Vintage', 'Streetwear', 'Winter'],
  },
  {
    name: 'Quần Short Nỉ Thể Thao Raw Cut Hem Sweatshorts',
    category: 'Quần & Shorts',
    price: 280000,
    originalPrice: 350000,
    description: 'Quần đùi nỉ chân cua 350gsm êm ái với gấu cắt thô cá tính. Chiều dài ngang đùi tôn dáng, phù hợp mặc hằng ngày, đi cà phê, dạo phố hoặc tập gym.',
    details: {
      material: 'Vải nỉ chân cua 100% cotton thoáng khí',
      fit: 'Above-the-knee chiều dài trên đầu gối',
      care: 'Giặt máy thoải mái',
    },
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Xám Tiêu (Heather Grey)', hex: '#9ca3af', inStock: true },
      { name: 'Đen Cơ Bản', hex: '#111827', inStock: true },
      { name: 'Kem Vanilla', hex: '#f5f5f4', inStock: true },
    ],
    sizes: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    stockQuantity: 90,
    rating: 4.7,
    numReviews: 38,
    featured: false,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['Shorts', 'Summer', 'Sweatshorts', 'Streetwear'],
  },
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Đang kiểm tra dữ liệu khởi tạo...');
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`ℹ️ Đã có sẵn ${productCount} sản phẩm trong cơ sở dữ liệu MongoDB.`);
      return;
    }

    console.log('⚡ Đang tự động nạp dữ liệu mẫu ban đầu cho cửa hàng thời trang...');

    // 1. Seed Users (Admin & Customer)
    await User.deleteMany({});
    const adminUser = await User.create({
      name: 'Admin AURA Fashion',
      email: 'admin@streetwear.vn',
      password: 'admin123',
      role: 'admin',
      phone: '0901234567',
      address: {
        street: '88 Nguyễn Huệ',
        ward: 'Bến Nghé',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    const demoCustomer = await User.create({
      name: 'Nguyễn Hoàng Phúc',
      email: 'khachhang@gmail.com',
      password: 'user123',
      role: 'customer',
      phone: '0987654321',
      address: {
        street: '124 Hoàng Diệu 2',
        ward: 'Linh Chiểu',
        district: 'Thành phố Thủ Đức',
        city: 'TP. Hồ Chí Minh',
      },
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });

    // 2. Seed Products
    await Product.deleteMany({});
    const createdProducts = [];
    for (const p of initialProducts) {
      const prod = await Product.create(p);
      createdProducts.push(prod);
    }

    // Add sample reviews to the first product
    const firstProduct = createdProducts[0];
    firstProduct.reviews.push(
      {
        user: demoCustomer._id,
        userName: demoCustomer.name,
        userAvatar: demoCustomer.avatar,
        rating: 5,
        comment: 'Chất vải nỉ dày dặn chuẩn form boxy như hình, giặt xong không hề bị xù hay bay màu! Rất ưng ý shop ơi.',
      },
      {
        user: adminUser._id,
        userName: 'Trần Minh Anh',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'Giao hàng hỏa tốc trong 2 tiếng, đóng hộp quà packaging sang xịn mịn. Sẽ ủng hộ dài dài.',
      }
    );
    firstProduct.numReviews = 2;
    firstProduct.rating = 5.0;
    await firstProduct.save();

    // 3. Seed Coupons
    await Coupon.deleteMany({});
    await Coupon.insertMany([
      {
        code: 'STREETWEAR20',
        discountType: 'percent',
        discountValue: 20,
        minOrderValue: 300000,
        maxDiscount: 100000,
        description: 'Giảm 20% tối đa 100k cho đơn từ 300k',
        isActive: true,
      },
      {
        code: 'FREESHIP',
        discountType: 'fixed',
        discountValue: 30000,
        minOrderValue: 200000,
        description: 'Miễn phí giao hàng toàn quốc trị giá 30k',
        isActive: true,
      },
      {
        code: 'VIP50K',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 500000,
        description: 'Giảm ngay 50.000₫ cho đơn hàng từ 500k',
        isActive: true,
      },
    ]);

    // 4. Seed a sample order
    await Order.deleteMany({});
    await Order.create({
      user: demoCustomer._id,
      orderCode: 'AURA-839201',
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          image: createdProducts[0].images[0],
          price: createdProducts[0].price,
          size: 'L',
          color: 'Xám Khói Acid',
          quantity: 1,
        },
        {
          product: createdProducts[1]._id,
          name: createdProducts[1].name,
          image: createdProducts[1].images[0],
          price: createdProducts[1].price,
          size: 'M',
          color: 'Trắng Ngà (Off-White)',
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: demoCustomer.name,
        phone: demoCustomer.phone,
        address: demoCustomer.address.street,
        ward: demoCustomer.address.ward,
        district: demoCustomer.address.district,
        city: demoCustomer.address.city,
        note: 'Giao giờ hành chính giúp mình',
      },
      shippingMethod: 'standard',
      paymentMethod: 'VIETQR',
      paymentStatus: 'Paid',
      orderStatus: 'Shipping',
      itemsPrice: 1040000,
      shippingPrice: 0,
      discountAmount: 100000,
      totalPrice: 940000,
      couponCode: 'STREETWEAR20',
      timeline: [
        {
          status: 'Pending',
          title: 'Đơn hàng đã được khởi tạo',
          description: 'Khách hàng hoàn tất thanh toán qua VietQR.',
          time: new Date(Date.now() - 86400000),
        },
        {
          status: 'Processing',
          title: 'Đã xác nhận & Đang đóng gói',
          description: 'Nhân viên kho đã kiểm tra chất lượng và dán tem niêm phong.',
          time: new Date(Date.now() - 43200000),
        },
        {
          status: 'Shipping',
          title: 'Bàn giao cho đơn vị vận chuyển GHN',
          description: 'Mã vận đơn GHN: #VN89230193. Dự kiến giao hôm nay.',
          time: new Date(),
        },
      ],
    });

    console.log('🎉 Khởi tạo dữ liệu mẫu thành công với đầy đủ sản phẩm, user, mã giảm giá và đơn hàng!');
  } catch (error) {
    console.error('❌ Lỗi nạp dữ liệu mẫu:', error);
  }
};

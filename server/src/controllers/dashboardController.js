import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const orders = await Order.find();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded');
    const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const todayRevenue = validOrders
      .filter((o) => new Date(o.createdAt) >= startOfToday)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const monthRevenue = validOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
    const processingOrders = orders.filter((o) => o.orderStatus === 'Processing').length;
    const shippingOrders = orders.filter((o) => o.orderStatus === 'Shipping').length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;
    const refundedOrders = orders.filter((o) => o.orderStatus === 'Refunded').length;

    // Calculate total physical stock across all products
    const allProducts = await Product.find().select('stock name category price variants images');
    const totalStock = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = allProducts.filter((p) => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length;
    const outOfStockCount = allProducts.filter((p) => (p.stock || 0) <= 0).length;

    // Conversion rate approximation (completed orders / (total visits or users))
    const conversionRate = totalUsers > 0 ? ((completedOrders / totalUsers) * 100).toFixed(1) : '3.8';

    // 7 Days Revenue & Orders Chart
    const chartDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

      const dayOrders = validOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      const dayRev = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      chartDays.push({
        date: dayLabel,
        revenue: dayRev,
        orders: dayOrders.length,
      });
    }

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Top products
    const topProducts = await Product.find()
      .sort({ isBestSeller: -1, rating: -1, numReviews: -1 })
      .limit(5);

    // Category breakdown
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        todayRevenue,
        monthRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        shippingOrders,
        completedOrders,
        cancelledOrders,
        refundedOrders,
        totalProducts,
        totalUsers,
        totalStock,
        lowStockCount,
        outOfStockCount,
        conversionRate,
      },
      chartData: chartDays,
      recentOrders,
      topProducts,
      categoryStats,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get Users list with order counts & total spent
 */
export const getUsersList = async (req, res) => {
  try {
    const { search = '', role } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'All') {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Aggregate user spending and order count
    const orders = await Order.find({ orderStatus: { $nin: ['Cancelled', 'Refunded'] } });
    const userOrderMap = {};

    orders.forEach((ord) => {
      const uId = ord.user ? ord.user.toString() : null;
      if (uId) {
        if (!userOrderMap[uId]) {
          userOrderMap[uId] = { count: 0, spent: 0 };
        }
        userOrderMap[uId].count += 1;
        userOrderMap[uId].spent += ord.totalPrice || 0;
      }
    });

    const enrichedUsers = users.map((u) => {
      const stats = userOrderMap[u._id.toString()] || { count: 0, spent: 0 };
      return {
        ...u.toObject(),
        orderCount: stats.count,
        totalSpent: stats.spent,
      };
    });

    res.json({ success: true, users: enrichedUsers });
  } catch (error) {
    console.error('getUsersList error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách người dùng' });
  }
};

/**
 * Admin: Toggle Ban / Unban User
 */
export const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản Quản trị viên' });
    }

    user.isBanned = !user.isBanned;
    if (user.isBanned) {
      // Invalidate current sessions immediately
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? `Đã khóa tài khoản ${user.name}` : `Đã mở khóa tài khoản ${user.name}`,
      isBanned: user.isBanned,
    });
  } catch (error) {
    console.error('toggleUserBan error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái tài khoản' });
  }
};

/**
 * Admin: Reset User Password
 */
export const adminResetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Force re-login
    await user.save();

    res.json({
      success: true,
      message: `Đã thiết lập lại mật khẩu thành công cho ${user.name}`,
    });
  } catch (error) {
    console.error('adminResetUserPassword error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đặt lại mật khẩu' });
  }
};

/**
 * Admin: Get Inventory & Low-Stock Alerts
 */
export const getInventoryStats = async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: 1 });

    const lowStockThreshold = 5;
    const lowStockItems = [];
    const outOfStockItems = [];
    const healthyItems = [];

    products.forEach((p) => {
      const stock = p.stock || 0;
      if (stock === 0) {
        outOfStockItems.push(p);
      } else if (stock <= lowStockThreshold) {
        lowStockItems.push(p);
      } else {
        healthyItems.push(p);
      }
    });

    res.json({
      success: true,
      summary: {
        totalProducts: products.length,
        outOfStockCount: outOfStockItems.length,
        lowStockCount: lowStockItems.length,
        healthyCount: healthyItems.length,
      },
      lowStockItems,
      outOfStockItems,
      allProducts: products,
    });
  } catch (error) {
    console.error('getInventoryStats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp thông tin kho hàng' });
  }
};

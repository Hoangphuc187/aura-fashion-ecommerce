import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return order.orderStatus !== 'Cancelled' ? sum + order.totalPrice : sum;
    }, 0);

    const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Best sellers
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
        totalOrders,
        pendingOrders,
        completedOrders,
        totalProducts,
        totalUsers,
      },
      recentOrders,
      topProducts,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

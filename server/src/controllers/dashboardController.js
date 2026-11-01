import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { executeDashboardAnalyticsProcedure } from '../procedures/analyticsProcedure.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../config/logger.js';

/**
 * Admin: Get Dashboard Analytics via Database Stored Procedure
 * Replaces high-memory JS loops with C++ native MongoDB $facet aggregation pipeline.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await executeDashboardAnalyticsProcedure();

    // Fetch recent orders for admin table
    const recentOrders = await Order.find()
      .populate('user', 'name email uuid')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Top products
    const topProducts = await Product.find()
      .sort({ isBestSeller: -1, rating: -1, numReviews: -1 })
      .limit(5)
      .lean();

    return ApiResponse.success(res, {
      message: 'Nạp dữ liệu thống kê quản trị thành công',
      data: {
        stats: {
          totalRevenue: stats.totalRevenue,
          todayRevenue: stats.todayRevenue,
          monthRevenue: stats.monthRevenue,
          totalOrders: stats.totalOrders,
          pendingOrders: stats.pendingOrders,
          processingOrders: stats.processingOrders,
          shippingOrders: stats.shippingOrders,
          completedOrders: stats.completedOrders,
          cancelledOrders: stats.cancelledOrders,
          refundedOrders: stats.refundedOrders,
          totalProducts: stats.totalProducts,
          totalUsers: stats.totalUsers,
          totalStock: stats.totalStock,
          lowStockCount: stats.lowStockCount,
          outOfStockCount: stats.outOfStockCount,
          conversionRate: stats.conversionRate,
        },
        chartData: stats.chartDays,
        recentOrders,
        topProducts,
        categoryStats: stats.categoryStats,
      },
    });
  } catch (error) {
    logger.error(`getDashboardStats error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, {
      message: 'Không thể tính toán thống kê bảng điều khiển',
      statusCode: 500,
      errors: error.message,
    });
  }
};

/**
 * Admin: Get Users list with Database Aggregation ($lookup join)
 */
export const getUsersList = async (req, res) => {
  try {
    const { search = '', role } = req.query;
    const matchStage = {};

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'All') {
      matchStage.role = role;
    }

    // High-performance MongoDB $lookup pipeline (Zero in-memory JavaScript looping)
    const enrichedUsers = await User.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $not: { $in: ['$orderStatus', ['Cancelled', 'Refunded']] } },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                spent: { $sum: '$totalPrice' },
              },
            },
          ],
          as: 'orderStats',
        },
      },
      {
        $project: {
          password: 0,
          twoFactorOtp: 0,
          resetPasswordToken: 0,
        },
      },
      {
        $addFields: {
          orderCount: { $ifNull: [{ $arrayElemAt: ['$orderStats.count', 0] }, 0] },
          totalSpent: { $ifNull: [{ $arrayElemAt: ['$orderStats.spent', 0] }, 0] },
        },
      },
      { $project: { orderStats: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    return ApiResponse.success(res, {
      message: 'Nạp danh sách người dùng thành công',
      data: { users: enrichedUsers },
    });
  } catch (error) {
    logger.error(`getUsersList error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, {
      message: 'Lỗi nạp danh sách người dùng',
      statusCode: 500,
      errors: error.message,
    });
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
      return ApiResponse.error(res, { message: 'Không tìm thấy người dùng', statusCode: 404 });
    }

    if (user.role === 'admin') {
      return ApiResponse.error(res, { message: 'Không thể khóa tài khoản Quản trị viên', statusCode: 400 });
    }

    user.isBanned = !user.isBanned;
    if (user.isBanned) {
      user.tokenVersion = (user.tokenVersion || 0) + 1; // Revoke JWT sessions immediately
    }
    await user.save();

    logger.info(`User ${user.email} ban state toggled to ${user.isBanned}`, { requestId: req.id });

    return ApiResponse.success(res, {
      message: user.isBanned ? `Đã khóa tài khoản ${user.name}` : `Đã mở khóa tài khoản ${user.name}`,
      data: { isBanned: user.isBanned },
    });
  } catch (error) {
    logger.error(`toggleUserBan error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi cập nhật trạng thái tài khoản', statusCode: 500 });
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
      return ApiResponse.error(res, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự', statusCode: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return ApiResponse.error(res, { message: 'Không tìm thấy người dùng', statusCode: 404 });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Force re-login
    await user.save();

    logger.info(`Admin reset password for user: ${user.email}`, { requestId: req.id });

    return ApiResponse.success(res, {
      message: `Đã thiết lập lại mật khẩu thành công cho ${user.name}`,
    });
  } catch (error) {
    logger.error(`adminResetUserPassword error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi đặt lại mật khẩu', statusCode: 500 });
  }
};

/**
 * Admin: Get Inventory & Low-Stock Alerts via Database Aggregation
 */
export const getInventoryStats = async (req, res) => {
  try {
    const products = await Product.find().sort({ stockQuantity: 1 }).lean();

    const lowStockThreshold = 5;
    const lowStockItems = [];
    const outOfStockItems = [];
    const healthyItems = [];

    products.forEach((p) => {
      const stock = p.stockQuantity !== undefined ? p.stockQuantity : p.stock || 0;
      if (stock <= 0) {
        outOfStockItems.push(p);
      } else if (stock <= lowStockThreshold) {
        lowStockItems.push(p);
      } else {
        healthyItems.push(p);
      }
    });

    return ApiResponse.success(res, {
      message: 'Nạp thông tin tồn kho thành công',
      data: {
        summary: {
          totalProducts: products.length,
          outOfStockCount: outOfStockItems.length,
          lowStockCount: lowStockItems.length,
          healthyCount: healthyItems.length,
        },
        lowStockItems,
        outOfStockItems,
        allProducts: products,
      },
    });
  } catch (error) {
    logger.error(`getInventoryStats error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi nạp thông tin kho hàng', statusCode: 500 });
  }
};

/**
 * Admin: Real-time Structured Logging Stack Inspection API
 * Allows Tech Lead / Admin to inspect recent centralized logs directly via API
 */
export const getSystemLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = logger.getRecentLogs(limit);

    return ApiResponse.success(res, {
      message: 'Nạp nhật ký hệ thống thành công',
      data: { logs, count: logs.length },
      meta: {
        logStack: 'Winston + DailyRotateFile + MemoryBuffer',
        traceId: req.id,
      },
    });
  } catch (error) {
    return ApiResponse.error(res, { message: 'Lỗi nạp nhật ký hệ thống', statusCode: 500 });
  }
};

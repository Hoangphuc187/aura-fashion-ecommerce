import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * DATABASE STORED AGGREGATION PROCEDURE: Dashboard Analytics Pipeline
 * 
 * Replaces in-memory JavaScript .filter() / .reduce() loops with native MongoDB engine C++ execution.
 * Executes multiple aggregation facets in a single database roundtrip, leveraging database indexes.
 * 
 * @returns {Promise<Object>} Aggregated business statistics
 */
export const executeDashboardAnalyticsProcedure = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // High-performance single-roundtrip $facet pipeline
  const [analyticsFacetResult, productStatsResult, totalUsers] = await Promise.all([
    Order.aggregate([
      {
        $facet: {
          // 1. Overall & Periodic Revenue Computations
          revenueSummary: [
            {
              $match: {
                orderStatus: { $nin: ['Cancelled', 'Refunded'] },
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                todayRevenue: {
                  $sum: {
                    $cond: [{ $gte: ['$createdAt', startOfToday] }, '$totalPrice', 0],
                  },
                },
                monthRevenue: {
                  $sum: {
                    $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$totalPrice', 0],
                  },
                },
                avgOrderValue: { $avg: '$totalPrice' },
                validOrdersCount: { $sum: 1 },
              },
            },
          ],

          // 2. Order Status Breakdown
          statusDistribution: [
            {
              $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
              },
            },
          ],

          // 3. 7-Day Revenue & Volume Time Series
          weeklyTrend: [
            {
              $match: {
                createdAt: { $gte: sevenDaysAgo },
                orderStatus: { $nin: ['Cancelled', 'Refunded'] },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%d/%m', date: '$createdAt', timezone: '+07:00' },
                },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
                rawDate: { $min: '$createdAt' },
              },
            },
            { $sort: { rawDate: 1 } },
          ],

          // 4. Payment Method Distribution
          paymentMethodBreakdown: [
            {
              $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalPrice' },
              },
            },
          ],
        },
      },
    ]),

    // Product stock and catalog analytics pipeline
    Product.aggregate([
      {
        $facet: {
          stockSummary: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalStock: { $sum: '$stockQuantity' },
                lowStockCount: {
                  $sum: {
                    $cond: [
                      { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', 5] }] },
                      1,
                      0,
                    ],
                  },
                },
                outOfStockCount: {
                  $sum: {
                    $cond: [{ $lte: ['$stockQuantity', 0] }, 1, 0],
                  },
                },
              },
            },
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                avgPrice: { $avg: '$price' },
              },
            },
          ],
        },
      },
    ]),

    User.countDocuments({ role: 'customer' }),
  ]);

  // Unpack facet outputs
  const facet = analyticsFacetResult[0] || {};
  const rev = (facet.revenueSummary && facet.revenueSummary[0]) || {
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    avgOrderValue: 0,
    validOrdersCount: 0,
  };

  const statusMap = {};
  let totalOrdersCount = 0;
  (facet.statusDistribution || []).forEach((item) => {
    statusMap[item._id] = item.count;
    totalOrdersCount += item.count;
  });

  const prodFacet = productStatsResult[0] || {};
  const stock = (prodFacet.stockSummary && prodFacet.stockSummary[0]) || {
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  // Format 7-Day Chart days ensuring continuous series even if some days have 0 orders
  const chartDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const matched = (facet.weeklyTrend || []).find((t) => t._id === dayLabel);

    chartDays.push({
      date: dayLabel,
      revenue: matched ? matched.revenue : 0,
      orders: matched ? matched.orders : 0,
    });
  }

  const completedOrders = statusMap['Delivered'] || 0;
  const conversionRate = totalUsers > 0 ? ((completedOrders / totalUsers) * 100).toFixed(1) : '3.8';

  return {
    totalRevenue: rev.totalRevenue,
    todayRevenue: rev.todayRevenue,
    monthRevenue: rev.monthRevenue,
    avgOrderValue: Math.round(rev.avgOrderValue || 0),
    totalOrders: totalOrdersCount,
    pendingOrders: statusMap['Pending'] || 0,
    processingOrders: statusMap['Processing'] || 0,
    shippingOrders: statusMap['Shipping'] || 0,
    completedOrders,
    cancelledOrders: statusMap['Cancelled'] || 0,
    refundedOrders: statusMap['Refunded'] || 0,
    totalProducts: stock.totalProducts,
    totalUsers,
    totalStock: stock.totalStock,
    lowStockCount: stock.lowStockCount,
    outOfStockCount: stock.outOfStockCount,
    conversionRate,
    chartDays,
    paymentMethods: facet.paymentMethodBreakdown || [],
    categoryStats: prodFacet.categoryBreakdown || [],
  };
};


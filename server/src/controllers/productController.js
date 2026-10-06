import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { escapeRegex } from '../middleware/sanitize.js';
import { memoryCache } from '../utils/cache.js';

export const invalidateProductCache = () => {
  memoryCache.invalidatePrefix('products_');
  memoryCache.del('featured_trending');
  memoryCache.del('filter_metadata');
};

export const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      size,
      color,
      tag,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const query = {};

    // Search keyword with ReDoS protection (escaped regex)
    if (keyword && typeof keyword === 'string' && keyword.trim()) {
      const cleanKeyword = escapeRegex(keyword.trim());
      query.$or = [
        { name: { $regex: cleanKeyword, $options: 'i' } },
        { description: { $regex: cleanKeyword, $options: 'i' } },
        { tags: { $in: [new RegExp(cleanKeyword, 'i')] } },
      ];
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'Tất cả') {
      query.category = category;
    }

    // Tag filter with ReDoS protection
    if (tag && typeof tag === 'string' && tag.trim()) {
      const cleanTag = escapeRegex(tag.trim());
      query.tags = { $in: [new RegExp(cleanTag, 'i')] };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Math.max(0, Number(minPrice));
      if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Math.max(0, Number(maxPrice));
    }

    // Size filter
    if (size && typeof size === 'string') {
      query['sizes.size'] = size.trim();
    }

    // Color filter
    if (color && typeof color === 'string') {
      query['colors.name'] = color.trim();
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'bestseller') sortOption = { isBestSeller: -1, rating: -1 };

    // DoS Protection: Cap page and limit parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12)); // Maximum 100 per page
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const responsePayload = {
      success: true,
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      total,
    };

    memoryCache.set(cacheKey, responsePayload, 30); // 30s cache TTL
    res.setHeader('X-Cache', 'MISS');
    res.json(responsePayload);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách sản phẩm' });
  }
};

export const getFeaturedAndTrending = async (req, res) => {
  try {
    const cacheKey = 'featured_trending';
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const [featured, bestSellers, newArrivals] = await Promise.all([
      Product.find({ featured: true }).limit(8).lean(),
      Product.find({ isBestSeller: true }).limit(8).lean(),
      Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const responsePayload = {
      success: true,
      featured,
      bestSellers,
      newArrivals,
    };

    memoryCache.set(cacheKey, responsePayload, 60); // 60s cache TTL
    res.setHeader('X-Cache', 'MISS');
    res.json(responsePayload);
  } catch (error) {
    console.error('getFeaturedAndTrending error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp sản phẩm nổi bật' });
  }
};

export const getProductByIdOrSlug = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: id }).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4).lean();

    res.json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    console.error('getProductByIdOrSlug error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp chi tiết sản phẩm' });
  }
};

/**
 * Create Product (Admin Only)
 * Protected against Mass Assignment
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      description,
      details,
      images,
      colors,
      sizes,
      stockQuantity,
      featured,
      isBestSeller,
      isNewArrival,
      tags,
    } = req.body;

    if (!name || !category || price === undefined || !description) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tên, danh mục, giá và mô tả sản phẩm.' });
    }

    const newProduct = new Product({
      name: String(name).trim(),
      category: String(category).trim(),
      price: Math.max(0, Number(price) || 0),
      originalPrice: Math.max(0, Number(originalPrice) || 0),
      description: String(description).trim(),
      details: details || {},
      images: Array.isArray(images) ? images : [],
      colors: Array.isArray(colors) ? colors : [{ name: 'Đen', hex: '#111111', inStock: true }],
      sizes: Array.isArray(sizes) ? sizes : [
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      stockQuantity: Math.max(0, parseInt(stockQuantity, 10) || 50),
      featured: Boolean(featured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
      tags: Array.isArray(tags) ? tags : [],
    });

    const savedProduct = await newProduct.save();
    invalidateProductCache();
    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      product: savedProduct,
    });
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update Product (Admin Only)
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const allowedUpdates = [
      'name',
      'category',
      'price',
      'originalPrice',
      'description',
      'details',
      'images',
      'colors',
      'sizes',
      'stockQuantity',
      'featured',
      'isBestSeller',
      'isNewArrival',
      'tags',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updated = await product.save();
    invalidateProductCache();

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      product: updated,
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete Product (Admin Only)
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    await Product.findByIdAndDelete(req.params.id);
    invalidateProductCache();
    res.json({ success: true, message: 'Xoá sản phẩm thành công' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xoá sản phẩm' });
  }
};

/**
 * Add Product Review
 */
export const addReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // 1. Strict Rule: User must have purchased this product AND order status must be 'Delivered'
    const eligibleOrder = await Order.findOne({
      $or: [
        { user: req.user._id },
        ...(req.user.phone ? [{ 'shippingAddress.phone': req.user.phone.trim() }] : []),
        ...(req.user.email ? [{ 'shippingAddress.email': req.user.email.toLowerCase().trim() }] : []),
      ],
      'orderItems.product': req.params.id,
      orderStatus: 'Delivered',
    });

    if (!eligibleOrder) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng và đơn hàng được giao thành công!',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Số sao đánh giá phải từ 1 đến 5' });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung đánh giá' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    // Sanitize image URLs / base64
    const validImages = Array.isArray(images)
      ? images
          .filter((img) => typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:image')))
          .slice(0, 5)
      : [];

    const review = {
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      rating: numRating,
      comment: comment.trim(),
      images: validImages,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    invalidateProductCache();
    res.status(201).json({
      success: true,
      message: 'Thêm đánh giá thành công!',
      rating: Number(product.rating.toFixed(1)),
      numReviews: product.numReviews,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error('addReview error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Check if the current logged-in user is eligible to review this product
 * (Must have an order containing this product with status 'Delivered' and haven't reviewed yet)
 */
export const checkReviewEligibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const alreadyReviewed = product.reviews.some(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );

    const eligibleOrder = await Order.findOne({
      $or: [
        { user: req.user._id },
        ...(req.user.phone ? [{ 'shippingAddress.phone': req.user.phone.trim() }] : []),
        ...(req.user.email ? [{ 'shippingAddress.email': req.user.email.toLowerCase().trim() }] : []),
      ],
      'orderItems.product': req.params.id,
      orderStatus: 'Delivered',
    });

    res.json({
      success: true,
      canReview: Boolean(eligibleOrder && !alreadyReviewed),
      alreadyReviewed,
      hasDeliveredOrder: Boolean(eligibleOrder),
    });
  } catch (error) {
    console.error('checkReviewEligibility error:', error);
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền đánh giá' });
  }
};

/**
 * Filter Metadata
 */
export const getFilterMetadata = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const tags = await Product.distinct('tags');
    res.json({
      success: true,
      categories,
      tags,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi nạp metadata bộ lọc' });
  }
};

/**
 * Admin: Get all reviews across all products for review moderation
 */
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } }, 'name slug images reviews').lean();
    const allReviews = [];

    products.forEach((p) => {
      (p.reviews || []).forEach((r) => {
        allReviews.push({
          _id: r._id,
          productId: p._id,
          productName: p.name,
          productSlug: p.slug,
          productImage: p.images?.[0] || '',
          user: r.user,
          userName: r.userName || 'Khách hàng',
          userAvatar: r.userAvatar || '',
          rating: r.rating,
          comment: r.comment,
          images: r.images || [],
          createdAt: r.createdAt,
        });
      });
    });

    // Newest reviews first
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      reviews: allReviews,
      total: allReviews.length,
    });
  } catch (error) {
    console.error('getAllReviewsAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách đánh giá của khách hàng' });
  }
};

/**
 * Admin: Delete inappropriate review from a product
 */
export const deleteReviewAdmin = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    product.reviews = product.reviews.filter((r) => r._id.toString() !== reviewId);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
      : 5;

    await product.save();
    invalidateProductCache();

    res.json({
      success: true,
      message: 'Đã gỡ bỏ đánh giá thành công',
      numReviews: product.numReviews,
      rating: Number(product.rating.toFixed(1)),
    });
  } catch (error) {
    console.error('deleteReviewAdmin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi gỡ đánh giá' });
  }
};


import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Danh mục là bắt buộc'],
      enum: ['Áo thun', 'Sơ mi', 'Áo khoác', 'Quần & Shorts', 'Váy & Đầm', 'Phụ kiện'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Mô tả sản phẩm là bắt buộc'],
    },
    details: {
      material: { type: String, default: '100% Premium Cotton thoáng mát, co giãn 4 chiều' },
      fit: { type: String, default: 'Form Oversized chuẩn streetwear hiện đại' },
      care: { type: String, default: 'Giặt máy chế độ nhẹ, không dùng chất tẩy mạnh' },
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
        inStock: { type: Boolean, default: true },
      },
    ],
    sizes: [
      {
        size: { type: String, required: true },
        inStock: { type: Boolean, default: true },
      },
    ],
    stockQuantity: {
      type: Number,
      required: true,
      default: 100,
    },
    rating: {
      type: Number,
      required: true,
      default: 5.0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema],
    featured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  if (this.originalPrice > this.price && this.originalPrice > 0) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

export default mongoose.model('Product', productSchema);

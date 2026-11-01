/**
 * Product DTOs (Data Transfer Objects)
 */

export const CreateProductDtoSchema = {
  body: {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 150,
      message: 'Tên sản phẩm phải từ 3 đến 150 ký tự',
    },
    category: {
      required: true,
      type: 'string',
      custom: (cat) => {
        const allowed = ['Áo thun', 'Sơ mi', 'Áo khoác', 'Quần & Shorts', 'Váy & Đầm', 'Phụ kiện'];
        if (!allowed.includes(cat)) {
          return `Danh mục phải thuộc: ${allowed.join(', ')}`;
        }
        return true;
      },
    },
    price: {
      required: true,
      type: 'number',
      min: 1000,
      message: 'Giá sản phẩm tối thiểu là 1.000 VNĐ',
    },
    originalPrice: {
      required: false,
      type: 'number',
      min: 0,
    },
    description: {
      required: true,
      type: 'string',
      minLength: 10,
      message: 'Mô tả sản phẩm phải có ít nhất 10 ký tự',
    },
    stockQuantity: {
      required: false,
      type: 'number',
      min: 0,
      default: 100,
    },
  },
};

/**
 * Output Serializer DTO for Products:
 * Standardizes API output, computes discount percentage authoritative server-side
 */
export class ProductResponseDto {
  static transform(product) {
    if (!product) return null;
    const doc = product.toObject ? product.toObject() : product;

    const discountPercent =
      doc.originalPrice && doc.originalPrice > doc.price
        ? Math.round(((doc.originalPrice - doc.price) / doc.originalPrice) * 100)
        : 0;

    return {
      id: doc._id?.toString(),
      skuUuid: doc.skuUuid || doc._id?.toString(),
      name: doc.name,
      slug: doc.slug,
      category: doc.category,
      price: doc.price,
      originalPrice: doc.originalPrice || doc.price,
      discountPercent,
      description: doc.description,
      details: doc.details || {},
      images: doc.images || [],
      colors: doc.colors || [],
      sizes: doc.sizes || [],
      stockQuantity: doc.stockQuantity !== undefined ? doc.stockQuantity : doc.stock || 0,
      inStock: (doc.stockQuantity !== undefined ? doc.stockQuantity : doc.stock || 0) > 0,
      rating: doc.rating || 5.0,
      numReviews: doc.numReviews || 0,
      isBestSeller: !!doc.isBestSeller,
      featured: !!doc.featured,
      createdAt: doc.createdAt,
    };
  }
}


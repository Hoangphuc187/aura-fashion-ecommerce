/**
 * Order DTOs (Data Transfer Objects)
 */

export const CreateOrderDtoSchema = {
  body: {
    orderItems: {
      required: true,
      type: 'array',
      message: 'Danh sách sản phẩm trong giỏ hàng không được để trống',
      custom: (items) => {
        if (!Array.isArray(items) || items.length === 0) {
          return 'Giỏ hàng phải chứa ít nhất 1 sản phẩm';
        }
        for (const item of items) {
          if (!item.product) return 'Mã sản phẩm trong đơn hàng không hợp lệ';
          if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
            return 'Số lượng sản phẩm phải là số nguyên dương';
          }
        }
        return true;
      },
    },
    shippingAddress: {
      required: true,
      custom: (addr) => {
        if (!addr || typeof addr !== 'object') return 'Thông tin địa chỉ giao hàng không hợp lệ';
        if (!addr.fullName || !addr.fullName.trim()) return 'Vui lòng cung cấp họ và tên người nhận';
        if (!addr.phone || !addr.phone.trim()) return 'Vui lòng cung cấp số điện thoại người nhận';
        if (!addr.address || !addr.address.trim()) return 'Vui lòng cung cấp địa chỉ giao hàng chi tiết';
        if (!addr.city || !addr.city.trim()) return 'Vui lòng cung cấp tỉnh / thành phố';
        return true;
      },
    },
    paymentMethod: {
      required: false,
      type: 'string',
      custom: (method) => {
        const allowed = ['COD', 'VIETQR', 'CARD', 'MOMO', 'VNPAY'];
        if (method && !allowed.includes(method)) {
          return `Phương thức thanh toán phải là một trong các giá trị: ${allowed.join(', ')}`;
        }
        return true;
      },
    },
    shippingMethod: {
      required: false,
      type: 'string',
      custom: (method) => {
        const allowed = ['standard', 'express'];
        if (method && !allowed.includes(method)) {
          return 'Phương thức vận chuyển phải là standard hoặc express';
        }
        return true;
      },
    },
    couponCode: {
      required: false,
      type: 'string',
    },
  },
};

/**
 * Output Serializer DTO for Orders:
 * Masks internal DB specifics and presents clean business transaction details with UUID tracking
 */
export class OrderResponseDto {
  static transform(order) {
    if (!order) return null;
    const doc = order.toObject ? order.toObject() : order;

    return {
      id: doc._id?.toString(),
      orderCode: doc.orderCode,
      trackingUuid: doc.trackingUuid || doc.orderCode, // Public safe tracking UUID
      orderItems: (doc.orderItems || []).map((item) => ({
        product: item.product?.toString(),
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      shippingAddress: doc.shippingAddress,
      shippingMethod: doc.shippingMethod,
      paymentMethod: doc.paymentMethod,
      paymentStatus: doc.paymentStatus,
      orderStatus: doc.orderStatus,
      pricing: {
        itemsPrice: doc.itemsPrice,
        shippingPrice: doc.shippingPrice,
        discountAmount: doc.discountAmount,
        totalPrice: doc.totalPrice,
      },
      couponCode: doc.couponCode || '',
      timeline: doc.timeline || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}


import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  sender: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'bot'], default: 'customer' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Đổi hàng',
        'Đổi trả',
        'Hoàn tiền',
        'Vận chuyển',
        'Chọn size',
        'Chính sách bảo hành',
        'Tư vấn',
        'Khiếu nại',
        'Thanh toán',
        'Khác',
      ],
      default: 'Khác',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    replies: [replySchema],
  },
  {
    timestamps: true,
  }
);

// High-performance query indexes
ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ email: 1 });

export default mongoose.model('Ticket', ticketSchema);

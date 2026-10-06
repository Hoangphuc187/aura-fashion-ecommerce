import Ticket from '../models/Ticket.js';

// Standard FAQ Data (Stored in backend & delivered dynamically)
const FAQ_DATA = [
  {
    id: 1,
    category: 'Đổi hàng',
    question: 'Chính sách đổi hàng của AURA như thế nào?',
    answer:
      'AURA hỗ trợ đổi size, đổi màu hoặc đổi mẫu khác trong vòng 30 ngày kể từ khi nhận hàng. Sản phẩm cần còn nguyên tem mác, chưa qua sử dụng, chưa giặt ủi và có hộp/bao bì đóng gói đi kèm.',
  },
  {
    id: 2,
    category: 'Hoàn tiền',
    question: 'Quy trình và thời gian hoàn tiền mất bao lâu?',
    answer:
      'Sau khi kho AURA nhận lại sản phẩm và kiểm định chất lượng trong vòng 24H, tiền sẽ được hoàn trả về tài khoản ngân hàng hoặc ví điện tử (MoMo/VNPAY) của bạn trong vòng 1-3 ngày làm việc.',
  },
  {
    id: 3,
    category: 'Vận chuyển',
    question: 'Bao lâu thì tôi nhận được hàng?',
    answer:
      'Đơn nội thành TP. Hồ Chí Minh & Hà Nội giao hỏa tốc trong 2-4 tiếng hoặc tiêu chuẩn 24H. Các tỉnh thành khác giao nhanh qua GHN Express từ 2-3 ngày làm việc.',
  },
  {
    id: 4,
    category: 'Vận chuyển',
    question: 'Tôi có được đồng kiểm (kiểm tra hàng) trước khi nhận không?',
    answer:
      'Có! Tất cả đơn hàng tại AURA đều được đồng kiểm ngoại quan (kiểm tra mẫu áo, màu sắc, size và số lượng) cùng nhân viên giao hàng trước khi thanh toán COD hoặc ký nhận.',
  },
  {
    id: 5,
    category: 'Chọn size',
    question: 'Làm thế nào để chọn size chuẩn form Oversized / Boxy?',
    answer:
      'Form áo của AURA thiết kế chuẩn Boxy Streetwear vai rơi. Nếu bạn thích mặc vừa người gọn gàng, hãy chọn đúng size theo bảng số đo; nếu thích phong cách thụng rộng phủ mông cá tính, bạn có thể tăng lên 1 size.',
  },
  {
    id: 6,
    category: 'Chính sách bảo hành',
    question: 'Chính sách bảo hành chất liệu và hình in như thế nào?',
    answer:
      'AURA bảo hành 6 tháng đối với các lỗi từ nhà sản xuất: bung chỉ may, hỏng khóa kéo YKK, bong tróc hình in lụa hoặc xù lông vải bất thường. Đổi mới 100% miễn phí vận chuyển 2 chiều.',
  },
];

/**
 * Get FAQ List
 */
export const getFaqList = async (req, res) => {
  res.json({ success: true, faqs: FAQ_DATA });
};

/**
 * Create Support Ticket / Contact Message
 */
export const createTicket = async (req, res) => {
  try {
    const { name, email, phone, category = 'Khác', subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    const ticketCode = 'TK-' + Math.floor(100000 + Math.random() * 900000);

    const ticket = await Ticket.create({
      ticketCode,
      user: req.user ? req.user._id : null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      category,
      subject: subject.trim(),
      message: message.trim(),
      status: 'Pending',
      priority: 'Medium',
      replies: [
        {
          sender: name.trim(),
          role: 'customer',
          message: message.trim(),
          createdAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: `Yêu cầu hỗ trợ đã được tạo thành công! Mã Ticket của bạn là #${ticketCode}. Đội ngũ CSKH sẽ phản hồi trong vòng 2 giờ.`,
      ticket,
    });
  } catch (error) {
    console.error('createTicket error:', error);
    res.status(500).json({ success: false, message: 'Lỗi gửi yêu cầu hỗ trợ' });
  }
};

/**
 * Get My Tickets (Customer)
 */
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('getMyTickets error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách yêu cầu hỗ trợ' });
  }
};

/**
 * Lookup Ticket by Code (Guest or Customer)
 */
export const getTicketByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const ticket = await Ticket.findOne({ ticketCode: code.toUpperCase() });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã Ticket này' });
    }
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('getTicketByCode error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tra cứu Ticket' });
  }
};

/**
 * Admin: Get All Tickets
 */
export const getAllTickets = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('getAllTickets error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách Ticket' });
  }
};

/**
 * Admin: Update Ticket Status & Add Reply
 */
export const replyAndCloseTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyMessage } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Ticket' });
    }

    if (status) ticket.status = status;

    if (replyMessage && typeof replyMessage === 'string' && replyMessage.trim()) {
      ticket.replies.push({
        sender: req.user.name || 'CSKH AURA Studio',
        role: 'admin',
        message: replyMessage.trim(),
        createdAt: new Date(),
      });
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái và phản hồi Ticket thành công',
      ticket,
    });
  } catch (error) {
    console.error('replyAndCloseTicket error:', error);
    res.status(500).json({ success: false, message: 'Lỗi phản hồi Ticket' });
  }
};

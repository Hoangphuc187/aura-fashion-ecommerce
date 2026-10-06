import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Ticket,
  Bot,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SupportPortalModal = ({ isOpen, onClose, initialTab = 'faq' }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab); // 'faq' | 'contact' | 'lookup' | 'chat'
  const [faqs, setFaqs] = useState([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState(1);

  // Ticket Form
  const [ticketForm, setTicketForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: 'Đổi trả',
    subject: '',
    message: '',
  });
  const [ticketLoading, setTicketLoading] = useState(false);
  const [createdTicketCode, setCreatedTicketCode] = useState(null);

  // Ticket Lookup
  const [lookupCode, setLookupCode] = useState('');
  const [lookedUpTicket, setLookedUpTicket] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Live Chat Bot
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý Ảo AURA. Tôi có thể hỗ trợ bạn kiểm tra đơn hàng, tư vấn chọn size hoặc giải đáp chính sách đổi trả ngay lập tức!',
      time: 'Vừa xong',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setTicketForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch FAQs from API
    fetch('/api/support/faq')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        }
      })
      .catch((err) => console.error('Fetch FAQs error:', err));
  }, [isOpen]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.email || !ticketForm.subject || !ticketForm.message) {
      addToast('Vui lòng điền đầy đủ các thông tin bắt buộc', 'error');
      return;
    }

    setTicketLoading(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi yêu cầu hỗ trợ');

      setCreatedTicketCode(data.ticket?.ticketCode);
      addToast(data.message, 'success');
      setTicketForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        category: 'Đổi trả',
        subject: '',
        message: '',
      });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleLookupTicket = async (e) => {
    e?.preventDefault();
    const clean = lookupCode.trim().replace('#', '');
    if (!clean) {
      addToast('Vui lòng nhập mã Ticket cần tra cứu (VD: TK-123456)', 'error');
      return;
    }

    setLookupLoading(true);
    setLookedUpTicket(null);
    try {
      const res = await fetch(`/api/support/tickets/lookup/${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không tìm thấy Ticket');

      setLookedUpTicket(data.ticket);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q) return;

    const userMsg = { sender: 'user', text: q, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Smart bot automated responses based on query
    setTimeout(() => {
      let botReply = 'Cảm ơn bạn đã liên hệ! Đội ngũ tư vấn viên AURA đã tiếp nhận và sẽ hỗ trợ bạn sớm nhất.';
      const lower = q.toLowerCase();

      if (lower.includes('size') || lower.includes('chọn size') || lower.includes('bảng size')) {
        botReply = 'Áo phông & Hoodie của AURA thiết kế chuẩn form Boxy Oversized Streetwear vai rơi. Nếu bạn cao 1m65-1m72 nặng 55-65kg thì Size L mặc vừa đẹp, thích thụng dài cá tính hãy chọn Size XL nhé!';
      } else if (lower.includes('đổi') || lower.includes('trả') || lower.includes('hoàn')) {
        botReply = 'AURA hỗ trợ đổi hàng miễn phí trong vòng 30 ngày đối với sản phẩm còn nguyên tem mác. Thời gian hoàn tiền từ 1-3 ngày làm việc sau khi nhận lại hàng.';
      } else if (lower.includes('ship') || lower.includes('giao hàng') || lower.includes('bao lâu')) {
        botReply = 'Nội thành TP.HCM & Hà Nội giao nhanh trong 2-4 tiếng hoặc tiêu chuẩn 24H. Các tỉnh thành khác giao từ 2-3 ngày làm việc qua GHN Express. Đơn từ 500K được Freeship 100%!';
      } else if (lower.includes('kiểm hàng') || lower.includes('đồng kiểm')) {
        botReply = 'Tất cả đơn hàng tại AURA đều được đồng kiểm tra mẫu mã, kích thước và màu sắc cùng nhân viên giao nhận trước khi thanh toán COD.';
      } else if (lower.includes('hotline') || lower.includes('sđt') || lower.includes('liên hệ')) {
        botReply = 'Hotline hỗ trợ 24/7 của AURA: 0901.234.567 (Miễn phí cước) hoặc gửi email về support@aura.vn.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  if (!isOpen) return null;

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          background: '#0d0e15',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(250, 204, 21, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Trung Tâm Hỗ Trợ & CSKH AURA</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Hỗ trợ 24/7 • Hotline: 0901.234.567 • Email: support@aura.vn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0 28px',
          }}
        >
          {[
            { id: 'faq', label: 'Câu hỏi thường gặp (FAQ)', icon: HelpCircle },
            { id: 'contact', label: 'Gửi yêu cầu / Ticket', icon: Ticket },
            { id: 'lookup', label: 'Tra cứu Ticket', icon: Search },
            { id: 'chat', label: 'Bot Trợ lý & Kênh liên hệ', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #facc15' : '3px solid transparent',
                  background: 'transparent',
                  color: isActive ? '#facc15' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#0a0b10' }}>
          {/* TAB 1: FAQ */}
          {activeTab === 'faq' && (
            <div>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi: Đổi hàng, hoàn tiền, thời gian giao, bảo hành..."
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredFaqs.map((faq) => {
                  const isOpenItem = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: isOpenItem ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                      }}
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpenItem ? null : faq.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          border: 'none',
                          background: 'transparent',
                          color: '#fff',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              background: 'rgba(250, 204, 21, 0.15)',
                              color: '#facc15',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {faq.category}
                          </span>
                          <strong style={{ fontSize: '0.9rem' }}>{faq.question}</strong>
                        </div>
                        {isOpenItem ? <ChevronUp size={18} color="#facc15" /> : <ChevronDown size={18} color="#64748b" />}
                      </button>

                      {isOpenItem && (
                        <div
                          style={{
                            padding: '0 20px 18px 20px',
                            fontSize: '0.86rem',
                            color: '#cbd5e1',
                            lineHeight: 1.6,
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            paddingTop: '12px',
                          }}
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE SUPPORT TICKET */}
          {activeTab === 'contact' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px' }}>Gửi Yêu Cầu Hỗ Trợ (Tạo Ticket)</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Hệ thống sẽ tạo mã Ticket riêng để bạn theo dõi tiến trình xử lý từ đội ngũ CSKH.
                </p>
              </div>

              {createdTicketCode && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid #10b981',
                    borderRadius: '14px',
                    padding: '18px 22px',
                    marginBottom: '20px',
                    textAlign: 'center',
                  }}
                >
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#34d399' }}>Tạo Ticket Thành Công!</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0' }}>
                    Mã Ticket của bạn: <strong style={{ color: '#facc15', fontSize: '1.05rem' }}>#{createdTicketCode}</strong>
                  </p>
                  <button
                    onClick={() => {
                      setLookupCode(createdTicketCode);
                      setActiveTab('lookup');
                      setTimeout(handleLookupTicket, 100);
                    }}
                    style={{
                      marginTop: '12px',
                      background: '#10b981',
                      color: '#000',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Xem Chi Tiết Ticket Này
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      Email liên hệ <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={ticketForm.phone}
                      onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      Danh mục yêu cầu
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#181924',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="Đổi trả">Đổi size / Đổi mẫu</option>
                      <option value="Hoàn tiền">Yêu cầu hoàn tiền</option>
                      <option value="Vận chuyển">Tra cứu vận chuyển / Giao chậm</option>
                      <option value="Lỗi sản phẩm">Bảo hành lỗi sản phẩm / Hình in</option>
                      <option value="Khác">Khác / Góp ý dịch vụ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    Tiêu đề yêu cầu <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    required
                    placeholder="VD: Cần đổi size Áo Hoodie từ M sang L cho đơn hàng #AURA-..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    Nội dung chi tiết <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    required
                    placeholder="Mô tả cụ thể vấn đề hoặc mã đơn hàng của bạn để chuyên viên CSKH hỗ trợ nhanh nhất..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketLoading}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(250, 204, 21, 0.3)',
                    marginTop: '6px',
                  }}
                >
                  {ticketLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu Hỗ Trợ'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: TICKET LOOKUP */}
          {activeTab === 'lookup' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px' }}>Tra Cứu Tiến Trình Ticket</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Nhập mã Ticket nhận được khi gửi yêu cầu để theo dõi phản hồi từ ban quản trị.
                </p>
              </div>

              <form onSubmit={handleLookupTicket} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input
                  type="text"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder="Nhập mã Ticket, VD: TK-123456"
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={lookupLoading}
                  style={{
                    padding: '11px 20px',
                    background: '#facc15',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {lookupLoading ? 'Đang tìm...' : 'Tra Cứu'}
                </button>
              </form>

              {lookedUpTicket && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#facc15' }}>
                        #{lookedUpTicket.ticketCode}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '10px' }}>
                        {lookedUpTicket.category} • {new Date(lookedUpTicket.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background:
                          lookedUpTicket.status === 'Resolved'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : lookedUpTicket.status === 'In Progress'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(234, 179, 8, 0.15)',
                        color:
                          lookedUpTicket.status === 'Resolved'
                            ? '#34d399'
                            : lookedUpTicket.status === 'In Progress'
                            ? '#60a5fa'
                            : '#facc15',
                      }}
                    >
                      {lookedUpTicket.status === 'Resolved'
                        ? 'Đã Giải Quyết'
                        : lookedUpTicket.status === 'In Progress'
                        ? 'Đang Xử Lý'
                        : 'Chờ Xử Lý'}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#fff' }}>{lookedUpTicket.subject}</h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {lookedUpTicket.message}
                  </p>

                  {/* Replies Chain */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                    <h5 style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#94a3b8' }}>Lịch sử phản hồi:</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {lookedUpTicket.replies?.map((rep, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: rep.role === 'admin' ? 'rgba(250, 204, 21, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                            border: rep.role === 'admin' ? '1px solid rgba(250, 204, 21, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.8rem', color: rep.role === 'admin' ? '#facc15' : '#fff' }}>
                              {rep.sender} {rep.role === 'admin' && '(CSKH)'}
                            </strong>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {new Date(rep.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0' }}>{rep.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHAT BOT & DIRECT CONTACT */}
          {activeTab === 'chat' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
              {/* Bot Chat Widget */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '420px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(250, 204, 21, 0.1)',
                    borderBottom: '1px solid rgba(250, 204, 21, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Bot size={20} color="#facc15" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#facc15' }}>Trợ Lý Ảo AURA Assistant</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>● Đang trực tuyến</div>
                  </div>
                </div>

                {/* Messages Container */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chatMessages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: m.sender === 'user' ? '#facc15' : 'rgba(255, 255, 255, 0.06)',
                        color: m.sender === 'user' ? '#000' : '#fff',
                        padding: '10px 14px',
                        borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        fontSize: '0.84rem',
                        lineHeight: 1.45,
                      }}
                    >
                      <div>{m.text}</div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: m.sender === 'user' ? '#713f12' : '#64748b',
                          textAlign: 'right',
                          marginTop: '4px',
                        }}
                      >
                        {m.time}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={handleSendChat}
                  style={{
                    padding: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Hỏi về size, đổi hàng, thời gian ship..."
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.82rem',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#facc15',
                      color: '#000',
                      border: 'none',
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

              {/* Direct Channels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700 }}>Tổng Đài & Hotline</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Phone size={18} color="#facc15" />
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#facc15' }}>0901.234.567</strong>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Miễn phí cước gọi • 24/7</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={18} color="#facc15" />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>support@aura.vn</strong>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Phản hồi trong 2 giờ</div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700 }}>Mạng Xã Hội Chính Thức</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span>Facebook Fanpage</span>
                      <ExternalLink size={14} />
                    </a>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span>TikTok: @aura.official</span>
                      <ExternalLink size={14} />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span>Instagram: @aura.studio</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SupportPortalModal;

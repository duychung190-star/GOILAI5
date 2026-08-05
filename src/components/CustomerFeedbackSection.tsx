import React, { useState, useEffect } from 'react';
import { DriverRating } from '../types';
import { Star, MessageSquareQuote, ShieldCheck, ThumbsUp, Sparkles, PlusCircle, Building2, FileCheck, CheckCircle2, X } from 'lucide-react';

interface FeedbackItem {
  id: string;
  customerName: string;
  companyName?: string;
  isEnterprise?: boolean;
  customerPhone?: string;
  stars: number;
  review?: string;
  tags?: string[];
  driverName?: string;
  createdAt: number;
}

interface CustomerFeedbackSectionProps {
  onOpenRatingModal?: () => void;
  newRatings?: DriverRating[];
}

export const CustomerFeedbackSection: React.FC<CustomerFeedbackSectionProps> = ({
  onOpenRatingModal,
  newRatings = [],
}) => {
  const [ratings, setRatings] = useState<FeedbackItem[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'ENTERPRISE' | '5' | '4'>('ALL');
  const [stats, setStats] = useState({ averageStars: 4.9, totalReviews: 1280, satisfactionRate: 98.6 });
  const [isLoading, setIsLoading] = useState(true);

  // Direct Review Modal state
  const [showDirectForm, setShowDirectForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [isEnterpriseForm, setIsEnterpriseForm] = useState(false);
  const [formStars, setFormStars] = useState(5);
  const [formReview, setFormReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Tài xế lịch sự & chu đáo', 'Lái xe an toàn & êm ái']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const SUGGESTED_TAGS = [
    'Xuất hóa đơn VAT chuẩn chỉnh',
    'Tài xế lịch sự & chu đáo',
    'Lái xe an toàn & êm ái',
    'Đến đúng hẹn',
    'Phục vụ khách VIP',
    'Thanh toán linh hoạt',
    'Hợp đồng doanh nghiệp',
    'Xe sạch sẽ'
  ];

  const fetchRatings = async () => {
    try {
      const res = await fetch('/api/ratings');
      const data = await res.json();
      if (data.success) {
        setRatings(data.ratings || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
    // Pre-fill name from logged in user if available
    const savedName = localStorage.getItem('dgo_customer_name');
    if (savedName) {
      setFormName(savedName);
    } else {
      const savedUserStr = localStorage.getItem('dgo_user');
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          if (u.name) setFormName(u.name);
        } catch (e) {}
      }
    }
  }, [newRatings]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    try {
      const finalTags = isEnterpriseForm && !selectedTags.includes('Xuất hóa đơn VAT chuẩn chỉnh') 
        ? ['Xuất hóa đơn VAT chuẩn chỉnh', ...selectedTags] 
        : selectedTags;

      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formName.trim(),
          companyName: isEnterpriseForm ? formCompany.trim() : undefined,
          isEnterprise: isEnterpriseForm,
          stars: formStars,
          review: formReview.trim(),
          tags: finalTags,
          driverName: 'Tài xế D.GO 247',
        }),
      });

      const data = await res.json();
      if (data.success && data.rating) {
        setSubmitSuccess(true);
        
        // Optimistic live update
        setRatings(prev => [data.rating, ...prev]);
        setStats(prev => {
          const newTotal = prev.totalReviews + 1;
          const newAvg = (prev.averageStars * prev.totalReviews + formStars) / newTotal;
          return {
            ...prev,
            totalReviews: newTotal,
            averageStars: Number(newAvg.toFixed(1))
          };
        });

        setTimeout(() => {
          setSubmitSuccess(false);
          setShowDirectForm(false);
          setFormReview('');
        }, 1800);
      } else {
        fetchRatings();
      }
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRatings = ratings.filter((r) => {
    if (filterType === 'ENTERPRISE') return r.isEnterprise || r.tags?.some(t => t.toLowerCase().includes('vat') || t.toLowerCase().includes('doanh nghiệp'));
    if (filterType === '5') return r.stars === 5;
    if (filterType === '4') return r.stars === 4;
    return true;
  });

  return (
    <section className="my-10 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ĐÁNH GIÁ & PHẢN HỒI THỰC TẾ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Khách Hàng & Chủ Doanh Nghiệp Nói Gì Về D.GO 247?
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Đánh giá thực tế về chất lượng lái xe an toàn & dịch vụ hỗ trợ xuất hóa đơn GTGT / VAT trọn gói cho doanh nghiệp.
          </p>
        </div>

        {/* Aggregate Stats Card */}
        <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center pr-4 border-r border-slate-800">
            <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-2xl">
              <span>{stats.averageStars}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Trung bình đánh giá</p>
          </div>

          <div className="text-center pr-4 border-r border-slate-800">
            <p className="text-lg font-extrabold text-emerald-400">{stats.satisfactionRate}%</p>
            <p className="text-[10px] text-slate-400 font-medium">Tỷ lệ rất hài lòng</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-extrabold text-cyan-300">{stats.totalReviews}+</p>
            <p className="text-[10px] text-slate-400 font-medium">Lượt nhận xét</p>
          </div>
        </div>
      </div>

      {/* Enterprise Highlight Banner */}
      <div className="my-4 p-3 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-800/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <span>Được hơn 300+ Doanh nghiệp & Tập đoàn tin dùng</span>
              <FileCheck className="w-4 h-4 text-emerald-400 inline" />
            </span>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Cung cấp giải pháp tài xế đưa đón sếp, tiếp đối tác & hỗ trợ xuất <strong>Hóa Đơn GTGT (VAT) điện tử</strong> nhanh chóng.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Direct Review Button */}
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 mr-1">Lọc xem:</span>
          
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Tất cả ({ratings.length})
          </button>

          <button
            onClick={() => setFilterType('ENTERPRISE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'ENTERPRISE'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-slate-950 text-blue-400 border border-blue-900/80 hover:bg-blue-950/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-300" />
            <span>🏢 Doanh Nghiệp (VAT)</span>
          </button>

          <button
            onClick={() => setFilterType('5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterType === '5'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>5 Sao</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </button>
        </div>

        {/* Direct Review Open Trigger */}
        <button
          onClick={() => setShowDirectForm(!showDirectForm)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 border border-amber-300/50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showDirectForm ? 'ẨN FORM ĐÁNH GIÁ' : 'ĐÁNH GIÁ TRỰC TIẾP DỊCH VỤ'}</span>
        </button>
      </div>

      {/* Embedded Direct Customer Review Form */}
      {showDirectForm && (
        <div className="mb-6 p-5 bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Gửi Nhận Xét & Đánh Giá Trực Tiếp</h3>
                <p className="text-[11px] text-slate-400">Đánh giá từ 1 đến 5 sao & nhận xét sẽ hiển thị ngay lập tức lên ứng dụng</p>
              </div>
            </div>
            <button
              onClick={() => setShowDirectForm(false)}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitSuccess ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Gửi đánh giá thành công!</h4>
              <p className="text-xs text-slate-300">Nhận xét của bạn đã được xuất bản trực tiếp lên danh sách bên dưới.</p>
            </div>
          ) : (
            <form onSubmit={handleDirectSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    Họ tên của bạn <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Anh Hoàng / Chị Thu"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Rating selection */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Đánh giá sao:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormStars(s)}
                        className="p-0.5 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= formStars ? 'fill-amber-400 text-amber-400' : 'text-slate-700 fill-slate-800'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Checkbox */}
              <div className="p-2.5 bg-blue-950/40 border border-blue-800/50 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnterpriseForm}
                    onChange={(e) => setIsEnterpriseForm(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>Tôi là Khách hàng Doanh nghiệp / Cần đánh giá dịch vụ VAT</span>
                  </span>
                </label>

                {isEnterpriseForm && (
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Tên Công ty / Tên Tập đoàn"
                    className="w-full bg-slate-900 border border-blue-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                )}
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Chọn ưu điểm nổi bật:</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          active
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Nhận xét & cảm nhận trực tiếp:
                </label>
                <textarea
                  rows={3}
                  value={formReview}
                  onChange={(e) => setFormReview(e.target.value)}
                  placeholder="Nhập trải nghiệm thực tế của bạn về thái độ phục vụ, tính an toàn hoặc quy trình hóa đơn..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDirectForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md active:scale-95"
                >
                  {isSubmitting ? 'Đang xuất bản...' : 'XUẤT BẢN ĐÁNH GIÁ NGAY'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Ratings Grid Cards */}
      {isLoading ? (
        <div className="text-center py-10 text-slate-500 text-xs">Đang tải phản hồi từ khách hàng...</div>
      ) : filteredRatings.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">Chưa có đánh giá nào cho bộ lọc này.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRatings.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between transition-colors relative ${
                item.isEnterprise
                  ? 'bg-gradient-to-b from-slate-950 via-slate-950 to-blue-950/20 border-blue-900/60 hover:border-blue-700'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2.5">
                
                {/* User & Enterprise Badge Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full font-extrabold text-xs flex items-center justify-center border shrink-0 ${
                      item.isEnterprise 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {item.isEnterprise ? <Building2 className="w-4 h-4 text-blue-400" /> : item.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{item.customerName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </h4>
                      {item.companyName && (
                        <p className="text-[11px] text-blue-300 font-semibold flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{item.companyName}</span>
                        </p>
                      )}
                      {!item.companyName && (
                        <p className="text-[10px] text-slate-500">
                          {item.driverName || 'Tài xế D.GO 247'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= item.stars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-800 fill-slate-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Enterprise Special Tag */}
                {item.isEnterprise && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-extrabold border border-blue-500/30">
                    <FileCheck className="w-3 h-3 text-emerald-400" />
                    <span>CHỦ DOANH NGHIỆP • ĐÃ XUẤT HÓA ĐƠN VAT</span>
                  </div>
                )}

                {/* Review Text */}
                {item.review && (
                  <p className="text-xs text-slate-300 leading-relaxed italic relative pl-3 border-l-2 border-amber-400/50">
                    "{item.review}"
                  </p>
                )}

                {/* Praise Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((tag, idx) => {
                      const isVatTag = tag.toLowerCase().includes('vat') || tag.toLowerCase().includes('doanh nghiệp');
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                            isVatTag
                              ? 'bg-blue-950/80 text-blue-200 border-blue-800 font-bold'
                              : 'bg-slate-900 text-amber-300/90 border-slate-800'
                          }`}
                        >
                          <ThumbsUp className={`w-2.5 h-2.5 ${isVatTag ? 'text-blue-400' : 'text-amber-400'}`} />
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Timestamp */}
              <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
                <span className="text-slate-600">D.GO Verified Feedback</span>
                <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Direct Customer Review Form Modal */}
      {showDirectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col relative max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gửi Đánh Giá Dịch Vụ D.GO 247</h3>
                  <p className="text-[11px] text-slate-400">Chia sẻ trải nghiệm sử dụng dịch vụ lái xe & xuất hóa đơn VAT</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectForm(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {submitSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">Cảm ơn bạn đã gửi đánh giá!</h4>
                  <p className="text-xs text-slate-300">
                    Phản hồi của bạn đã được hiển thị công khai trên hệ thống D.GO 247.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDirectSubmit} className="space-y-4">
                  
                  {/* Name & Enterprise Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Họ tên của bạn <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ví dụ: Anh Hoàng / Chị Thu"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Business Checkbox */}
                  <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnterpriseForm}
                        onChange={(e) => setIsEnterpriseForm(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span>Tôi là Chủ Doanh Nghiệp / Cần Đánh Giá Về Hóa Đơn VAT</span>
                      </span>
                    </label>

                    {isEnterpriseForm && (
                      <div className="pt-1">
                        <input
                          type="text"
                          value={formCompany}
                          onChange={(e) => setFormCompany(e.target.value)}
                          placeholder="Tên Công ty / Tên Doanh nghiệp của bạn"
                          className="w-full bg-slate-900 border border-blue-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Star Rating Selection */}
                  <div className="text-center bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-300 block">Mức độ hài lòng của bạn:</span>
                    <div className="flex justify-center items-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormStars(star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= formStars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700 fill-slate-800'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Ưu điểm nổi bật (Chọn nhiều):</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              active
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-950 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Nội dung đánh giá & cảm nhận:
                    </label>
                    <textarea
                      rows={3}
                      value={formReview}
                      onChange={(e) => setFormReview(e.target.value)}
                      placeholder="Chia sẻ về chất lượng tài xế, sự an toàn, thái độ phục vụ hoặc tiện ích xuất hóa đơn VAT..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDirectForm(false)}
                      className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'GỬI ĐÁNH GIÁ NGAY'}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
};


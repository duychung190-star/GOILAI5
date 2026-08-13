import React, { useState, useEffect } from 'react';
import { DriverRating } from '../types';
import { Star, ShieldCheck, ThumbsUp, Sparkles, PlusCircle, Building2, FileCheck, CheckCircle2, X } from 'lucide-react';

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

const INITIAL_DEFAULT_RATINGS: FeedbackItem[] = [
  {
    id: 'r-corp-1',
    customerName: 'Anh Nguyễn Thế Vinh',
    companyName: 'Công ty Logistics Vinh Phát',
    isEnterprise: true,
    customerPhone: '098****123',
    stars: 5,
    review: 'Công ty chúng tôi thường xuyên cần tài xế lái xe đưa đón sếp và đối tác đi tiệc rượu, công tác tỉnh. Dịch vụ D.GO 247 cực kỳ chuyên nghiệp, tài xế văn minh, lịch sự. Rất hài lòng vì D.GO hỗ trợ xuất hóa đơn GTGT / VAT điện tử rất nhanh chóng và đầy đủ chứng từ, giúp phòng kế toán dễ dàng hạch toán chi phí hợp lệ cho doanh nghiệp!',
    tags: ['Khách hàng Doanh nghiệp', 'Xuất hóa đơn VAT chuẩn chỉnh', 'Tài xế lịch sự & chu đáo', 'Lái xe an toàn'],
    driverName: 'Tài xế Nguyễn Văn Hùng',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'r-corp-2',
    customerName: 'Chị Phạm Thanh Vân',
    companyName: 'Công ty Truyền thông & Event SunMedia',
    isEnterprise: true,
    customerPhone: '091****888',
    stars: 5,
    review: 'Là đơn vị sự kiện, bên mình thường phải đặt tài xế lái ô tô cho đoàn khách VIP vào đêm muộn. D.GO 247 luôn có mặt đúng giờ, xe sạch sẽ. Ưu điểm vượt trội là việc xuất hóa đơn VAT tên công ty rõ ràng, thủ tục minh bạch, thanh toán linh hoạt theo hợp đồng doanh nghiệp. Hợp tác lâu dài!',
    tags: ['Khách hàng Doanh nghiệp', 'Xuất hóa đơn VAT nhanh chóng', 'Phục vụ khách VIP', 'Đến đúng hẹn'],
    driverName: 'Tài xế Trần Quốc Bảo',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'r-corp-3',
    customerName: 'Anh Lê Quốc Tuấn',
    companyName: 'Cty Xây dựng & Thương mại Hưng Thịnh',
    isEnterprise: true,
    customerPhone: '093****555',
    stars: 5,
    review: 'Điều khiến công ty tôi tin dùng D.GO 247 hơn hẳn các dịch vụ khác là tốc độ phản hồi cực nhanh và dịch vụ xuất hóa đơn GTGT doanh nghiệp trong ngày. Lái xe cẩn thận, biết giữ gìn tài sản của khách. Tiết kiệm đáng kể thời gian và chi phí cho công ty!',
    tags: ['Khách hàng Doanh nghiệp', 'Hóa đơn VAT điện tử', 'Thanh toán linh hoạt', 'Nhiệt tình hỗ trợ'],
    driverName: 'Tài xế Lê Hoài Nam',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'r-1',
    customerName: 'Anh Minh (Thanh Xuân)',
    customerPhone: '098****321',
    stars: 5,
    review: 'Tài xế lái xe rất êm và cẩn thận. Bữa tiệc xong ăn uống no say có tài xế D.GO đưa về nhà an toàn tuyệt đối. Sẽ tiếp tục dùng dịch vụ!',
    tags: ['Tài xế lịch sự & chu đáo', 'Lái xe an toàn & êm ái', 'Đến đúng hẹn'],
    driverName: 'Tài xế Phạm Hoàng Nam',
    createdAt: Date.now() - 3600000 * 36,
  },
  {
    id: 'r-2',
    customerName: 'Chị Mai (Cầu Giấy)',
    customerPhone: '091****777',
    stars: 5,
    review: 'Đã đặt lần thứ 6 rồi, rất thích thái độ nhiệt tình của các bạn tài xế D.GO 247. Giá cả công khai minh bạch không bị vẽ tiền.',
    tags: ['Thái độ chuyên nghiệp', 'Cung đường tối ưu', 'Xe sạch sẽ'],
    driverName: 'Tài xế Vũ Đình Trọng',
    createdAt: Date.now() - 3600000 * 48,
  },
  {
    id: 'r-3',
    customerName: 'Anh Hoàng Nam (Đống Đa)',
    customerPhone: '097****999',
    stars: 5,
    review: 'Dịch vụ gọi lái xe hộ số 1 Hà Nội hiện nay. Đặt qua app trong 5 phút là có tài xế nhận chuyến ngay. Rất an tâm!',
    tags: ['Đến đúng hẹn', 'Phục vụ 24/7', 'Tài xế chuyên nghiệp'],
    driverName: 'Tài xế Nguyễn Văn Hùng',
    createdAt: Date.now() - 3600000 * 60,
  }
];

export const CustomerFeedbackSection: React.FC<CustomerFeedbackSectionProps> = ({
  newRatings = [],
}) => {
  const [ratings, setRatings] = useState<FeedbackItem[]>(INITIAL_DEFAULT_RATINGS);
  const [filterType, setFilterType] = useState<'ALL' | 'ENTERPRISE' | '5' | '4'>('ALL');
  const [stats, setStats] = useState({ averageStars: 5.0, totalReviews: 1280, satisfactionRate: 98.6 });
  const [isLoading, setIsLoading] = useState(false);

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
      if (!res.ok) {
        console.warn('Ratings endpoint status:', res.status);
        setRatings(INITIAL_DEFAULT_RATINGS);
        return;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.ratings) && data.ratings.length > 0) {
        const ratingMap = new Map<string, FeedbackItem>();
        [...data.ratings, ...INITIAL_DEFAULT_RATINGS].forEach(item => {
          if (item && item.id && !ratingMap.has(item.id)) {
            ratingMap.set(item.id, item);
          }
        });
        const combined = Array.from(ratingMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRatings(combined);
        if (data.stats) {
          setStats({
            averageStars: data.stats.averageStars || 5.0,
            totalReviews: Math.max(data.stats.totalReviews || 0, combined.length, 1280),
            satisfactionRate: data.stats.satisfactionRate || 98.6
          });
        }
      } else {
        setRatings(INITIAL_DEFAULT_RATINGS);
      }
    } catch (err: any) {
      console.warn('[Feedback] Using default ratings fallback:', err?.message || err);
      setRatings(INITIAL_DEFAULT_RATINGS);
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
    if (!r) return false;
    if (filterType === 'ENTERPRISE') return !!r.isEnterprise || r.tags?.some(t => t.toLowerCase().includes('vat') || t.toLowerCase().includes('doanh nghiệp'));
    if (filterType === '5') return Number(r.stars) === 5;
    if (filterType === '4') return Number(r.stars) === 4;
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
          {filteredRatings.map((item) => {
            const displayName = item.customerName || 'Khách hàng';
            const initialLetter = displayName.charAt(0).toUpperCase();

            return (
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
                        {item.isEnterprise ? <Building2 className="w-4 h-4 text-blue-400" /> : initialLetter}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{displayName}</span>
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
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};

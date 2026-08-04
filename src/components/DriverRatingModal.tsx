import React, { useState, useEffect } from 'react';
import { BookingRequest, DriverRating } from '../types';
import { Star, X, CheckCircle2, User, ThumbsUp, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

interface DriverRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest | null;
  onSubmitRating: (bookingId: string, rating: DriverRating) => Promise<void> | void;
}

const RATING_LABELS: Record<number, { title: string; desc: string; color: string }> = {
  5: { title: 'Xuất sắc', desc: 'Tài xế quá tuyệt vời! Rất hài lòng.', color: 'text-amber-400' },
  4: { title: 'Rất tốt', desc: 'Chuyến đi an toàn & thoải mái.', color: 'text-amber-300' },
  3: { title: 'Hài lòng', desc: 'Chuyến đi ổn, đạt yêu cầu.', color: 'text-sky-300' },
  2: { title: 'Cần cải thiện', desc: 'Tài xế cần nâng cao chất lượng phục vụ.', color: 'text-amber-500' },
  1: { title: 'Tệ / Không hài lòng', desc: 'Chất lượng không tốt, cần phản ánh.', color: 'text-rose-400' },
};

const SUGGESTED_TAGS = [
  'Tài xế lịch sự & chu đáo',
  'Lái xe an toàn & êm ái',
  'Đến đúng hẹn',
  'Thái độ chuyên nghiệp',
  'Xe sạch sẽ',
  'Cung đường tối ưu',
  'Nhiệt tình hỗ trợ'
];

export const DriverRatingModal: React.FC<DriverRatingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitRating,
}) => {
  const [stars, setStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [review, setReview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (booking?.rating) {
      setStars(booking.rating.stars || 5);
      setReview(booking.rating.review || '');
      setSelectedTags(booking.rating.tags || []);
    } else {
      setStars(5);
      setHoverStars(0);
      setSelectedTags(['Tài xế lịch sự & chu đáo', 'Lái xe an toàn & êm ái']);
      setReview('');
    }
    setIsSuccess(false);
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ratingData: DriverRating = {
        stars,
        review: review.trim(),
        tags: selectedTags,
        driverName: 'Tài xế D.GO 247',
        createdAt: Date.now(),
      };
      await onSubmitRating(booking.id, ratingData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStarLevel = hoverStars || stars;
  const ratingInfo = RATING_LABELS[currentStarLevel] || RATING_LABELS[5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] relative">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-amber-400/50 shadow-md"
            />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Đánh Giá Chuyến Đi & Tài Xế</span>
                <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  REVIEW
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Mã đơn: <strong className="text-amber-300">{booking.id}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="text-center py-10 space-y-3 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white">Cảm ơn bạn đã đánh giá!</h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Ý kiến đóng góp của bạn giúp D.GO 247 không ngừng nâng cao chất lượng dịch vụ tài xế.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Trip Info Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <User className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Tài xế D.GO 247</span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Đã hoàn thành
                    </span>
                  </div>
                  <p className="text-slate-400 truncate mt-0.5">
                    {booking.pickupAddress} ➔ {booking.destinationAddress}
                  </p>
                </div>
              </div>

              {/* Star Rating Section */}
              <div className="text-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <p className="text-xs font-semibold text-slate-300">
                  Bạn cảm thấy thế nào về tài xế & chuyến đi này?
                </p>
                
                {/* Stars container */}
                <div className="flex justify-center items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStars(star)}
                      onMouseEnter={() => setHoverStars(star)}
                      onMouseLeave={() => setHoverStars(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= currentStarLevel
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700 fill-slate-800'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Rating Level Label */}
                <div className="min-h-[36px] flex flex-col items-center justify-center">
                  <span className={`text-sm font-extrabold ${ratingInfo.color}`}>
                    {ratingInfo.title}
                  </span>
                  <span className="text-[11px] text-slate-400">{ratingInfo.desc}</span>
                </div>
              </div>

              {/* Quick Tags Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Điểm khen ngợi ấn tượng (Chọn nhiều):</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          active
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {active && <ThumbsUp className="w-3 h-3 text-amber-400 shrink-0" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ý kiến góp ý thêm (Không bắt buộc):</span>
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Nhập cảm nhận của bạn về thái độ phục vụ, kỹ năng lái xe của tài xế..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Star className="w-4 h-4 fill-slate-950" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'GỬI ĐÁNH GIÁ TÀI XẾ'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

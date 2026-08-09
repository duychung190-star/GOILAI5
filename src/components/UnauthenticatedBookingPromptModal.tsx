import React from 'react';
import { X, Sparkles, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

interface UnauthenticatedBookingPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onContinueGuest: () => void;
}

export const UnauthenticatedBookingPromptModal: React.FC<UnauthenticatedBookingPromptModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onContinueGuest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-900 relative space-y-0">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-slate-950 shadow-sm shrink-0"
            />
            <div>
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-1">
                <span>Ưu đãi thành viên D.GO</span>
                <Sparkles className="w-4 h-4 fill-slate-950 text-amber-500" />
              </h3>
              <p className="text-[11px] font-bold text-slate-900">Gọi Lái 247 - Đặt xe an toàn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-2">
            <p className="font-extrabold text-sm text-amber-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Đăng ký / Đăng nhập để tích điểm và đặt xe nhanh hơn</span>
            </p>
            <p className="text-slate-700 leading-relaxed">
              Tạo tài khoản D.GO chỉ mất 15 giây qua SĐT để được tự động điền thông tin, theo dõi lịch sử chuyến đi và nhận voucher giảm giá 10% cho các lần đặt tiếp theo!
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Primary Action: Login/Register */}
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 px-4 rounded-xl font-black text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 text-sm border border-amber-300 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Đăng ký / Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Action: Fast Guest Booking */}
            <button
              onClick={() => {
                onClose();
                onContinueGuest();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all border border-slate-200 text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tiếp tục đặt xe nhanh (không cần tài khoản)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { BookingRequest } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { CheckCircle2, Phone, X, ShieldCheck, Send, MessageCircle, Star } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';
import { useLanguage } from '../i18n/LanguageContext';

interface BookingModalProps {
  booking: BookingRequest | null;
  isOpen: boolean;
  onClose: () => void;
  telegramStatus?: any;
  onRateDriver?: (booking: BookingRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  telegramStatus,
  onRateDriver,
}) => {
  const { t } = useLanguage();

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 space-y-0 relative">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full border-2 border-slate-950 shadow-md"
            />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>{t.modals.confirmBookingTitle}</span>
                <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
              </h3>
              <p className="text-xs font-bold text-slate-900">ID: <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-xs">{booking.id}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Dispatch Notice */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.modals.confirmSubtitle}</span>
            </div>
            <p className="text-slate-300">
              Hotline: <strong className="text-amber-400">{booking.customerPhone}</strong>
            </p>
          </div>

          {/* Telegram Dispatch Indicator */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Telegram Dispatch:</span>
            </span>
            <span className={`font-bold ${telegramStatus?.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
              {telegramStatus?.ok
                ? '✓ Sent'
                : '✓ Processed'}
            </span>
          </div>

          {/* Detailed Summary */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <p className="font-bold text-amber-400 border-b border-slate-800 pb-2 uppercase tracking-wide">{t.summary.title}</p>
            
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{t.form.nameLabel}:</span>
              <span className="font-bold text-white">{booking.customerName} ({booking.customerPhone})</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{t.summary.vehicleType}:</span>
              <span className="font-bold text-amber-300">{booking.vehicleType}</span>
            </div>

            <div className="flex items-start justify-between text-slate-300 gap-2">
              <span className="text-slate-400 shrink-0">{t.summary.from}</span>
              <span className="font-semibold text-right text-emerald-400">{booking.pickupAddress}</span>
            </div>

            <div className="flex items-start justify-between text-slate-300 gap-2">
              <span className="text-slate-400 shrink-0">{t.summary.to}</span>
              <span className="font-semibold text-right text-rose-400">{booking.destinationAddress}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{t.summary.distance}:</span>
              <span className="font-bold text-white">{booking.distanceKm} km</span>
            </div>

            {booking.noteForDriver && (
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">{t.form.noteLabel}:</span>
                <span className="font-semibold text-amber-200">{booking.noteForDriver}</span>
              </div>
            )}

            {booking.needVat && (
              <div className="p-2 bg-slate-900 rounded border border-amber-500/20 text-amber-300">
                <span className="font-bold">VAT (+8%)</span>
              </div>
            )}

            {booking.breakdown?.originalPrice && booking.breakdown?.discountAmount ? (
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-emerald-500/30 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Giá gốc:</span>
                  <span className="line-through text-slate-400 font-medium">
                    {PriceCalculator.formatCurrency(booking.breakdown.originalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 uppercase">
                      {booking.breakdown.promoCode || 'MÃ ĐÃ ÁP'}
                    </span>
                    <span>{booking.breakdown.discountCodeName || 'Khuyến mãi App GOILAI247'}:</span>
                  </span>
                  <span className="font-bold">
                    -{PriceCalculator.formatCurrency(booking.breakdown.discountAmount)}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
              <div>
                <span className="font-extrabold uppercase text-slate-200">GIÁ THANH TOÁN:</span>
                <p className="text-[10px] text-emerald-400 font-medium">
                  Mã voucher: {booking.breakdown?.promoCode || 'GOILAI247'} (Đã giảm {PriceCalculator.formatCurrency(booking.breakdown?.discountAmount || 0)})
                </p>
              </div>
              <span className="text-xl font-black text-amber-400">
                {PriceCalculator.formatCurrency(booking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Direct Hotline Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 rounded-xl border border-slate-700 text-center space-y-2">
            <p className="text-xs text-slate-300">0971.999.734</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="tel:0971999734"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-300 transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>0971.999.734</span>
              </a>
              <a
                href="https://zalo.me/0971999734"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-500 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ZALO</span>
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {onRateDriver && (
            <button
              onClick={() => {
                onClose();
                onRateDriver(booking);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>Đánh Giá Chuyến Đi</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors text-center"
          >
            {t.modals.close}
          </button>
        </div>

      </div>
    </div>
  );
};


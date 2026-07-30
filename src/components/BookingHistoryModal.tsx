import React from 'react';
import { BookingRequest } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { X, History, Car, Phone, Clock, MapPin, CheckCircle, Trash2 } from 'lucide-react';

interface BookingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRequest[];
  onClearHistory: () => void;
}

export const BookingHistoryModal: React.FC<BookingHistoryModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Lịch Sử Đặt Xe Của Bạn</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-400">
              <Car className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
              <p className="text-sm font-semibold text-slate-300">Bạn chưa có chuyến xe nào được ghi nhận</p>
              <p className="text-xs text-slate-500">Đặt xe ngay trên trang chính để trải nghiệm dịch vụ lái xe hộ D.GO 247!</p>
            </div>
          ) : (
            bookings.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-amber-400">
                    Mã đơn: {item.id}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    item.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    item.status === 'CONFIRMED' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                    item.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {item.status === 'PENDING' ? 'Đang điều phối tài xế' :
                     item.status === 'CONFIRMED' ? 'Tài xế đang đến' :
                     item.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-300 pt-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong className="text-slate-400">Đón:</strong> {item.pickupAddress}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span><strong className="text-slate-400">Đến:</strong> {item.destinationAddress}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 font-medium">Loại xe: {item.vehicleType}</span>
                    <span className="font-extrabold text-amber-400 text-sm">
                      {PriceCalculator.formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
          {bookings.length > 0 && (
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa lịch sử</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors ml-auto"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

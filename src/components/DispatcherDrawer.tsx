import React, { useState, useEffect } from 'react';
import { BookingRequest } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { X, RefreshCw, Phone, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

interface DispatcherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DispatcherDrawer: React.FC<DispatcherDrawerProps> = ({ isOpen, onClose }) => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/booking/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-emerald-500/40 shadow-lg"
            />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Điều Hành Đơn Hàng D.GO 247</span>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">DISPATCHER</span>
              </h3>
              <p className="text-[11px] text-slate-400">Tự động đồng bộ Telegram Bot & hệ thống tổng đài</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Booking Cards List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-semibold text-slate-300">Chưa có đơn hàng nào trong hệ thống</p>
              <p className="text-xs text-slate-500 mt-1">Các đơn đặt mới sẽ tự động hiển thị ở đây và gửi qua Telegram Bot</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400 text-sm">{booking.id}</span>
                    <span className="text-xs text-slate-400">• {new Date(booking.createdAt).toLocaleTimeString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      booking.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      booking.status === 'CONFIRMED' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                      booking.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">Khách hàng:</p>
                    <p className="font-bold text-white text-sm">{booking.customerName}</p>
                    <a
                      href={`tel:${booking.customerPhone}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{booking.customerPhone}</span>
                    </a>
                  </div>

                  <div>
                    <p className="text-slate-400">Loại xe & Cước phí:</p>
                    <p className="font-bold text-amber-300">{booking.vehicleType} ({booking.distanceKm} km)</p>
                    <p className="font-black text-amber-400 text-base">
                      {PriceCalculator.formatCurrency(booking.totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <p><strong className="text-emerald-400">Đón:</strong> {booking.pickupAddress}</p>
                  <p><strong className="text-rose-400">Đến:</strong> {booking.destinationAddress}</p>
                  {booking.noteForDriver && (
                    <p className="text-amber-300"><strong className="text-slate-400">Ghi chú:</strong> {booking.noteForDriver}</p>
                  )}
                </div>

                {/* Status Changer Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Cập nhật trạng thái:</span>
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                    className="px-2.5 py-1 text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg border border-sky-500/30"
                  >
                    Đang đến
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30"
                  >
                    Hoàn thành
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                    className="px-2.5 py-1 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/30"
                  >
                    Hủy đơn
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
          >
            Đóng Màn Hình Điều Hành
          </button>
        </div>

      </div>
    </div>
  );
};

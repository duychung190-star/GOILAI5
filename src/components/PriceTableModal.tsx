import React from 'react';
import { X, FileText, Moon, Clock, Phone, AlertCircle } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';
import { useLanguage } from '../i18n/LanguageContext';

interface PriceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceTableModal: React.FC<PriceTableModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const priceTiers = [
    { distance: '1 - 5 km đầu tiên', price: '250.000 VNĐ' },
    { distance: 'Km thứ 6 đến Km thứ 10', price: '350.000 VNĐ' },
    { distance: 'Km thứ 11 trở đi', price: '350.000đ + 15.000đ/km' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full border border-slate-700 shadow"
            />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{t.modals.priceTableTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-400">GOILAI247.COM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Section 1: Distance Table */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 mb-2 uppercase tracking-wide">
              1. Bảng giá lái hộ tính theo Kilomet (Lượt)
            </h4>
            <div className="overflow-hidden rounded-xl border border-slate-800 space-y-3">
              
              {/* Table A: Ô tô / Xe máy */}
              <div className="bg-slate-950 p-3 rounded-t-xl border-b border-slate-800">
                <p className="font-extrabold text-xs text-emerald-400 uppercase">A. Gói Ô tô / Xe máy</p>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2">Khoảng Cách</th>
                    <th className="px-4 py-2">Giá Cước Niêm Yết (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  <tr className="bg-slate-900/30">
                    <td className="px-4 py-2 font-medium text-slate-200">10 km đầu tiên</td>
                    <td className="px-4 py-2 font-bold text-amber-300">350.000 VNĐ</td>
                  </tr>
                  <tr className="bg-slate-900/80">
                    <td className="px-4 py-2 font-medium text-slate-200">Từ km thứ 11 trở đi</td>
                    <td className="px-4 py-2 font-bold text-amber-300">+15.000 VNĐ / km</td>
                  </tr>
                </tbody>
              </table>

              {/* Table B: Xe Sang */}
              <div className="bg-slate-950 p-3 border-y border-slate-800">
                <p className="font-extrabold text-xs text-amber-400 uppercase">B. Gói Xe Sang (Luxury)</p>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2">Khoảng Cách</th>
                    <th className="px-4 py-2">Giá Cước Niêm Yết (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  <tr className="bg-slate-900/30">
                    <td className="px-4 py-2 font-medium text-slate-200">10 km đầu tiên</td>
                    <td className="px-4 py-2 font-bold text-amber-300">400.000 VNĐ</td>
                  </tr>
                  <tr className="bg-slate-900/80">
                    <td className="px-4 py-2 font-medium text-slate-200">Từ km thứ 11 trở đi</td>
                    <td className="px-4 py-2 font-bold text-amber-300">+20.000 VNĐ / km</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>

          {/* Section 2: Hourly Rental (Combo 3h) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>2. Thuê Tài Xế Theo Giờ (Combo 3h - 10h)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <p className="font-bold text-emerald-400">Gói Ô tô / Xe máy</p>
                <p>• 3 giờ đầu tiên: <strong className="text-amber-300">450.000 VNĐ</strong></p>
                <p>• Từ giờ thứ 4 đến giờ 10: <strong className="text-amber-300">+100.000 VNĐ / giờ</strong></p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <p className="font-bold text-amber-400">Gói Xe Sang</p>
                <p>• 3 giờ đầu tiên: <strong className="text-amber-300">500.000 VNĐ</strong></p>
                <p>• Từ giờ thứ 4 đến giờ 10: <strong className="text-amber-300">+150.000 VNĐ / giờ</strong></p>
              </div>
            </div>
          </div>

          {/* Section 3: Daily Rental (24h) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>3. Thuê Lái Theo Ngày (24 GIỜ)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <p className="font-bold text-emerald-400">Gói Ô tô / Xe máy</p>
                <p>• Mức giá nguyên ngày (24h): <strong className="text-amber-300 text-sm">1.200.000 VNĐ / ngày</strong></p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <p className="font-bold text-amber-400">Gói Xe Sang</p>
                <p>• Mức giá nguyên ngày (24h): <strong className="text-amber-300 text-sm">1.800.000 VNĐ / ngày</strong></p>
              </div>
            </div>
          </div>

          {/* Section 4: Night Surcharge Note */}
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-400" />
              <span>4. Phụ Phí Đêm (Khung Giờ Khuya)</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-1">
              <p>• Khung giờ <strong className="text-white">23:00 - 23:59</strong>: Cộng thêm <strong className="text-amber-300">10%</strong> tổng cước cơ bản</p>
              <p>• Khung giờ <strong className="text-white">00:00 - 04:59</strong>: Cộng thêm <strong className="text-amber-300">20%</strong> tổng cước cơ bản</p>
            </div>
          </div>

          {/* Section 5: Food & Lodging & Additional Notes */}
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-400/40 space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-amber-300 text-xs">
                  (Lưu ý: Giá trên chưa bao gồm hỗ trợ chi phí ăn ở cho tài xế)
                </p>
                <p className="text-slate-400">
                  - Bảng giá trên chưa bao gồm phát sinh thời gian chờ (+60.000đ/giờ chờ) và phụ phí khi phát sinh thêm điểm dừng.
                </p>
                <p className="font-semibold text-amber-400">
                  Hotline tư vấn 24/7: <a href="tel:0971999734" className="underline hover:text-amber-300">0971.999.734</a>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
          <a
            href="tel:0971999734"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Gọi Hotline 0971.999.734</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
          >
            {t.modals.close}
          </button>
        </div>

      </div>
    </div>
  );
};

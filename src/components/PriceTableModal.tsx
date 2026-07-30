import React from 'react';
import { X, FileText, Moon, Clock, Phone, AlertCircle } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

interface PriceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceTableModal: React.FC<PriceTableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const priceTiers = [
    { distance: '1 - 3 km', price: '238.000 VNĐ' },
    { distance: '4 km', price: '254.000 VNĐ' },
    { distance: '5 km', price: '270.000 VNĐ' },
    { distance: '6 km', price: '286.000 VNĐ' },
    { distance: '7 km', price: '302.000 VNĐ' },
    { distance: '8 km', price: '318.000 VNĐ' },
    { distance: '9 km', price: '334.000 VNĐ' },
    { distance: '10 km', price: '350.000 VNĐ' },
    { distance: '11 km', price: '365.000 VNĐ' },
    { distance: '12 km', price: '380.000 VNĐ' },
    { distance: '13 km', price: '395.000 VNĐ' },
    { distance: '14 km', price: '410.000 VNĐ' },
    { distance: '15 km', price: '425.000 VNĐ' },
    { distance: '16 km', price: '440.000 VNĐ' },
    { distance: '17 km', price: '455.000 VNĐ' },
    { distance: '18 km', price: '470.000 VNĐ' },
    { distance: '19 km', price: '485.000 VNĐ' },
    { distance: '20 km', price: '500.000 VNĐ' },
    { distance: '21 km', price: '513.000 VNĐ' },
    { distance: '22 km', price: '526.000 VNĐ' },
    { distance: '23 km', price: '539.000 VNĐ' },
    { distance: '24 km', price: '552.000 VNĐ' },
    { distance: '25 km', price: '565.000 VNĐ' },
    { distance: 'Từ km 26 trở đi', price: '565.000đ + 12.000đ/km' },
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
                <span>Bảng Giá Chi Tiết D.GO</span>
                <span className="text-amber-400 text-xs font-semibold">(GOILAI247.COM)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Dịch vụ lái xe hộ niêm yết minh bạch</p>
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
            <h4 className="text-sm font-bold text-amber-400 mb-2 uppercase tracking-wide">1. Bảng giá tính theo Kilomet (Xe máy, Ô tô 4-7 chỗ, Bán tải)</h4>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-amber-400 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Khoảng Cách (KM)</th>
                    <th className="px-4 py-2.5">Giá Cước Niêm Yết (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {priceTiers.map((tier, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/80'}>
                      <td className="px-4 py-2 font-medium text-slate-200">{tier.distance}</td>
                      <td className="px-4 py-2 font-bold text-amber-300">{tier.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Hourly Rental */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>2. Thuê Tài Xế Theo Giờ (Gói Combo)</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-1">
              <p>• Combo 3 giờ đầu tiên: <strong className="text-amber-300">500.000 VNĐ</strong></p>
              <p>• Từ giờ thứ 4 trở đi: <strong className="text-amber-300">+100.000 VNĐ / giờ</strong></p>
            </div>
          </div>

          {/* Section 3: Night Surcharge */}
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-400" />
              <span>3. Phụ Phí Đêm Khung Giờ Khuya</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-1">
              <p>• Khung giờ <strong className="text-white">23:00 - 23:59</strong>: Cộng thêm <strong className="text-amber-300">10%</strong> tổng cước</p>
              <p>• Khung giờ <strong className="text-white">00:00 - 05:00</strong>: Cộng thêm <strong className="text-amber-300">20%</strong> tổng cước</p>
            </div>
          </div>

          {/* Section 4: Wait Time & Additional Notes */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">Ghi chú quan trọng về phí chờ & điểm dừng:</p>
                <p className="mt-1">
                  - Bảng giá trên chưa bao gồm phát sinh thời gian chờ (+60.000đ/h trước 20:00 và +80.000đ/h sau 20:00).
                </p>
                <p>
                  - Phụ phí phát sinh khi thêm điểm đón / trả khách trên đường đi.
                </p>
                <p className="mt-1 font-semibold text-amber-400">
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
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

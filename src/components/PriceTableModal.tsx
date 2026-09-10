import React, { useState } from 'react';
import { X, FileText, Moon, Clock, Phone, PhoneCall, AlertCircle, Image as ImageIcon, Sparkles, Check, ZoomIn } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';
import priceTableImg from '../assets/images/dgo_price_table_1788925910805.jpg';
import { useLanguage } from '../i18n/LanguageContext';

interface PriceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceTableModal: React.FC<PriceTableModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'details' | 'image'>('details');
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
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
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>{t.modals.priceTableTitle}</span>
              </h3>
              <p className="text-[11px] text-amber-400 font-semibold">GOILAI247.COM • BẢNG GIÁ NIÊM YẾT CHÍNH THỨC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bảng Chi Tiết</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'image'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Ảnh BẢNG GIÁ</span>
            </button>
          </div>

          <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Cam kết minh bạch 100%
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
          
          {activeTab === 'image' ? (
            <div className="space-y-3 animate-fadeIn">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl group">
                <img
                  src={priceTableImg}
                  alt="Bảng giá công khai D.GO 247"
                  referrerPolicy="no-referrer"
                  className={`w-full object-contain transition-all duration-300 ${isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold text-amber-300 border border-slate-700 flex items-center gap-1.5 pointer-events-none">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomed ? 'Click để thu nhỏ' : 'Click để phóng to'}</span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400">
                Bảng giá niêm yết chính thức của dịch vụ lái xe hộ D.GO 247 trên toàn quốc.
              </p>
            </div>
          ) : (
            <>
              {/* Top Quick Banner Image Preview */}
              <div 
                onClick={() => setActiveTab('image')}
                className="p-3 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={priceTableImg}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-amber-400/50 shrink-0"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Xem Poster BẢNG GIÁ</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">Nhấn vào đây để xem ảnh bảng giá niêm yết độ nét cao</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 px-2.5 py-1 bg-amber-500/20 rounded-lg border border-amber-500/40 shrink-0">
                  Xem ảnh →
                </span>
              </div>

              {/* Section 1: Distance Table */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>1. Bảng Giá Lái Hộ Tính Theo Kilomet (Theo Cuốc)</span>
                </h4>
                
                <div className="overflow-hidden rounded-xl border border-slate-800">
                  
                  {/* Table A: Xe máy / Ô tô */}
                  <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
                    <p className="font-black text-xs text-emerald-400 uppercase">A. Xe Máy & Ô Tô Tiêu Chuẩn</p>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Phổ Biến Nhất
                    </span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Khoảng Cách</th>
                        <th className="px-4 py-2.5">Quy Định Giá</th>
                        <th className="px-4 py-2.5 text-right">Mức Giá Niêm Yết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      <tr className="bg-slate-900/30">
                        <td className="px-4 py-2.5 font-medium text-slate-200">10 km đầu tiên</td>
                        <td className="px-4 py-2.5 text-slate-400">Trọn gói mở cuốc</td>
                        <td className="px-4 py-2.5 font-bold text-amber-300 text-right">350.000 VNĐ</td>
                      </tr>
                      <tr className="bg-slate-900/60">
                        <td className="px-4 py-2.5 font-medium text-amber-400">Từ km thứ 11 trở đi</td>
                        <td className="px-4 py-2.5 text-slate-400">Cộng thêm theo km</td>
                        <td className="px-4 py-2.5 font-bold text-amber-300 text-right">+15.000 VNĐ / km</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Table B: Xe sang (Luxury) */}
                  <div className="bg-slate-950 p-3 border-y border-slate-800 flex items-center justify-between">
                    <p className="font-black text-xs text-amber-400 uppercase">B. Dịch Vụ Xe Sang (Luxury VIP)</p>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      Tài Xế Cao Cấp
                    </span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Khoảng Cách</th>
                        <th className="px-4 py-2.5">Quy Định Giá</th>
                        <th className="px-4 py-2.5 text-right">Mức Giá Niêm Yết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      <tr className="bg-slate-900/30">
                        <td className="px-4 py-2.5 font-medium text-slate-200">10 km đầu tiên</td>
                        <td className="px-4 py-2.5 text-slate-400">Trọn gói mở cuốc</td>
                        <td className="px-4 py-2.5 font-bold text-amber-300 text-right">450.000 VNĐ</td>
                      </tr>
                      <tr className="bg-slate-900/60">
                        <td className="px-4 py-2.5 font-medium text-amber-400">Từ km thứ 11 trở đi</td>
                        <td className="px-4 py-2.5 text-slate-400">Cộng thêm theo km</td>
                        <td className="px-4 py-2.5 font-bold text-amber-300 text-right">+20.000 VNĐ / km</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Waiting Fee Banner - Highlighted */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-black text-amber-300 text-xs sm:text-sm uppercase tracking-wide block">
                          QUY ĐỊNH PHÍ CHỜ: 40.000 VNĐ / 30 PHÚT
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          Áp dụng khi tài xế chờ khách tại các điểm dừng hoặc chờ theo yêu cầu riêng
                        </span>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="inline-block text-xs sm:text-sm font-black text-slate-950 bg-amber-400 px-3 py-1 rounded-lg border border-amber-300 shadow-sm">
                        40.000đ / 30 phút
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Dedicated Highlight Card: Phí chờ 40.000đ/30 phút */}
              <div className="p-3 bg-slate-950 rounded-xl border border-amber-400/60 shadow-sm flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-amber-300 uppercase">
                      ⏱️ PHÍ CHỜ TÍNH THEO BLOCK: 40.000 VNĐ / 30 PHÚT
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Thời gian chờ phát sinh trong suốt hành trình được tính minh bạch và cộng vào cước cuối chuyến.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
                  40.000đ / 30p
                </span>
              </div>

              {/* Section 2: Hourly Rental */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>2. Thuê Tài Xế Theo Giờ</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <p className="font-black text-emerald-400 uppercase text-[11px]">Xe Máy & Ô Tô Thường</p>
                    <p>• 3 giờ đầu tiên: <strong className="text-amber-300 text-sm">500.000 VNĐ</strong></p>
                    <p>• Từ giờ thứ 4 trở đi: <strong className="text-amber-300">+150.000 VNĐ / giờ</strong></p>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      * Khóa block 10 tiếng tính lại từ đầu
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <p className="font-black text-amber-400 uppercase text-[11px]">Dịch Vụ Xe Sang (Luxury)</p>
                    <p>• 3 giờ đầu tiên: <strong className="text-amber-300 text-sm">600.000 VNĐ</strong></p>
                    <p>• Từ giờ thứ 4 trở đi: <strong className="text-amber-300">+180.000 VNĐ / giờ</strong></p>
                    <p className="text-[11px] text-amber-300/80 pt-1 border-t border-slate-800">
                      * Tính cộng thêm 20% so với giá gói thường
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Daily Rental (24h) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>3. Thuê Lái Theo Ngày (24 GIỜ)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <p className="font-black text-emerald-400 uppercase text-[11px]">Xe Máy & Ô Tô Thường</p>
                    <p>• Mức giá nguyên ngày (24h):</p>
                    <p className="text-amber-300 font-extrabold text-base">1.500.000 VNĐ / ngày</p>
                  </div>
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <p className="font-black text-amber-400 uppercase text-[11px]">Dịch Vụ Xe Sang</p>
                    <p>• Mức giá nguyên ngày (24h):</p>
                    <p className="text-amber-300 font-extrabold text-base">2.000.000 VNĐ / ngày</p>
                  </div>
                </div>
                <p className="text-[11px] text-amber-300/90 italic">
                  (Lưu ý: Giá thuê theo ngày trên chưa bao gồm hỗ trợ chi phí ăn ở cho tài xế)
                </p>

                {/* Banner Đặt xe đi tỉnh, đường dài */}
                <div className="p-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-black text-amber-300 uppercase leading-snug">
                      QUÝ KHÁCH CẦN ĐẶT TÀI XẾ ĐI TỈNH, ĐƯỜNG DÀI VUI LÒNG LIÊN HỆ TRỰC TIẾP ĐỂ ĐƯỢC HỖ TRỢ TƯ VẤN GIÁ TỐT NHẤT
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      Hỗ trợ thỏa thuận giá trọn gói ưu đãi nhất theo từng cung đường thực tế • Hotline: <span className="font-bold text-amber-400">0877.683.536</span>
                    </p>
                  </div>
                  <a
                    href="tel:0877683536"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-lg border border-amber-300 shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 fill-slate-950" />
                    <span>GỌI NGAY</span>
                  </a>
                </div>
              </div>

              {/* Section 4: Night Surcharge Note */}
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
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
                      Ưu Đãi Đặc Biệt: Giảm 10% Cho Chuyến Đi Đầu Tiên Hoặc Chuyến Đi Theo Bảng Giá
                    </p>
                    <p className="text-slate-300">
                      - Trường hợp đi nhiều điểm hoặc chưa chốt điểm đến, khách hàng chọn <strong className="text-amber-400 uppercase">ĐI THEO BẢNG GIÁ</strong> và nhận ngay mã <strong className="text-emerald-400">DGO10</strong> giảm 10% sau chuyến đi.
                    </p>
                    <p className="text-amber-300 font-bold">
                      - Quy định phí chờ: <strong className="text-white bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">40.000 VNĐ / 30 phút</strong> (tính theo block 30 phút).
                    </p>
                    <p className="font-semibold text-amber-400">
                      Hotline tư vấn 24/7: <a href="tel:0877683536" className="underline hover:text-amber-300">0877.683.536</a>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
          <a
            href="tel:0877683536"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Gọi Hotline 0877.683.536</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {t.modals.close}
          </button>
        </div>

      </div>
    </div>
  );
};

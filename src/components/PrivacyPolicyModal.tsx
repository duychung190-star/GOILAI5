import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, X, Phone, MapPin } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full border border-amber-400/50 shadow"
            />
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Chính Sách Bảo Mật Quyền Riêng Tư</span>
              </h3>
              <p className="text-[11px] text-slate-400">D.GO 247 - Cam kết bảo vệ dữ liệu khách hàng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          
          <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-300 text-xs">Cam Kết An Toàn Tuyệt Đối</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                D.GO 247 luôn tôn trọng và cam kết bảo vệ dữ liệu cá nhân của quý khách khi sử dụng dịch vụ lái xe hộ trên WebApp.
              </p>
            </div>
          </div>

          {/* Policy Section 1 */}
          <div className="space-y-1.5">
            <h5 className="font-extrabold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Thu Thập & Sử Dụng Số Điện Thoại, Tên Khách Hàng</span>
            </h5>
            <p>
              • Thông tin họ tên và số điện thoại chỉ được thu thập nhằm mục đích điều phối tài xế liên hệ đón khách đúng thời gian và địa điểm.
            </p>
            <p>
              • D.GO 247 tuyệt đối <strong>không mua bán, chia sẻ hoặc tiết lộ</strong> thông tin cá nhân của quý khách cho bất kỳ bên thứ ba nào ngoài mục đích điều xe.
            </p>
          </div>

          {/* Policy Section 2 */}
          <div className="space-y-1.5">
            <h5 className="font-extrabold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Quyền Truy Cập Vị Trí Định Vị (Geolocation)</span>
            </h5>
            <p>
              • Quyền truy cập vị trí GPS chỉ được kích hoạt khi quý khách chủ động bấm nút <em>"Lấy vị trí hiện tại"</em> trên ứng dụng.
            </p>
            <p>
              • Nếu quý khách <strong>từ chối (Denied)</strong> cấp quyền vị trí, ứng dụng tự động chuyển sang chế độ gõ địa chỉ thủ công hoặc tìm kiếm Google Places / Goong Map mà không hề ảnh hưởng đến trải nghiệm đặt xe.
            </p>
            <p>
              • Vị trí GPS không bao giờ bị theo dõi ngầm hay lưu trữ trái phép sau khi chuyến đi kết thúc.
            </p>
          </div>

          {/* Policy Section 3 */}
          <div className="space-y-1.5">
            <h5 className="font-extrabold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. Bảo Mật Lịch Sử Đặt Xe & Đánh Giá Dịch Vụ</span>
            </h5>
            <p>
              • Lịch sử các chuyến đi được lưu trữ bảo mật trên thiết bị của quý khách và hệ thống điều xe trung tâm.
            </p>
            <p>
              • Các phản hồi, nhận xét và số sao đánh giá tài xế được hiển thị công khai dạng viết tắt (VD: <em>097****734</em>) để đảm bảo tính riêng tư cá nhân.
            </p>
          </div>

          {/* Policy Section 4 */}
          <div className="space-y-1.5">
            <h5 className="font-extrabold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>4. Quyền Của Khách Hàng</span>
            </h5>
            <p>
              • Quý khách có quyền yêu cầu chỉnh sửa, xóa lịch sử hoặc thông tin cá nhân bất cứ lúc nào thông qua Tổng đài chăm sóc khách hàng Hotline: <strong className="text-amber-400">0877.683.536</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Chính sách áp dụng tự động cho tất cả người dùng hệ thống D.GO 247 trên toàn quốc.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors"
          >
            ĐÃ HỂU & ĐỒNG Ý
          </button>
        </div>

      </div>
    </div>
  );
};

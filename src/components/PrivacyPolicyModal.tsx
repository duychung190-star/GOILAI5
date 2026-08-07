import React from 'react';
import { ShieldCheck, Lock, MapPin, UserCheck, Share2, Trash2, Globe, Phone, X, ExternalLink } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-amber-400/50 shadow"
            />
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>CHÍNH SÁCH BẢO MẬT THÔNG TIN</span>
              </h3>
              <p className="text-[11px] text-slate-400">CHÍNH SÁCH RIÊNG TƯ - D.GO GOILAI247</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          
          {/* Top Tagline */}
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-300 text-[11px]">
            <p className="font-bold">
              Áp dụng cho Ứng dụng: <span className="text-white">D.GO GOILAI247</span>
            </p>
            <p className="text-slate-400 mt-0.5">
              Cập nhật lần cuối: Ngày 07 tháng 08 năm 2026
            </p>
          </div>

          <p className="text-slate-200">
            Chào mừng bạn đến với ứng dụng <strong>D.GO GOILAI247</strong>. Việc bảo vệ dữ liệu cá nhân và quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Bản Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn khi bạn sử dụng ứng dụng D.GO.
          </p>

          {/* Section 1: Dữ liệu thu thập & mục đích */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Dữ liệu chúng tôi thu thập và mục đích sử dụng</span>
            </h4>
            <p className="text-slate-300">
              Để cung cấp dịch vụ gọi xe và lái xe một cách chính xác, an toàn và nhanh chóng, D.GO GOILAI247 yêu cầu thu thập các thông tin sau:
            </p>

            <div className="pl-2 space-y-2 pt-1">
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Vị trí dữ liệu (Dữ liệu vị trí):
                </p>
                <ul className="pl-4 space-y-1 text-slate-300 mt-1 list-disc">
                  <li>
                    <strong>Mục tiêu:</strong> Ứng dụng D.GO thu thập dữ liệu hiện tại của bạn để tự động gợi ý "Điểm đón", điều phối tài xế ở vị trí gần bạn nhất và tính toán chính xác khoảng đường di chuyển hướng ra mức giá minh bạch.
                  </li>
                  <li>
                    <strong>Phạm vi:</strong> Chúng tôi chỉ thu thập vị trí của bạn khi bạn mở và sử dụng ứng dụng (Foreground Location). Chúng tôi không theo dõi vị trí của bạn khi bạn đóng ứng dụng. Bạn hoàn toàn có thể cấp quyền hoặc thu hồi quyền truy cập vị trí này bất cứ lúc nào trong phần Cài đặt điện thoại.
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Thông tin cơ sở cá nhân:
                </p>
                <ul className="pl-4 space-y-1 text-slate-300 mt-1 list-disc">
                  <li>
                    <strong>Bao gồm:</strong> Họ và Tên, Số điện thoại.
                  </li>
                  <li>
                    <strong>Mục đích:</strong> Sử dụng để định danh chuyến đi, giúp tài xế có thể liên lạc với bạn khi đến điểm đón, và để bộ phận chăm sóc khách hàng hỗ trợ bạn trong trường hợp có sự cố phát sinh.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Cách chia sẻ dữ liệu */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Cách chúng tôi chia sẻ dữ liệu</span>
            </h4>
            <p className="text-slate-300">
              Nhằm mục đích vận hành dịch vụ, thông tin cuốc xe của bạn (Bao gồm: Tên, Số điện thoại, Điểm đi, Điểm đến) sẽ được chuyển tiếp an toàn thông qua hệ thống nội bộ đến tài xế đã tiếp nhận chuyến đi của bạn.
            </p>
          </div>

          {/* Section 3: Cam kết bảo vệ dữ liệu */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Dữ liệu bảo vệ kết nối cam kết</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
              <li>
                Chúng tôi cam kết tuyệt đối <strong className="text-rose-400">KHÔNG BÁN, cho thuê hoặc trao đổi</strong> dữ liệu cá nhân cũng như vị trí dữ liệu của bạn cho bất kỳ bên thứ ba nào vì mục tiêu quảng cáo, tiếp thị hoặc thương mại.
              </li>
              <li>
                Thông tin của bạn chỉ có thể lưu trữ mục tiêu cho chuyến đi và giải đáp thắc mắc (nếu có).
              </li>
            </ul>
          </div>

          {/* Section 4: Quyền người dùng & Xóa dữ liệu */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Quyền của người dùng và Xóa dữ liệu</span>
            </h4>
            <p className="text-slate-300">
              Bạn có toàn quyền kiểm soát dữ liệu của mình. Nếu bạn muốn thay đổi thông tin cá nhân hoặc yêu cầu xóa hoàn toàn lịch sử chuyến đi/dữ liệu cá nhân khỏi hệ thống của D.GO GOILAI247, bạn có thể thực hiện theo các cách sau:
            </p>
            <ul className="space-y-1.5 text-slate-300 list-disc pl-4 pt-1">
              <li>
                Gọi điện trực tiếp đến Đường dây nóng hỗ trợ của chúng tôi: <a href="tel:0971999734" className="text-amber-400 font-bold underline">0971.999.734</a>.
              </li>
              <li>
                Từ chối quyền truy cập vị trí của ứng dụng trong phần cài đặt thiết bị.
              </li>
            </ul>
          </div>

          {/* Section 5: Liên hệ */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Liên hệ với chúng tôi</span>
            </h4>
            <p className="text-slate-300">
              Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này hoặc cách ứng dụng xử lý thông tin, vui lòng liên hệ với bộ phận hỗ trợ DGOTEAM:
            </p>
            <div className="pt-1 space-y-1 text-slate-300 font-medium">
              <p className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Trang web:</span>
                <a href="https://goilai247.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline flex items-center gap-1 font-bold">
                  https://goilai247.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đường dây nóng:</span>
                <a href="tel:0971999734" className="text-amber-400 font-bold hover:underline">0971.999.734</a>
              </p>
              <p className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Khu vực hoạt động chính:</span>
                <strong className="text-white">Việt Nam</strong>
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            ĐÃ HỂU & ĐỒNG Ý
          </button>
        </div>

      </div>
    </div>
  );
};

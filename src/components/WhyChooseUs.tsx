import React from 'react';
import { UserCheck, Clock, ShieldCheck, Headphones, Award } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

export const WhyChooseUs: React.FC = () => {
  const advantages = [
    {
      icon: UserCheck,
      title: "Tài Xế Chuyên Nghiệp",
      desc: "Được tuyển chọn kỹ lưỡng, có giấy phép lái xe chuẩn, thông thuộc mọi cung đường và ứng xử lịch sự."
    },
    {
      icon: Clock,
      title: "Đúng Giờ Tối Đa",
      desc: "Có mặt ngay sau 10 - 15 phút gọi điện. Luôn cam kết chuẩn giờ hẹn để quý khách không phải chờ đợi."
    },
    {
      icon: ShieldCheck,
      title: "An Toàn Tối Đa",
      desc: "Cam kết cẩn thận, tận tâm và đảm bảo an toàn tuyệt đối cho người và xe trong suốt hành trình di chuyển."
    },
    {
      icon: Headphones,
      title: "Phục Vụ 24/7",
      desc: "Tổng đài và đội ngũ lái xe sẵn sàng túc trực 24/7 kể cả ngày nghỉ, Lễ, Tết hay đêm khuya muộn."
    }
  ];

  return (
    <div className="bg-slate-900 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src={dgoLogoImg}
              alt="DGO Official Badge"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full shadow-xl border-2 border-slate-700/80 ring-4 ring-amber-500/10"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>THƯƠNG HIỆU D.GO - GOILAI247.COM</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tại Sao Khách Hàng Luôn Tin Chọn <span className="text-amber-400">D.GO 247</span>?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Giải pháp lái xe hộ uy tín mang lại sự an tâm tuyệt đối trên mọi nẻo đường
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

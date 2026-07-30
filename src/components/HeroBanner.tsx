import React from 'react';
import { ShieldCheck, Clock, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';
import headerBgImg from '../assets/images/header_bg_banner_1785395640428.jpg';

interface HeroBannerProps {
  onOpenPriceTable: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenPriceTable }) => {
  return (
    <div className="relative overflow-hidden bg-slate-950 pt-8 pb-10 border-b border-slate-800/80">
      
      {/* Header Background Image Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={headerBgImg}
          alt="D.GO Gọi Lái Xe 247 Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-70 brightness-105 contrast-105 scale-105 transition-all duration-700"
        />
        {/* Lighter Gradient Overlay for Increased Image Visibility & Sharp Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/50 to-slate-950/85" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/30 to-slate-950/80" />
      </div>

      {/* Subtle Background Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-r from-blue-600/20 via-amber-500/20 to-cyan-500/20 blur-[110px] pointer-events-none rounded-full z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          
          {/* Main Official Logo Hero Emblem */}
          <div className="flex justify-center mb-2">
            <div className="relative group cursor-pointer" onClick={onOpenPriceTable}>
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-amber-400 to-cyan-400 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center gap-3 bg-slate-950/90 border border-slate-800 p-2 pr-5 rounded-full shadow-2xl backdrop-blur-md">
                <img
                  src={dgoLogoImg}
                  alt="DGO - DỊCH VỤ LÁI XE HỘ - GOILAI247.COM"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg border-2 border-slate-700/80"
                />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs sm:text-sm font-black tracking-wider uppercase">D.GO 247</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Chính Thức</span>
                  </div>
                  <p className="text-white text-xs sm:text-sm font-extrabold tracking-tight">DỊCH VỤ LÁI XE HỘ - GOILAI247.COM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Dịch Vụ Lái Xe Hộ Chuyên Nghiệp Hàng Đầu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Có mặt sau 10-15 phút</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Bạn Đợi Tiệc Vui – <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">D.GO Lái Xe An Toàn Về Nhà</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Đặt tài xế riêng lái ô tô, xe máy đưa bạn và xế yêu về tận nhà an toàn 24/7. Không lo vi phạm nồng độ cồn, không ngại mệt mỏi hay đường xa.
          </p>

          {/* Quick Features List */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">An Toàn 100%</p>
                <p className="text-[11px] text-slate-400">Tài xế lành nghề</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Phục Vụ 24/7</p>
                <p className="text-[11px] text-slate-400">Bất kể ngày đêm</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Minh Bạch Cước</p>
                <p className="text-[11px] text-slate-400">Biết trước số tiền</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Lái Xe An Toàn</p>
                <p className="text-[11px] text-slate-400">Cẩn thận & Trách nhiệm</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

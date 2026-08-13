import React from 'react';
import { ShieldCheck, Clock, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';
import headerBgImg from '../assets/images/dgo_app_background_1786608739136.jpg';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroBannerProps {
  onOpenPriceTable?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenPriceTable }) => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-amber-50/60 pt-8 pb-10 border-b border-amber-200/60">
      
      {/* Header Background Image Overlay - Bright Daytime Bac Ninh Cultural Center */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={headerBgImg}
          alt="D.GO Lái Xe Hộ Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-90 brightness-100 contrast-105 scale-100 transition-all duration-700"
        />
        {/* Soft Gradient Overlay for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/50 to-slate-100/90" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-white/30 to-white/70" />
      </div>

      {/* Subtle Background Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-r from-amber-300/30 via-orange-300/20 to-sky-300/30 blur-[100px] pointer-events-none rounded-full z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          
          {/* Main Official Logo Hero Emblem */}
          <div className="flex justify-center mb-2">
            <div className={`relative group ${onOpenPriceTable ? 'cursor-pointer' : ''}`} onClick={onOpenPriceTable}>
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center gap-3 bg-white/95 border border-amber-200/90 p-2 pr-5 rounded-full shadow-xl backdrop-blur-md">
                <img
                  src={dgoLogoImg}
                  alt="DGO - DỊCH VỤ LÁI XE HỘ - GOILAI247.COM"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-md border-2 border-amber-400/80"
                />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-700 text-xs sm:text-sm font-black tracking-wider uppercase">D.GO 247</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">Official</span>
                  </div>
                  <p className="text-slate-900 text-xs sm:text-sm font-extrabold tracking-tight">DỊCH VỤ LÁI XE HỘ - GOILAI247.COM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Pill Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-900 text-xs font-extrabold shadow-sm backdrop-blur-sm animate-pulse">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Ưu đãi HOT</span>
            <span>Tặng mã giảm giá 10% khi gọi lái xe qua App GOILAI247!</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t.hero.mainTitle}<span className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">{t.hero.mainTitleHighlight}</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
            {t.hero.description}
          </p>

          {/* Quick Features List */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">{t.hero.feat1Title}</p>
                <p className="text-[11px] text-slate-600">{t.hero.feat1Sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-sm">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">{t.hero.feat2Title}</p>
                <p className="text-[11px] text-slate-600">{t.hero.feat2Sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-sm">
              <Award className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">{t.hero.feat3Title}</p>
                <p className="text-[11px] text-slate-600">{t.hero.feat3Sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">{t.hero.feat4Title}</p>
                <p className="text-[11px] text-slate-600">{t.hero.feat4Sub}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


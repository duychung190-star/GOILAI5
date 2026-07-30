import React from 'react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick
}) => {
  // Dimensions mapping
  const sizeMap = {
    sm: { img: 'w-8 h-8', textTitle: 'text-base', textSub: 'text-[9px]' },
    md: { img: 'w-11 h-11', textTitle: 'text-lg sm:text-xl', textSub: 'text-[11px]' },
    lg: { img: 'w-14 h-14', textTitle: 'text-xl sm:text-2xl', textSub: 'text-xs' },
    xl: { img: 'w-20 h-20', textTitle: 'text-2xl sm:text-3xl', textSub: 'text-sm' },
    '2xl': { img: 'w-28 h-28', textTitle: 'text-3xl sm:text-4xl', textSub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 group ${onClick ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      {/* Circular Emblem Container with Metallic Chrome Navy Glow */}
      <div className="relative shrink-0 flex items-center justify-center rounded-full p-0.5 bg-gradient-to-tr from-sky-600 via-blue-950 to-amber-400 shadow-lg shadow-blue-950/40 group-hover:scale-105 transition-all duration-300">
        <img
          src={dgoLogoImg}
          alt="D.GO - Dịch Vụ Lái Xe Hộ - GOILAI247.COM"
          referrerPolicy="no-referrer"
          className={`${currentSize.img} rounded-full object-cover shadow-inner ring-2 ring-slate-900/80`}
        />
        
        {/* Pulse Indicator dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
        </span>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${currentSize.textTitle} font-black tracking-tight text-white font-sans drop-shadow-sm`}>
              D.GO <span className="text-amber-400 font-black">247</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
              GOILAI247.COM
            </span>
          </div>
          <p className={`${currentSize.textSub} text-slate-300 font-medium tracking-wide flex items-center gap-1`}>
            <span>Dịch vụ lái xe hộ an toàn 24/7</span>
          </p>
        </div>
      )}
    </div>
  );
};

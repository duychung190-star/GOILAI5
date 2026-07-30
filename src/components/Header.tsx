import React from 'react';
import { Phone, Clock, FileText, History, MessageCircle, FileSpreadsheet } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenPriceTable: () => void;
  onOpenHistory: () => void;
  onOpenDispatcher: () => void;
  onOpenGoogleSheets?: () => void;
  activeBookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPriceTable,
  onOpenHistory,
  onOpenDispatcher,
  onOpenGoogleSheets,
  activeBookingsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Logo
            size="md"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {/* Action Links & Hotline */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Google Sheets Button */}
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/30 shadow-sm"
                title="Đồng bộ đơn xe với Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Google Sheets</span>
              </button>
            )}

            {/* Price Table Button */}
            <button
              onClick={onOpenPriceTable}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Bảng Giá</span>
            </button>

            {/* Booking History Button */}
            <button
              onClick={onOpenHistory}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Lịch Sử</span>
              {activeBookingsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                  {activeBookingsCount}
                </span>
              )}
            </button>

            {/* Dispatcher Modal Toggle */}
            <button
              onClick={onOpenDispatcher}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
              title="Màn hình quản lý đơn hàng của tài xế / điều hành"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Quản Lý Đơn</span>
            </button>

            {/* Zalo Header Button */}
            <a
              href="https://zalo.me/0971999734"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md shadow-blue-600/20 active:scale-95 border border-blue-400/30"
              title="Nhắn tin Zalo với 0971999734"
            >
              <MessageCircle className="w-4 h-4 text-white fill-white/20" />
              <span className="hidden sm:inline">Zalo 24/7</span>
            </a>

            {/* Direct Call Hotline Button */}
            <a
              href="tel:0971999734"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 border border-amber-300/40"
            >
              <Phone className="w-4 h-4 text-slate-950 fill-slate-950 animate-bounce" />
              <span className="font-extrabold tracking-wide">0971.999.734</span>
            </a>

          </div>

        </div>
      </div>
    </header>
  );
};

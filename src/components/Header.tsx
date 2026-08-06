import React from 'react';
import { Phone, Clock, FileText, History, MessageCircle, FileSpreadsheet, UserCheck, Shield, Award } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
import { UserProfile } from '../types';

interface HeaderProps {
  onOpenPriceTable?: () => void;
  onOpenHistory: () => void;
  onOpenDispatcher: () => void;
  onOpenGoogleSheets?: () => void;
  onOpenPhoneAuth?: () => void;
  user?: UserProfile | null;
  activeBookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPriceTable,
  onOpenHistory,
  onOpenDispatcher,
  onOpenGoogleSheets,
  onOpenPhoneAuth,
  user,
  activeBookingsCount
}) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Logo
            size="md"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {/* Action Links, Language Selector & Hotline */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Phone Login / Customer Loyalty Badge */}
            {onOpenPhoneAuth && (
              <button
                onClick={onOpenPhoneAuth}
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-lg transition-all border shadow-sm ${
                  user
                    ? 'bg-amber-500/10 text-amber-900 border-amber-300 hover:bg-amber-500/20'
                    : 'bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800'
                }`}
                title={user ? "Xem thông tin Tài khoản & Điểm thưởng" : "Đăng nhập SĐT nhận Voucher 10%"}
              >
                {user ? (
                  <>
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="hidden sm:inline font-extrabold max-w-[100px] truncate">Tài khoản: {user.name}</span>
                    <span className="sm:hidden font-extrabold">Tài khoản</span>
                    <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 text-[10px] rounded font-black">
                      {user.tier}
                    </span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline">Đăng Nhập / Đăng Ký</span>
                    <span className="sm:hidden">Tài khoản</span>
                    <span className="hidden xl:inline text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold border border-emerald-500/30">
                      Voucher 10%
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {/* Google Sheets Button */}
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-sm"
                title="Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">{t.header.sheets}</span>
              </button>
            )}

            {/* Price Table Button */}
            {onOpenPriceTable && (
              <button
                onClick={onOpenPriceTable}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{t.header.priceTable}</span>
              </button>
            )}

            {/* Booking History Button */}
            <button
              onClick={onOpenHistory}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <History className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">{t.header.history}</span>
              {activeBookingsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                  {activeBookingsCount}
                </span>
              )}
            </button>

            {/* Dispatcher Modal Toggle */}
            <button
              onClick={onOpenDispatcher}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title={t.header.manageOrders}
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{t.header.manageOrders}</span>
            </button>

            {/* Zalo Header Button */}
            <a
              href="https://zalo.me/0971999734"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm active:scale-95 border border-blue-500"
              title="Zalo 0971999734"
            >
              <MessageCircle className="w-4 h-4 text-white fill-white/20" />
              <span className="hidden sm:inline">{t.header.zalo}</span>
            </a>

            {/* Direct Call Hotline Button */}
            <a
              href="tel:0971999734"
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 active:scale-95 border border-amber-300"
              title={t.header.hotlineTooltip}
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


import React from 'react';
import { Phone, Clock, FileText, History, MessageCircle, UserCheck, Shield, Award, LogOut } from 'lucide-react';
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
  onLogout?: () => void;
  user?: UserProfile | null;
  activeBookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPriceTable,
  onOpenHistory,
  onOpenDispatcher,
  onOpenGoogleSheets,
  onOpenPhoneAuth,
  onLogout,
  user,
  activeBookingsCount
}) => {
  const { t } = useLanguage();

  const tripCount = (user as any)?.totalOrdersCount ?? user?.tripsCount ?? 0;

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
            {/* Phone Login / Customer Loyalty Badge hidden per user request */}

            {/* Language Selector Dropdown */}
            <LanguageSelector />

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


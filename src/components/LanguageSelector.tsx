import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, supportedLanguages, currentLangOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-amber-400 bg-slate-800/90 hover:bg-slate-700/90 rounded-lg border border-slate-700/80 shadow-sm transition-all active:scale-95 cursor-pointer"
        title="Chọn ngôn ngữ / Select Language"
      >
        <span className="text-base leading-none">{currentLangOption.flag}</span>
        <span className="font-bold tracking-wide uppercase">{currentLangOption.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Options Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden py-1 animate-fadeIn">
          <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3 text-amber-400" />
            <span>Ngôn ngữ / Language</span>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {supportedLanguages.map((option) => {
              const isSelected = option.code === language;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    setLanguage(option.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-400 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{option.flag}</span>
                    <span>{option.nativeName}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

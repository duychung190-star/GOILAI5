import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-3">
      
      {/* Floating Zalo Button */}
      <a
        href="https://zalo.me/0971999734"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo Hotline 0971999734"
        className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all transform hover:scale-110 active:scale-95 border-2 border-white/20"
        title="Chat Zalo với D.GO: 0971.999.734"
      >
        <MessageCircle className="w-7 h-7 fill-white/20" />
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat Zalo 0971.999.734
        </span>
      </a>

      {/* Floating Call Button */}
      <a
        href="tel:0971999734"
        aria-label="Gọi Hotline 0971999734"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 shadow-2xl shadow-amber-500/40 transition-all transform hover:scale-110 active:scale-95 border-2 border-amber-200"
        title="Gọi ngay Hotline D.GO: 0971.999.734"
      >
        {/* Pulsing ring */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
        <Phone className="w-7 h-7 fill-slate-950 text-slate-950 stroke-[2.5] relative z-10 animate-bounce" />
        <span className="absolute right-full mr-3 bg-slate-900 text-amber-400 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-500/40 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Gọi Lái 24/7: 0971.999.734
        </span>
      </a>

    </div>
  );
};

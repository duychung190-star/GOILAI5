import React, { useState, useEffect, useRef } from 'react';
import { Eye, TrendingUp, Users, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface VisitorData {
  todayCount: number;
  totalCount: number;
  activeOnline: number;
  date: string;
}

export const VisitorCounter: React.FC = () => {
  const [data, setData] = useState<VisitorData>({
    todayCount: 1540,
    totalCount: 148200,
    activeOnline: 28,
    date: new Date().toLocaleDateString('vi-VN'),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch current visitor stats & record visit hit
  const fetchVisitorStats = async () => {
    try {
      setLoading(true);
      // Record visit if not yet recorded in current session
      const hasHit = sessionStorage.getItem('dgo_visit_recorded');
      let endpoint = '/api/visitors';
      let options: RequestInit = { method: 'GET' };

      if (!hasHit) {
        endpoint = '/api/visitors/hit';
        options = { method: 'POST' };
        sessionStorage.setItem('dgo_visit_recorded', 'true');
      }

      const res = await fetch(endpoint, options);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData({
            todayCount: json.todayCount || 1540,
            totalCount: json.totalCount || 148200,
            activeOnline: json.activeOnline || 28,
            date: json.date || new Date().toLocaleDateString('vi-VN'),
          });
        }
      }
    } catch (err) {
      console.warn('Failed to sync visitor count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorStats();
    // Refresh stats every 60 seconds
    const interval = setInterval(fetchVisitorStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  return (
    <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-5 z-40 flex flex-col items-start" ref={cardRef}>
      {/* Detailed Stat Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-slate-900/95 backdrop-blur-xl border border-amber-400/30 text-white rounded-2xl p-4 shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-400/10 rounded-lg text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider">Thống Kê Lượt Truy Cập</h4>
                <p className="text-[10px] text-slate-400">Đánh giá uy tín & Quảng cáo</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Today Count Card */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-200 font-medium block">Lượt truy cập hôm nay</span>
                <span className="text-lg font-black text-amber-400 tracking-tight">{formatNumber(data.todayCount)}</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Làm mới hàng ngày
                </span>
              </div>
            </div>

            {/* Grid 2 details */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Tổng tích lũy</span>
                </div>
                <span className="text-sm font-bold text-white block">{formatNumber(data.totalCount)}</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>Đang online</span>
                </div>
                <span className="text-sm font-bold text-emerald-400 block">{data.activeOnline} tài xế & khách</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Hệ thống xác thực D.GO 247
              </span>
              <button
                onClick={fetchVisitorStats}
                disabled={loading}
                className="hover:text-amber-300 inline-flex items-center gap-1 active:scale-95 transition-transform"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Cập nhật</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom-Left Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800/95 text-white border border-slate-700/80 hover:border-amber-400/80 shadow-2xl shadow-black/80 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Bấm để xem chi tiết lượt truy cập hôm nay"
      >
        {/* Pulsing online indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        <Eye className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />

        <div className="text-left text-xs">
          <span className="hidden sm:inline font-medium text-slate-300">Lượt truy cập hôm nay: </span>
          <span className="font-extrabold text-amber-400 tracking-wide">{formatNumber(data.todayCount)}</span>
        </div>
      </button>
    </div>
  );
};

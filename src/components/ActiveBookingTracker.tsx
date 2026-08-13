import React, { useEffect, useState } from 'react';
import { BookingRequest } from '../types';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Phone, Clock, Car, CheckCircle2, UserCheck, AlertCircle, Navigation, RefreshCw } from 'lucide-react';

interface ActiveBookingTrackerProps {
  booking: BookingRequest | null;
  onStatusChange?: (updatedBooking: BookingRequest) => void;
  onClose?: () => void;
}

export const ActiveBookingTracker: React.FC<ActiveBookingTrackerProps> = ({
  booking,
  onStatusChange,
  onClose,
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>(booking?.status || 'PENDING');
  const [driverName, setDriverName] = useState<string>(booking?.driverAssigned || '');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Request Notification permission when tracking active booking
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const triggerNotification = (newStatus: string, driver?: string) => {
    let title = 'Cập nhật chuyến đi D.GO 247';
    let body = `Cuốc xe ${booking?.id} có cập nhật trạng thái mới.`;

    const upperStatus = (newStatus || '').toUpperCase();

    if (upperStatus === 'ACCEPTED' || upperStatus === 'CONFIRMED') {
      title = '✅ Tài xế đã nhận cuốc!';
      body = `Đơn hàng ${booking?.id} đã được ${driver ? `Tài xế/Admin ${driver}` : 'hệ thống'} nhận phục vụ.`;
    } else if (upperStatus === 'DRIVER_EN_ROUTE' || upperStatus === 'DRIVER_ARRIVED') {
      title = '🚘 Tài xế đang đến/đã đến điểm đón!';
      body = `${driver ? `Tài xế ${driver}` : 'Tài xế'} đang di chuyển hoặc đã đến điểm đón ${booking?.pickupAddress || ''}.`;
    } else if (upperStatus === 'COMPLETED') {
      title = '🏁 Chuyến đi hoàn thành!';
      body = `Chuyến đi ${booking?.id} đã hoàn thành an toàn. Cảm ơn quý khách!`;
    } else if (upperStatus === 'CANCELLED') {
      title = '❌ Cuốc xe bị hủy';
      body = `Cuốc xe ${booking?.id} đã được cập nhật hủy.`;
    }

    setStatusMessage(body);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/manifest.json'
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }
  };

  useEffect(() => {
    if (!booking || !booking.id) return;

    setCurrentStatus(booking.status || 'PENDING');
    setDriverName(booking.driverAssigned || '');

    // 1. Setup Firestore real-time listener on document `bookings/{bookingId}` and `rides/{bookingId}`
    let unsubscribeFirestoreBooking: (() => void) | null = null;
    let unsubscribeFirestoreRide: (() => void) | null = null;

    const handleDocSnap = (snap: any) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.status) {
          if (data.status !== currentStatus) {
            triggerNotification(data.status, data.driverAssigned);
          }
          setCurrentStatus(data.status);
          if (data.driverAssigned) setDriverName(data.driverAssigned);
          setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          
          if (onStatusChange) {
            onStatusChange({
              ...booking,
              status: data.status,
              driverAssigned: data.driverAssigned || booking.driverAssigned
            });
          }
        }
      }
    };

    try {
      const handleListenerError = (err: any) => {
        console.log('[Firestore] Realtime stream notice (using API polling fallback):', err?.message || err);
        if (unsubscribeFirestoreBooking) {
          try { unsubscribeFirestoreBooking(); } catch (_) {}
          unsubscribeFirestoreBooking = null;
        }
        if (unsubscribeFirestoreRide) {
          try { unsubscribeFirestoreRide(); } catch (_) {}
          unsubscribeFirestoreRide = null;
        }
      };

      const bookingRef = doc(db, 'bookings', booking.id);
      unsubscribeFirestoreBooking = onSnapshot(bookingRef, handleDocSnap, handleListenerError);

      const rideRef = doc(db, 'rides', booking.id);
      unsubscribeFirestoreRide = onSnapshot(rideRef, handleDocSnap, handleListenerError);
    } catch (e) {
      console.log('[Firestore] Could not attach snapshot listener:', e);
    }

    // 2. Setup Polling Interval fallback every 3 seconds to ensure web & mobile app syncs seamlessly
    const intervalId = setInterval(async () => {
      try {
        setIsSyncing(true);
        const res = await fetch(`/api/booking/${booking.id}/status`);
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && data.success && data.status) {
              if (data.status !== currentStatus) {
                triggerNotification(data.status, data.driverAssigned);
              }
              setCurrentStatus(data.status);
              if (data.driverAssigned) setDriverName(data.driverAssigned);
              setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

              if (onStatusChange && data.status !== booking.status) {
                onStatusChange({
                  ...booking,
                  status: data.status,
                  driverAssigned: data.driverAssigned || booking.driverAssigned
                });
              }
            }
          }
        }
      } catch (err) {
        // Silent catch for polling
      } finally {
        setIsSyncing(false);
      }
    }, 3000);

    return () => {
      if (unsubscribeFirestoreBooking) unsubscribeFirestoreBooking();
      if (unsubscribeFirestoreRide) unsubscribeFirestoreRide();
      clearInterval(intervalId);
    };
  }, [booking?.id, currentStatus]);

  if (!booking) return null;

  // Visual status configurations
  const statusConfig = {
    PENDING: {
      title: 'Đang Chờ Điều Phối...',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      stepIndex: 1,
      icon: Clock,
      description: 'Hệ thống đã nhận cuốc & đã phát tín hiệu cho Admin/Tài xế Telegram. Vui lòng giữ máy!',
      colorTheme: 'amber'
    },
    ACCEPTED: {
      title: '✅ Đã Có Tài Xế Nhận Cuốc',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      stepIndex: 2,
      icon: CheckCircle2,
      description: `Đơn hàng đã được ${driverName ? `Tài xế/Admin (${driverName})` : 'hệ thống'} xác nhận phục vụ.`,
      colorTheme: 'emerald'
    },
    CONFIRMED: {
      title: '✅ Đã Xác Nhận Cuốc Xe',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      stepIndex: 2,
      icon: CheckCircle2,
      description: `Đơn hàng đã được ${driverName ? `Tài xế/Admin (${driverName})` : 'hệ thống'} xác nhận phục vụ.`,
      colorTheme: 'emerald'
    },
    DRIVER_EN_ROUTE: {
      title: '🚘 Tài Xế Đang Đón Khách',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      stepIndex: 3,
      icon: Car,
      description: `Tài xế đang di chuyển đến điểm đón của bạn (${booking.pickupAddress}). Vui lòng chuẩn bị xe & chìa khóa!`,
      colorTheme: 'sky'
    },
    DRIVER_ARRIVED: {
      title: '🚘 Tài Xế Đã Đến Điểm Đón',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      stepIndex: 3,
      icon: Car,
      description: `Tài xế đã di chuyển đến điểm đón (${booking.pickupAddress}). Vui lòng ra xe!`,
      colorTheme: 'sky'
    },
    IN_PROGRESS: {
      title: '🛣️ Đang Trong Hành Trình',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      stepIndex: 3,
      icon: Navigation,
      description: 'Tài xế đang lái xe hộ bạn di chuyển an toàn tới điểm đến.',
      colorTheme: 'indigo'
    },
    COMPLETED: {
      title: '🏁 Hoàn Thành Chuyến Đi',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      stepIndex: 4,
      icon: CheckCircle2,
      description: 'Chuyến đi đã hoàn thành an toàn. Cảm ơn quý khách đã tin tưởng D.GO 247!',
      colorTheme: 'purple'
    },
    CANCELLED: {
      title: '❌ Cuốc Xe Đã Hủy',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      stepIndex: 0,
      icon: AlertCircle,
      description: 'Cuốc xe này đã bị hủy bởi hệ thống hoặc theo yêu cầu.',
      colorTheme: 'rose'
    }
  };

  const statusKey = (currentStatus || 'PENDING').toUpperCase();
  const currentConfig = statusConfig[statusKey as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = currentConfig.icon;

  return (
    <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 animate-fadeIn">
      {/* Toast Notification Banner */}
      {statusMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-bounce">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button 
            onClick={() => setStatusMessage('')}
            className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 hover:text-white"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${currentConfig.badgeBg} shadow-inner`}>
            <StatusIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Trạng Thái Trực Tuyến</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Auto-Sync</span>
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">{currentConfig.title}</h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            Ẩn
          </button>
        )}
      </div>

      {/* Driver & System Status Box */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {currentConfig.description}
        </p>

        {driverName && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-amber-300 font-bold">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Phụ trách bởi Admin / Tài xế: <strong className="text-white underline">{driverName}</strong></span>
          </div>
        )}

        {lastUpdated && (
          <p className="text-[10px] text-slate-500 font-mono text-right">Cập nhật lúc: {lastUpdated}</p>
        )}
      </div>

      {/* Progress Timeline Tracker Steps */}
      {currentStatus !== 'CANCELLED' && (
        <div className="py-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <div className={`flex flex-col items-center gap-1 ${currentConfig.stepIndex >= 1 ? 'text-amber-400' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${currentConfig.stepIndex >= 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                1
              </div>
              <span>Đặt cuốc</span>
            </div>

            <div className={`h-1 flex-1 mx-2 rounded ${currentConfig.stepIndex >= 2 ? 'bg-amber-400' : 'bg-slate-800'}`} />

            <div className={`flex flex-col items-center gap-1 ${currentConfig.stepIndex >= 2 ? 'text-emerald-400' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${currentConfig.stepIndex >= 2 ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                2
              </div>
              <span>Đã nhận cuốc</span>
            </div>

            <div className={`h-1 flex-1 mx-2 rounded ${currentConfig.stepIndex >= 3 ? 'bg-sky-400' : 'bg-slate-800'}`} />

            <div className={`flex flex-col items-center gap-1 ${currentConfig.stepIndex >= 3 ? 'text-sky-400' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${currentConfig.stepIndex >= 3 ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                3
              </div>
              <span>Đang đến đón</span>
            </div>

            <div className={`h-1 flex-1 mx-2 rounded ${currentConfig.stepIndex >= 4 ? 'bg-purple-400' : 'bg-slate-800'}`} />

            <div className={`flex flex-col items-center gap-1 ${currentConfig.stepIndex >= 4 ? 'text-purple-400' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${currentConfig.stepIndex >= 4 ? 'bg-purple-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                4
              </div>
              <span>Hoàn thành</span>
            </div>
          </div>
        </div>
      )}

      {/* Direct Hotline Contact Bar */}
      <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-slate-300 font-semibold">Cần trợ giúp gấp hoặc thay đổi địa điểm?</span>
        </div>
        <a
          href="tel:0971999734"
          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition-colors shrink-0 shadow"
        >
          Gọi 0971.999.734
        </a>
      </div>
    </div>
  );
};

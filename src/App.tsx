/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BookingForm } from './components/BookingForm';
import { CostSummaryCard } from './components/CostSummaryCard';
import { InteractiveMap } from './components/InteractiveMap';
import { BookingModal } from './components/BookingModal';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FloatingActions } from './components/FloatingActions';
import { VisitorCounter } from './components/VisitorCounter';
import { BookingHistoryModal } from './components/BookingHistoryModal';
import { DispatcherDrawer } from './components/DispatcherDrawer';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { DriverRatingModal } from './components/DriverRatingModal';

import { PhoneAuthModal } from './components/PhoneAuthModal';
import { CustomerFeedbackSection } from './components/CustomerFeedbackSection';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { UnauthenticatedBookingPromptModal } from './components/UnauthenticatedBookingPromptModal';
import { ActiveBookingTracker } from './components/ActiveBookingTracker';
import { SuccessModal } from './components/SuccessModal';

import { LocationPoint, VehicleTypeOption, VatDetails, BookingRequest, DriverRating, UserProfile } from './types';
import { syncUserFromFirestore } from './services/userService';
import { ensureFirebaseAuth } from './lib/firebase';
import { PriceCalculator } from './utils/PriceCalculator';
import { getDirectionsGoong, reverseGeocodeGoong } from './utils/goong';
import { sendTelegramNotification } from './utils/telegram';
import { getAccessToken } from './utils/googleAuth';
import { appendBookingToSheet, SPREADSHEET_KEY } from './utils/googleSheets';
import { AlertTriangle, MapPin, Navigation, Info, PhoneCall } from 'lucide-react';
import dgoLogoImg from './assets/images/dgo_app_logo_1785380889422.jpg';

export default function App() {
  // Customer details
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('dgo_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('dgo_customer_phone') || '');

  // Default Hanoi initial points for interactive map demo
  const [pickup, setPickup] = useState<LocationPoint | null>({
    address: '100 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    lat: 20.9947,
    lng: 105.8118
  });

  const [destination, setDestination] = useState<LocationPoint | null>({
    address: 'Sân bay Quốc tế Nội Bài, Hà Nội',
    lat: 21.2187,
    lng: 105.8042
  });

  const [vehicleType, setVehicleType] = useState<VehicleTypeOption>('Ô tô / Xe máy');
  const [hourlyHours, setHourlyHours] = useState(3);
  const [dailyDays, setDailyDays] = useState(1);
  const [promoCode, setPromoCode] = useState('GOILAI10');
  const [noteForDriver, setNoteForDriver] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  
  // Map target click mode ('pickup' or 'destination')
  const [mapClickTarget, setMapClickTarget] = useState<'pickup' | 'destination'>('pickup');

  // VAT details
  const [needVat, setNeedVat] = useState(false);
  const [vatDetails, setVatDetails] = useState<VatDetails>({
    companyName: '',
    taxCode: '',
    companyAddress: '',
    email: ''
  });

  // Modals & Drawers State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<BookingRequest | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<any>(null);

  // User Auth & Loyalty State
  const [isPhoneAuthOpen, setIsPhoneAuthOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('dgo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auto-restore persistent login session from server on load & initialize Firebase Auth
  useEffect(() => {
    ensureFirebaseAuth().catch(err => console.warn('Firebase Auth setup:', err));

    const token = localStorage.getItem('dgo_token');
    const savedUserStr = localStorage.getItem('dgo_user');
    
    let savedPhone = '';
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        savedPhone = parsed.phone || '';
      } catch {}
    }

    if (token || savedPhone) {
      fetch(`/api/auth/me?phone=${encodeURIComponent(savedPhone)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('dgo_user', JSON.stringify(data.user));
            if (data.user.name) {
              setCustomerName(data.user.name);
              localStorage.setItem('dgo_customer_name', data.user.name);
            }
            if (data.user.phone) {
              setCustomerPhone(data.user.phone);
              localStorage.setItem('dgo_customer_phone', data.user.phone);
            }
          }
        })
        .catch(err => console.warn('Auto login session sync:', err));
    }
  }, []);

  // Sync customer name and phone when user changes
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  const handleLoginSuccess = async (newUser: UserProfile) => {
    // Immediate local state update
    setUser(newUser);
    localStorage.setItem('dgo_user', JSON.stringify(newUser));
    if (newUser.name) {
      setCustomerName(newUser.name);
      localStorage.setItem('dgo_customer_name', newUser.name);
    }
    if (newUser.phone) {
      setCustomerPhone(newUser.phone);
      localStorage.setItem('dgo_customer_phone', newUser.phone);
    }

    // Sync full profile and order history from Firestore
    try {
      const { user: syncedUser } = await syncUserFromFirestore(newUser);
      setUser(syncedUser);
      localStorage.setItem('dgo_user', JSON.stringify(syncedUser));
      if (syncedUser.name) {
        setCustomerName(syncedUser.name);
        localStorage.setItem('dgo_customer_name', syncedUser.name);
      }
      if (syncedUser.phone) {
        setCustomerPhone(syncedUser.phone);
        localStorage.setItem('dgo_customer_phone', syncedUser.phone);
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ hồ sơ từ Firestore:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dgo_user');
    localStorage.removeItem('dgo_token');
    localStorage.removeItem('dgo_customer_name');
    localStorage.removeItem('dgo_customer_phone');
    setIsPhoneAuthOpen(false);
  };

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isUnauthPromptOpen, setIsUnauthPromptOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDispatcherOpen, setIsDispatcherOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [mapTargetMode, setMapTargetMode] = useState<'pickup' | 'destination'>('destination');

  // Driver Rating State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingBooking, setRatingBooking] = useState<BookingRequest | null>(null);

  const handleOpenRating = (booking?: BookingRequest | null) => {
    const targetBooking = booking || (bookingHistory.length > 0 ? bookingHistory[0] : {
      id: `DGO-${Date.now().toString().slice(-6)}`,
      customerName: customerName || 'Khách hàng D.GO',
      customerPhone: customerPhone || '0971999734',
      pickupAddress: pickup?.address || 'Điểm đón của bạn',
      pickupLat: pickup?.lat || 21.0,
      pickupLng: pickup?.lng || 105.8,
      destinationAddress: destination?.address || 'Điểm đến của bạn',
      destinationLat: destination?.lat || 21.1,
      destinationLng: destination?.lng || 105.9,
      distanceKm: 8,
      totalPrice: 350000,
      vehicleType: 'Ô tô 4-7 chỗ',
      noteForDriver: '',
      scheduledTime: Date.now(),
      status: 'COMPLETED' as const,
      createdAt: Date.now(),
      needVat: false,
      breakdown: priceBreakdown
    });
    setRatingBooking(targetBooking);
    setIsRatingModalOpen(true);
  };

  const handleSubmitRating = async (bookingId: string, rating: DriverRating) => {
    try {
      await fetch(`/api/booking/${bookingId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating),
      });
    } catch (err) {
      console.error('Rating API error:', err);
    }

    // Update local history
    setBookingHistory((prev) =>
      prev.map((item) => (item.id === bookingId ? { ...item, rating } : item))
    );

    if (submittedBooking && submittedBooking.id === bookingId) {
      setSubmittedBooking((prev) => (prev ? { ...prev, rating } : null));
    }
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  // User booking history stored locally
  const [bookingHistory, setBookingHistory] = useState<BookingRequest[]>(() => {
    try {
      const saved = localStorage.getItem('dgo_booking_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save customer info to local storage
  useEffect(() => {
    if (customerName) localStorage.setItem('dgo_customer_name', customerName);
  }, [customerName]);

  useEffect(() => {
    if (customerPhone) localStorage.setItem('dgo_customer_phone', customerPhone);
  }, [customerPhone]);

  useEffect(() => {
    localStorage.setItem('dgo_booking_history', JSON.stringify(bookingHistory));
  }, [bookingHistory]);

  // Road distance & duration state (from Google Maps Directions API / OSRM)
  const [roadDistanceKm, setRoadDistanceKm] = useState<number | null>(null);
  const [roadDurationMinutes, setRoadDurationMinutes] = useState<number | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Fetch precise driving route distance and duration using Goong API when pickup or destination changes
  useEffect(() => {
    if ((pickup?.lat && pickup?.lng && destination?.lat && destination?.lng) || (pickup?.address && destination?.address)) {
      setIsCalculatingRoute(true);

      const origin = (pickup?.lat && pickup?.lng) ? { lat: pickup.lat, lng: pickup.lng } : (pickup?.address || '');
      const dest = (destination?.lat && destination?.lng) ? { lat: destination.lat, lng: destination.lng } : (destination?.address || '');

      getDirectionsGoong(origin, dest)
        .then(route => {
          if (route && typeof route.distanceKm === 'number' && route.distanceKm > 0) {
            setRoadDistanceKm(route.distanceKm);
            setRoadDurationMinutes(route.durationMinutes);
            if (Array.isArray(route.decodedPath) && route.decodedPath.length > 0) {
              setRouteGeometry(route.decodedPath);
            } else {
              setRouteGeometry(null);
            }
          } else {
            // Fallback to backend route proxy
            const params = new URLSearchParams();
            if (pickup?.lat && pickup?.lng) {
              params.append('startLat', pickup.lat.toString());
              params.append('startLng', pickup.lng.toString());
            }
            if (destination?.lat && destination?.lng) {
              params.append('endLat', destination.lat.toString());
              params.append('endLng', destination.lng.toString());
            }
            if (pickup?.address) params.append('origin', pickup.address);
            if (destination?.address) params.append('destination', destination.address);

            return fetch(`/api/route?${params.toString()}`)
              .then(res => res.json())
              .then(data => {
                if (data && typeof data.distanceKm === 'number' && data.distanceKm > 0) {
                  setRoadDistanceKm(data.distanceKm);
                  if (typeof data.durationMinutes === 'number') {
                    setRoadDurationMinutes(data.durationMinutes);
                  }
                  if (Array.isArray(data.routeGeometry) && data.routeGeometry.length > 0) {
                    setRouteGeometry(data.routeGeometry);
                  } else {
                    setRouteGeometry(null);
                  }
                } else {
                  setRoadDistanceKm(null);
                  setRoadDurationMinutes(null);
                  setRouteGeometry(null);
                }
              });
          }
        })
        .catch(() => {
          setRoadDistanceKm(null);
          setRoadDurationMinutes(null);
          setRouteGeometry(null);
        })
        .finally(() => setIsCalculatingRoute(false));
    } else {
      setRoadDistanceKm(null);
      setRoadDurationMinutes(null);
      setRouteGeometry(null);
    }
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, pickup?.address, destination?.address]);

  // Calculate Distance & Price dynamically (Strictly driving distance from actual roads)
  const calculatedDistanceKm = useMemo(() => {
    if (roadDistanceKm !== null && roadDistanceKm > 0) return roadDistanceKm;
    return 0;
  }, [roadDistanceKm]);

  const priceBreakdown = useMemo(() => {
    return PriceCalculator.calculatePrice(
      calculatedDistanceKm,
      vehicleType,
      vehicleType.includes('Thuê theo giờ'),
      hourlyHours,
      dailyDays,
      scheduledTime,
      needVat,
      roadDurationMinutes,
      promoCode
    );
  }, [calculatedDistanceKm, vehicleType, hourlyHours, dailyDays, scheduledTime, needVat, roadDurationMinutes, promoCode]);

  // Handle Map Location Selection via map click using Goong Reverse Geocoding
  const handleSelectMapLocation = async (lat: number, lng: number, target: 'pickup' | 'destination') => {
    try {
      const address = await reverseGeocodeGoong(lat, lng);
      if (target === 'pickup') {
        setPickup({ address, lat, lng });
      } else {
        setDestination({ address, lat, lng });
      }
    } catch {
      const fallback = target === 'pickup' ? 'Vị trí điểm đón trên bản đồ' : 'Vị trí điểm đến trên bản đồ';
      if (target === 'pickup') {
        setPickup({ address: fallback, lat, lng });
      } else {
        setDestination({ address: fallback, lat, lng });
      }
    }
  };

  // Submit & Confirm Booking Request
  const handleConfirmBooking = async () => {
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError('Vui lòng nhập Họ và tên khách hàng.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 9) {
      setValidationError('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9-10 chữ số).');
      return;
    }

    if (!pickup?.address) {
      setValidationError('Vui lòng chọn hoặc nhập điểm đón khách.');
      return;
    }

    if (!destination?.address) {
      setValidationError('Vui lòng chọn hoặc nhập điểm đến.');
      return;
    }

    if (needVat) {
      if (!vatDetails.companyName.trim() || !vatDetails.taxCode.trim()) {
        setValidationError('Vui lòng nhập Tên công ty và Mã số thuế nếu muốn xuất hóa đơn VAT.');
        return;
      }
    }

    await executeBookingSubmission();
  };

  const executeBookingSubmission = async () => {
    setIsSubmitting(true);

    const newBooking: BookingRequest = {
      id: `DGO-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      pickupAddress: pickup!.address,
      pickupLat: pickup!.lat,
      pickupLng: pickup!.lng,
      destinationAddress: destination!.address,
      destinationLat: destination!.lat,
      destinationLng: destination!.lng,
      distanceKm: calculatedDistanceKm,
      totalPrice: priceBreakdown.totalPrice,
      vehicleType,
      noteForDriver,
      scheduledTime: scheduledTime.getTime(),
      status: 'PENDING',
      createdAt: Date.now(),
      needVat,
      vatDetails: needVat ? vatDetails : undefined,
      breakdown: priceBreakdown
    };

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });

      const resData = await response.json();
      
      setSubmittedBooking(newBooking);
      setTelegramStatus(resData.telegram);

      // Save to local history
      setBookingHistory(prev => [newBooking, ...prev]);

      // Save top 5 recent booking locations to LocalStorage
      try {
        const savedRecentRaw = localStorage.getItem('dgo_recent_locations');
        const currentRecent: Array<any> = savedRecentRaw ? JSON.parse(savedRecentRaw) : [];
        const newItems = [
          { id: 'rec-' + Date.now(), address: newBooking.pickupAddress, lat: newBooking.pickupLat, lng: newBooking.pickupLng, timeLabel: 'Vừa đặt chuyến' },
          { id: 'rec-' + (Date.now() + 1), address: newBooking.destinationAddress, lat: newBooking.destinationLat, lng: newBooking.destinationLng, timeLabel: 'Vừa đặt chuyến' }
        ];
        const combined = [...newItems, ...currentRecent];
        const uniqueMap = new Map<string, any>();
        combined.forEach(item => {
          if (item && item.address && typeof item.address === 'string' && item.address.trim().length > 2) {
            const key = item.address.toLowerCase().trim();
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          }
        });
        const top5Recent = Array.from(uniqueMap.values()).slice(0, 5);
        localStorage.setItem('dgo_recent_locations', JSON.stringify(top5Recent));
      } catch (errRecent) {
        console.error("Failed saving recent locations to localStorage:", errRecent);
      }

      // Auto-sync to Google Sheets if connected
      if (isAutoSyncEnabled) {
        const token = getAccessToken();
        const sheetId = localStorage.getItem(SPREADSHEET_KEY);
        if (token && sheetId) {
          appendBookingToSheet(token, sheetId, newBooking).catch(err => {
            console.warn("Auto sync to Google Sheets warning:", err);
          });
        }
      }

      setIsSubmitting(false);
      setIsBookingModalOpen(true);
    } catch (error) {
      console.error("Booking error:", error);
      // Client-side fallback telegram notification call
      const clientTgResult = await sendTelegramNotification({
        name: newBooking.customerName,
        phone: newBooking.customerPhone,
        pickup: newBooking.pickupAddress,
        dropoff: newBooking.destinationAddress,
        originalPrice: newBooking.breakdown.originalPrice,
        discountAmount: newBooking.breakdown.discountAmount,
        discountPercent: newBooking.breakdown.discountPercent,
        promoCode: newBooking.breakdown.promoCode,
        discountCodeName: newBooking.breakdown.discountCodeName,
        totalPrice: newBooking.totalPrice,
        vehicleType: newBooking.vehicleType,
        distanceKm: newBooking.distanceKm,
        noteForDriver: newBooking.noteForDriver
      });
      setTelegramStatus(clientTgResult);
      setSubmittedBooking(newBooking);
      setBookingHistory(prev => [newBooking, ...prev]);
      setIsSubmitting(false);
      setIsBookingModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDispatcher={() => setIsDispatcherOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
        onLogout={handleLogout}
        user={user}
        activeBookingsCount={bookingHistory.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length}
      />

      {/* Main Form & Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Live Active Booking Status Tracker (if user has active booking) */}
        {submittedBooking && (
          <ActiveBookingTracker
            booking={submittedBooking}
            onStatusChange={(updated) => {
              setSubmittedBooking(updated);
              setBookingHistory(prev => prev.map(b => b.id === updated.id ? updated : b));
            }}
            onClose={() => setSubmittedBooking(null)}
          />
        )}

        {/* Hero Banner Showcase (Logo & Service Introduction placed at top) */}
        <div className="rounded-2xl overflow-hidden border border-amber-200/60 shadow-sm">
          <HeroBanner />
        </div>

        {/* Error Notification Alert (if any) */}
        {validationError && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-slate-500 hover:text-slate-800 text-xs font-bold"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout: Form Left, Map & Summary Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Booking Input Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <BookingForm
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              pickup={pickup}
              setPickup={setPickup}
              destination={destination}
              setDestination={setDestination}
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              hourlyHours={hourlyHours}
              setHourlyHours={setHourlyHours}
              dailyDays={dailyDays}
              setDailyDays={setDailyDays}
              noteForDriver={noteForDriver}
              setNoteForDriver={setNoteForDriver}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              needVat={needVat}
              setNeedVat={setNeedVat}
              vatDetails={vatDetails}
              setVatDetails={setVatDetails}
              priceBreakdown={priceBreakdown}
              isCalculatingRoute={isCalculatingRoute}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              onFormValidationFail={(msg) => setValidationError(msg)}
              onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
            />
          </div>

          {/* Right Column: Interactive Map & Cost Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Interactive Map & Route Vector Display */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Bản Đồ Lộ Trình Di Chuyển
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Vẽ đường vector lộ trình di chuyển khi chọn điểm
                    </p>
                  </div>
                </div>

                {/* Target Selection Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMapTargetMode('pickup')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      mapTargetMode === 'pickup'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đón
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapTargetMode('destination')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      mapTargetMode === 'destination'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đến
                  </button>
                </div>
              </div>

              {/* Map Canvas */}
              <div className="h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <InteractiveMap
                  pickup={pickup}
                  destination={destination}
                  routeGeometry={routeGeometry}
                  isCalculatingRoute={isCalculatingRoute}
                  onSelectMapLocation={handleSelectMapLocation}
                  targetMode={mapTargetMode}
                />
              </div>

              {/* Distance and Route Indicator Footer */}
              {roadDistanceKm !== null && roadDistanceKm > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs animate-fadeIn">
                  <span className="text-slate-600 font-medium">Khoảng cách lộ trình:</span>
                  <span className="font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 shadow-xs">
                    {roadDistanceKm} km {roadDurationMinutes ? `(~${roadDurationMinutes} phút)` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Real-time Cost Breakdown & Action Card */}
            <CostSummaryCard
              breakdown={priceBreakdown}
              vehicleType={vehicleType}
              needVat={needVat}
              isSubmitting={isSubmitting}
              isCalculatingRoute={isCalculatingRoute}
              onConfirmBooking={handleConfirmBooking}
              onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            />

          </div>

        </div>

        {/* Advantage Highlights Section */}
        <WhyChooseUs />

        {/* Customer Reviews & Driver Ratings Showcase */}
        <CustomerFeedbackSection
          onOpenRatingModal={() => handleOpenRating()}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-center text-xs text-slate-600 space-y-4">
        <div className="flex justify-center items-center gap-3">
          <img
            src={dgoLogoImg}
            alt="D.GO Logo"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full border-2 border-amber-400 shadow-sm"
          />
          <div className="text-left">
            <h4 className="font-black text-slate-900 text-base tracking-tight">D.GO - DỊCH VỤ LÁI XE HỘ</h4>
            <p className="text-amber-700 text-xs font-bold">GOILAI247.COM • HOTLINE: 0971.999.734</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5 flex items-center gap-1">
              <span>Địa chỉ: 139 Nguyễn Văn Cừ, Long Biên, Hà Nội</span>
            </p>
          </div>
        </div>

        <p className="max-w-xl mx-auto text-slate-600 font-medium">
          Dịch vụ lái xe hộ an toàn - Uy tín - Phục vụ 24/7 trên toàn quốc
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} D.GO 247. Bảo lưu mọi bản quyền.</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer transition-colors"
          >
            Chính sách bảo mật
          </button>
        </div>
      </footer>

      {/* Floating Call & Zalo Action Buttons & Visitor Counter */}
      <FloatingActions />
      <VisitorCounter />

      {/* Modals & Drawers */}
      <BookingModal
        booking={submittedBooking}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        telegramStatus={telegramStatus}
        onRateDriver={handleOpenRating}
        onBookingUpdated={(updated) => {
          setSubmittedBooking(updated);
          setBookingHistory(prev => prev.map(b => b.id === updated.id ? updated : b));
        }}
      />

      <BookingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        bookings={bookingHistory}
        onClearHistory={() => setBookingHistory([])}
        onRateDriver={handleOpenRating}
      />

      <DriverRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        booking={ratingBooking}
        onSubmitRating={handleSubmitRating}
      />

      <PhoneAuthModal
        isOpen={isPhoneAuthOpen}
        onClose={() => setIsPhoneAuthOpen(false)}
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      <DispatcherDrawer
        isOpen={isDispatcherOpen}
        onClose={() => setIsDispatcherOpen(false)}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        bookings={bookingHistory}
        isAutoSyncEnabled={isAutoSyncEnabled}
        onAutoSyncChange={setIsAutoSyncEnabled}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Driver Accepted Success Confirmation Modal */}
      <SuccessModal />

    </div>
  );
}

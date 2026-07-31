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
import { PriceTableModal } from './components/PriceTableModal';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FloatingActions } from './components/FloatingActions';
import { BookingHistoryModal } from './components/BookingHistoryModal';
import { DispatcherDrawer } from './components/DispatcherDrawer';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';

import { LocationPoint, VehicleTypeOption, VatDetails, BookingRequest } from './types';
import { PriceCalculator } from './utils/PriceCalculator';
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

  const [vehicleType, setVehicleType] = useState<VehicleTypeOption>('Ô tô 4-7 chỗ');
  const [hourlyHours, setHourlyHours] = useState(3);
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

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPriceTableOpen, setIsPriceTableOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDispatcherOpen, setIsDispatcherOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);

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

  // Fetch precise driving route distance and duration from backend API when pickup or destination changes
  useEffect(() => {
    if ((pickup?.lat && pickup?.lng && destination?.lat && destination?.lng) || (pickup?.address && destination?.address)) {
      setIsCalculatingRoute(true);
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

      fetch(`/api/route?${params.toString()}`)
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
          } else if (data && data.routes && data.routes[0]) {
            const meters = data.routes[0].distance || (data.routes[0].legs && data.routes[0].legs[0]?.distance?.value);
            const km = Math.round((meters / 1000) * 10) / 10;
            setRoadDistanceKm(km);
            const secs = data.routes[0].duration || (data.routes[0].legs && data.routes[0].legs[0]?.duration?.value);
            if (secs) {
              setRoadDurationMinutes(Math.round(secs / 60));
            }
            setRouteGeometry(null);
          } else {
            setRoadDistanceKm(null);
            setRoadDurationMinutes(null);
            setRouteGeometry(null);
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

  // Calculate Distance & Price dynamically
  const calculatedDistanceKm = useMemo(() => {
    if (roadDistanceKm !== null && roadDistanceKm > 0) return roadDistanceKm;
    if (pickup?.lat && pickup?.lng && destination?.lat && destination?.lng) {
      return PriceCalculator.calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);
    }
    return 0;
  }, [pickup, destination, roadDistanceKm]);

  const priceBreakdown = useMemo(() => {
    return PriceCalculator.calculatePrice(
      calculatedDistanceKm,
      vehicleType,
      vehicleType === 'Thuê theo giờ',
      hourlyHours,
      scheduledTime,
      needVat,
      roadDurationMinutes
    );
  }, [calculatedDistanceKm, vehicleType, hourlyHours, scheduledTime, needVat, roadDurationMinutes]);

  // Handle Map Location Selection via map click
  const handleSelectMapLocation = async (lat: number, lng: number, target: 'pickup' | 'destination') => {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      const address = data.display_name || (target === 'pickup' ? 'Vị trí điểm đón đã chọn' : 'Vị trí điểm đến đã chọn');

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

    setIsSubmitting(true);

    const newBooking: BookingRequest = {
      id: `DGO-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      pickupAddress: pickup.address,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      destinationAddress: destination.address,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        onOpenPriceTable={() => setIsPriceTableOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDispatcher={() => setIsDispatcherOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        activeBookingsCount={bookingHistory.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length}
      />

      {/* Hero Banner Showcase */}
      <HeroBanner onOpenPriceTable={() => setIsPriceTableOpen(true)} />

      {/* Main Form & Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Notification Alert (if any) */}
        {validationError && (
          <div className="bg-rose-500/10 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
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
              onFormValidationFail={(msg) => setValidationError(msg)}
            />
          </div>

          {/* Right Column: Map & Price Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Map Click Selector Target Switcher */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Chế độ bấm bản đồ:</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMapClickTarget('pickup')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    mapClickTarget === 'pickup'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chọn Đón
                </button>
                <button
                  type="button"
                  onClick={() => setMapClickTarget('destination')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    mapClickTarget === 'destination'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chọn Đến
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Route Map */}
            <div className="h-[320px] w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
              <InteractiveMap
                pickup={pickup}
                destination={destination}
                routeGeometry={routeGeometry}
                isCalculatingRoute={isCalculatingRoute}
                onSelectMapLocation={handleSelectMapLocation}
                targetMode={mapClickTarget}
              />
            </div>

            {/* Real-time Cost Breakdown & Action Card */}
            <CostSummaryCard
              breakdown={priceBreakdown}
              vehicleType={vehicleType}
              needVat={needVat}
              isSubmitting={isSubmitting}
              onConfirmBooking={handleConfirmBooking}
            />

          </div>

        </div>

        {/* Advantage Highlights Section */}
        <WhyChooseUs />

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-center text-xs text-slate-500 space-y-4">
        <div className="flex justify-center items-center gap-3">
          <img
            src={dgoLogoImg}
            alt="D.GO Logo"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full border-2 border-slate-800 shadow-md"
          />
          <div className="text-left">
            <h4 className="font-black text-white text-base tracking-tight">D.GO - DỊCH VỤ LÁI XE HỘ</h4>
            <p className="text-amber-400 text-xs font-bold">GOILAI247.COM • HOTLINE: 0971.999.734</p>
          </div>
        </div>

        <p className="max-w-xl mx-auto text-slate-400 font-medium">
          Dịch vụ lái xe hộ an toàn - Uy tín - Phục vụ 24/7 trên toàn quốc
        </p>

        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} D.GO 247. Bảo lưu mọi bản quyền.
        </p>
      </footer>

      {/* Floating Call & Zalo Action Buttons */}
      <FloatingActions />

      {/* Modals & Drawers */}
      <BookingModal
        booking={submittedBooking}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        telegramStatus={telegramStatus}
      />

      <PriceTableModal
        isOpen={isPriceTableOpen}
        onClose={() => setIsPriceTableOpen(false)}
      />

      <BookingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        bookings={bookingHistory}
        onClearHistory={() => setBookingHistory([])}
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

    </div>
  );
}

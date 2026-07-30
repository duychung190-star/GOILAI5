import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint, VehicleTypeOption, VatDetails, SearchSuggestion, PriceBreakdown } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { MapPin, Navigation, Car, Bike, ShieldCheck, Clock, FileText, User, Phone, Edit3, Sparkles, Check, AlertCircle, Calculator, Route } from 'lucide-react';

interface BookingFormProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  pickup: LocationPoint | null;
  setPickup: (loc: LocationPoint | null) => void;
  destination: LocationPoint | null;
  setDestination: (loc: LocationPoint | null) => void;
  vehicleType: VehicleTypeOption;
  setVehicleType: (type: VehicleTypeOption) => void;
  hourlyHours: number;
  setHourlyHours: (h: number) => void;
  noteForDriver: string;
  setNoteForDriver: (note: string) => void;
  scheduledTime: Date;
  setScheduledTime: (d: Date) => void;
  needVat: boolean;
  setNeedVat: (vat: boolean) => void;
  vatDetails: VatDetails;
  setVatDetails: React.Dispatch<React.SetStateAction<VatDetails>>;
  priceBreakdown?: PriceBreakdown;
  isCalculatingRoute?: boolean;
  onFormValidationFail: (msg: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  pickup,
  setPickup,
  destination,
  setDestination,
  vehicleType,
  setVehicleType,
  hourlyHours,
  setHourlyHours,
  noteForDriver,
  setNoteForDriver,
  scheduledTime,
  setScheduledTime,
  needVat,
  setNeedVat,
  vatDetails,
  setVatDetails,
  priceBreakdown,
  isCalculatingRoute,
  onFormValidationFail
}) => {
  const [pickupInput, setPickupInput] = useState(pickup?.address || '');
  const [destInput, setDestInput] = useState(destination?.address || '');
  
  const [pickupSuggestions, setPickupSuggestions] = useState<SearchSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<SearchSuggestion[]>([]);
  
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const [pickupDropdownOpen, setPickupDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  
  const [timeOption, setTimeOption] = useState<'NOW' | 'SCHEDULED'>('NOW');

  // Sync internal input string when pickup/destination state changes externally (e.g. via map click)
  useEffect(() => {
    if (pickup?.address) setPickupInput(pickup.address);
  }, [pickup?.address]);

  useEffect(() => {
    if (destination?.address) setDestInput(destination.address);
  }, [destination?.address]);

  // Handle Autocomplete Search for Pickup Input
  useEffect(() => {
    if (!pickupInput || pickupInput.length < 3 || !pickupDropdownOpen) {
      setPickupSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(pickupInput)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPickupSuggestions(
            data.map((item: any) => ({
              place_id: item.place_id,
              display_name: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }))
          );
        }
      } catch (err) {
        console.error("Error searching pickup location:", err);
      } finally {
        setIsSearchingPickup(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pickupInput, pickupDropdownOpen]);

  // Handle Autocomplete Search for Destination Input
  useEffect(() => {
    if (!destInput || destInput.length < 3 || !destDropdownOpen) {
      setDestSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(destInput)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setDestSuggestions(
            data.map((item: any) => ({
              place_id: item.place_id,
              display_name: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }))
          );
        }
      } catch (err) {
        console.error("Error searching destination location:", err);
      } finally {
        setIsSearchingDest(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [destInput, destDropdownOpen]);

  // GPS Location button click ("Lấy vị trí hiện tại của tôi")
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      onFormValidationFail('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setIsLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          let address = data.display_name;

          // If server response is empty or raw coords, attempt direct client-side reverse geocoding
          if (!address || address.includes('(') && address.includes(')')) {
            try {
              const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`);
              const nomData = await nomRes.json();
              if (nomData && nomData.display_name) {
                address = nomData.display_name
                  .replace(/, \d{5,6}/g, '')
                  .replace(/, Việt Nam$/gi, '')
                  .trim();
              }
            } catch {
              // Ignore client fetch error
            }
          }

          if (!address) {
            address = `Vị trí điểm đón GPS`;
          }
          
          setPickupInput(address);
          setPickup({ address, lat, lng });
        } catch (err) {
          console.error("GPS Reverse Geocoding Error:", err);
          const fallbackAddress = `Vị trí điểm đón hiện tại`;
          setPickupInput(fallbackAddress);
          setPickup({ address: fallbackAddress, lat, lng });
        } finally {
          setIsLoadingGps(false);
        }
      },
      (error) => {
        setIsLoadingGps(false);
        let msg = 'Không thể lấy vị trí GPS hiện tại.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Vui lòng cho phép ứng dụng truy cập quyền vị trí GPS trên thiết bị hoặc trình duyệt của bạn.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Tín hiệu GPS không khả dụng. Vui lòng bật định vị vị trí trên thiết bị.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Hết thời gian chờ định vị GPS. Vui lòng thử lại.';
        }
        onFormValidationFail(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Preset location quick picks for convenience
  const quickDestinations = [
    { name: 'Sân bay Nội Bài', lat: 21.2187, lng: 105.8042, address: 'Cảng hàng không Quốc tế Nội Bài, Hà Nội' },
    { name: 'Sân bay Tân Sơn Nhất', lat: 10.8185, lng: 106.6588, address: 'Cảng hàng không Quốc tế Tân Sơn Nhất, TP.HCM' },
    { name: 'Bến xe Mỹ Đình', lat: 21.0282, lng: 105.7783, address: 'Bến xe Mỹ Đình, Nam Từ Liêm, Hà Nội' },
    { name: 'Phố Cổ / Hoàn Kiếm', lat: 21.0333, lng: 105.8500, address: 'Quận Hoàn Kiếm, Hà Nội' }
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Section 1: Customer Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <User className="w-4 h-4" />
          <span>1. Thông Tin Khách Hàng</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Họ và tên khách hàng <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Số điện thoại liên hệ <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                placeholder="Ví dụ: 0912345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Section 2: Pickup & Destination Locations */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-4 h-4" />
          <span>2. Địa Điểm Đón & Đến</span>
        </h3>

        {/* Pickup Address Field */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <label className="block text-xs font-semibold text-slate-300">
              Điểm đón khách <span className="text-rose-400">*</span>
            </label>

            {/* GPS Location Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLoadingGps}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg border border-emerald-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Sử dụng GPS thiết bị lấy vị trí chính xác hiện tại"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingGps ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isLoadingGps ? 'Đang định vị GPS...' : 'Lấy vị trí hiện tại của tôi'}</span>
            </button>
          </div>

          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-500 absolute left-3.5 top-3.5 border-2 border-slate-900 shadow-sm"></span>
            <input
              type="text"
              placeholder="Nhập địa chỉ đón (ví dụ: 123 Nguyễn Trãi, Thanh Xuân)"
              value={pickupInput}
              onChange={(e) => {
                setPickupInput(e.target.value);
                setPickupDropdownOpen(true);
              }}
              onFocus={() => setPickupDropdownOpen(true)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl py-2.5 pl-9 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            {isSearchingPickup && (
              <div className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown for Pickup */}
          {pickupDropdownOpen && (pickupSuggestions.length > 0 || isSearchingPickup) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
              <div className="bg-slate-950/80 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Google Places Autocomplete</span>
                </span>
                <span>Gợi ý địa chỉ tự động</span>
              </div>
              {isSearchingPickup && pickupSuggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tìm kiếm gợi ý địa chỉ...</span>
                </div>
              )}
              {pickupSuggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => {
                    setPickupInput(item.display_name);
                    setPickup({ address: item.display_name, lat: item.lat, lng: item.lng });
                    setPickupDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/90 text-xs text-slate-200 border-b border-slate-800/80 flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Address Field */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Điểm đến <span className="text-rose-400">*</span>
          </label>

          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-rose-500 absolute left-3.5 top-3.5 border-2 border-slate-900 shadow-sm"></span>
            <input
              type="text"
              placeholder="Nhập địa chỉ trả khách (ví dụ: Landmark 81, TP.HCM)"
              value={destInput}
              onChange={(e) => {
                setDestInput(e.target.value);
                setDestDropdownOpen(true);
              }}
              onFocus={() => setDestDropdownOpen(true)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl py-2.5 pl-9 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            {isSearchingDest && (
              <div className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown for Destination */}
          {destDropdownOpen && (destSuggestions.length > 0 || isSearchingDest) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
              <div className="bg-slate-950/80 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1 text-rose-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Google Places Autocomplete</span>
                </span>
                <span>Gợi ý địa chỉ tự động</span>
              </div>
              {isSearchingDest && destSuggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tìm kiếm gợi ý địa chỉ...</span>
                </div>
              )}
              {destSuggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => {
                    setDestInput(item.display_name);
                    setDestination({ address: item.display_name, lat: item.lat, lng: item.lng });
                    setDestDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/90 text-xs text-slate-200 border-b border-slate-800/80 flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Destination Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Gợi ý nhanh:</span>
          {quickDestinations.map((place) => (
            <button
              key={place.name}
              type="button"
              onClick={() => {
                setDestInput(place.address);
                setDestination({ address: place.address, lat: place.lat, lng: place.lng });
              }}
              className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              + {place.name}
            </button>
          ))}
        </div>

      </div>

      {/* Section 3: Vehicle Type Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Car className="w-4 h-4" />
          <span>3. Chọn Loại Xe Phục Vụ</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Ô tô 4-7 chỗ */}
          <button
            type="button"
            onClick={() => setVehicleType('Ô tô 4-7 chỗ')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Ô tô 4-7 chỗ'
                ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Car className={`w-6 h-6 mb-2 ${vehicleType === 'Ô tô 4-7 chỗ' ? 'text-amber-400' : 'text-slate-400'}`} />
            <p className="font-bold text-xs">Ô tô 4-7 chỗ</p>
            <p className="text-[10px] text-slate-400">Sedan, SUV, Hatchback</p>
          </button>

          {/* Xe máy */}
          <button
            type="button"
            onClick={() => setVehicleType('Xe máy')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Xe máy'
                ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Bike className={`w-6 h-6 mb-2 ${vehicleType === 'Xe máy' ? 'text-amber-400' : 'text-slate-400'}`} />
            <p className="font-bold text-xs">Xe máy</p>
            <p className="text-[10px] text-slate-400">Xe số, tay ga, tay côn</p>
          </button>

          {/* Xe sang / Bán tải */}
          <button
            type="button"
            onClick={() => setVehicleType('Xe sang / Bán tải')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Xe sang / Bán tải'
                ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className={`w-6 h-6 mb-2 ${vehicleType === 'Xe sang / Bán tải' ? 'text-amber-400' : 'text-slate-400'}`} />
            <p className="font-bold text-xs">Xe sang / Bán tải</p>
            <p className="text-[10px] text-slate-400">Mercedes, BMW, Ranger...</p>
          </button>

          {/* Thuê theo giờ */}
          <button
            type="button"
            onClick={() => setVehicleType('Thuê theo giờ')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Thuê theo giờ'
                ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Clock className={`w-6 h-6 mb-2 ${vehicleType === 'Thuê theo giờ' ? 'text-amber-400' : 'text-slate-400'}`} />
            <p className="font-bold text-xs">Thuê theo giờ</p>
            <p className="text-[10px] text-slate-400">Combo 3h (500k)</p>
          </button>

        </div>

        {/* Hourly Hours Stepper (Only shown if vehicleType == 'Thuê theo giờ') */}
        {vehicleType === 'Thuê theo giờ' && (
          <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Số giờ muốn thuê tài xế:</p>
              <p className="text-[11px] text-slate-400">Combo 3 giờ đầu 500k (+100k/giờ tiếp theo)</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
              <button
                type="button"
                onClick={() => setHourlyHours(Math.max(3, hourlyHours - 1))}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-sm"
              >
                -
              </button>
              <span className="font-extrabold text-amber-400 text-sm px-1">{hourlyHours} giờ</span>
              <button
                type="button"
                onClick={() => setHourlyHours(hourlyHours + 1)}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-sm"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Live Distance & Estimated Total Price Banner (Google Maps Distance Matrix / Directions API) */}
        {priceBreakdown && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-slate-900 border border-amber-500/40 p-4 rounded-xl shadow-lg transition-all animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    Tổng tiền dự tính ({vehicleType})
                  </span>
                  {isCalculatingRoute && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-300 font-normal">
                      <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      Đang tính lại...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {priceBreakdown.isHourly ? (
                    <span>Thuê theo gói <strong>{priceBreakdown.hourlyHours} giờ</strong></span>
                  ) : priceBreakdown.distanceKm > 0 ? (
                    <span>Quãng đường ô tô: <strong className="text-white">{priceBreakdown.distanceKm} km</strong> (~ <strong className="text-emerald-300">{priceBreakdown.estimatedMinutes} phút</strong> di chuyển)</span>
                  ) : (
                    <span className="text-slate-400">Vui lòng nhập điểm đón & điểm đến để tự động tính tiền</span>
                  )}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                  {PriceCalculator.formatCurrency(priceBreakdown.totalPrice)}
                </span>
                <p className="text-[10px] text-slate-400">Chưa bao gồm VAT (Tự động tính theo bảng giá)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Scheduled Pickup Time */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Clock className="w-4 h-4" />
          <span>4. Thời Gian Hẹn Đón</span>
        </h3>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="timeOpt"
              checked={timeOption === 'NOW'}
              onChange={() => {
                setTimeOption('NOW');
                setScheduledTime(new Date());
              }}
              className="accent-amber-400 w-4 h-4"
            />
            <span className="text-xs font-semibold text-white">Đón ngay bây giờ (Sau 10-15 phút)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="timeOpt"
              checked={timeOption === 'SCHEDULED'}
              onChange={() => setTimeOption('SCHEDULED')}
              className="accent-amber-400 w-4 h-4"
            />
            <span className="text-xs font-semibold text-white">Đặt trước giờ đón</span>
          </label>
        </div>

        {timeOption === 'SCHEDULED' && (
          <div className="pt-2">
            <input
              type="datetime-local"
              value={new Date(scheduledTime.getTime() - scheduledTime.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)}
              onChange={(e) => {
                if (e.target.value) {
                  setScheduledTime(new Date(e.target.value));
                }
              }}
              className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>
        )}
      </div>

      {/* Section 5: Note for Driver */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Edit3 className="w-4 h-4" />
          <span>5. Ghi Chú Cho Tài Xế</span>
        </h3>

        <textarea
          rows={2}
          placeholder="Nhập ghi chú cho tài xế (ví dụ: khách có say rượu, xe số sàn, điểm đón trong hầm...)"
          value={noteForDriver}
          onChange={(e) => setNoteForDriver(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all"
        />

        {/* Quick note option chips */}
        <div className="flex flex-wrap gap-1.5">
          {['Tài xế lái được xe số sàn', 'Khách say rượu cần hỗ trợ', 'Xe đỗ ở hầm B2', 'Cần tài xế kinh nghiệm xe sang'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setNoteForDriver(noteForDriver ? `${noteForDriver}, ${chip}` : chip);
              }}
              className="px-2.5 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Section 6: VAT Invoice Option */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                checked={needVat}
                onChange={(e) => setNeedVat(e.target.checked)}
                className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 checked:right-1 checked:left-auto"
                style={{
                  transform: needVat ? 'translateX(16px)' : 'translateX(0px)',
                  backgroundColor: needVat ? '#F59E0B' : '#ffffff'
                }}
              />
              <span className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer border ${needVat ? 'bg-amber-500/30 border-amber-400' : 'bg-slate-950 border-slate-700'}`}></span>
            </div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Tôi cần xuất hóa đơn VAT (+8%)</span>
            </span>
          </label>
        </div>

        {/* Conditional VAT Fields */}
        {needVat && (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3 animate-fadeIn">
            <p className="text-xs font-bold text-amber-400">Thông tin xuất hóa đơn GTGT:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tên công ty / Đơn vị</label>
                <input
                  type="text"
                  placeholder="Công ty TNHH..."
                  value={vatDetails.companyName}
                  onChange={(e) => setVatDetails({ ...vatDetails, companyName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mã số thuế (MST)</label>
                <input
                  type="text"
                  placeholder="0101234567"
                  value={vatDetails.taxCode}
                  onChange={(e) => setVatDetails({ ...vatDetails, taxCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Địa chỉ đăng ký kinh doanh</label>
                <input
                  type="text"
                  placeholder="Địa chỉ trụ sở..."
                  value={vatDetails.companyAddress}
                  onChange={(e) => setVatDetails({ ...vatDetails, companyAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email nhận hóa đơn điện tử</label>
                <input
                  type="email"
                  placeholder="ketoan@company.com"
                  value={vatDetails.email}
                  onChange={(e) => setVatDetails({ ...vatDetails, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint, VehicleTypeOption, VatDetails, SearchSuggestion, PriceBreakdown } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { autoCompleteGoong, getPlaceDetailGoong, reverseGeocodeGoong } from '../utils/goong';
import { useLanguage } from '../i18n/LanguageContext';
import { MapPin, Navigation, Car, Bike, ShieldCheck, Clock, FileText, User, Phone, Edit3, Sparkles, Check, AlertCircle, Calculator, Route, Ticket, Tag, Percent } from 'lucide-react';

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
  dailyDays?: number;
  setDailyDays?: (d: number) => void;
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
  promoCode?: string;
  setPromoCode?: (code: string) => void;
  onFormValidationFail: (msg: string) => void;
  onOpenPhoneAuth?: () => void;
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
  dailyDays = 1,
  setDailyDays,
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
  promoCode = '',
  setPromoCode,
  onFormValidationFail,
  onOpenPhoneAuth
}) => {
  const { t } = useLanguage();
  const [pickupInput, setPickupInput] = useState(pickup?.address || '');
  const [destInput, setDestInput] = useState(destination?.address || '');
  
  const [couponInput, setCouponInput] = useState(promoCode || '');

  useEffect(() => {
    if (promoCode !== couponInput) {
      setCouponInput(promoCode || '');
    }
  }, [promoCode]);

  const handleCouponInputChange = (val: string) => {
    const formatted = val.toUpperCase();
    setCouponInput(formatted);
    if (setPromoCode) {
      setPromoCode(formatted.trim());
    }
  };

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const codeToApply = couponInput.trim().toUpperCase();
    if (setPromoCode) {
      setPromoCode(codeToApply);
    }
  };
  
  const [pickupSuggestions, setPickupSuggestions] = useState<SearchSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<SearchSuggestion[]>([]);
  
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const [pickupDropdownOpen, setPickupDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  
  const [timeOption, setTimeOption] = useState<'NOW' | 'SCHEDULED'>('NOW');
  const [isGpsDenied, setIsGpsDenied] = useState(false);
  const pickupInputRef = useRef<HTMLInputElement>(null);

  // Sync internal input string when pickup/destination state changes externally (e.g. via map click)
  useEffect(() => {
    if (pickup?.address) setPickupInput(pickup.address);
  }, [pickup?.address]);

  useEffect(() => {
    if (destination?.address) setDestInput(destination.address);
  }, [destination?.address]);

  // Handle selection of a pickup suggestion
  const handleSelectPickupSuggestion = async (item: SearchSuggestion) => {
    setPickupInput(item.display_name);
    setPickupDropdownOpen(false);

    if (item.lat !== undefined && item.lng !== undefined && !isNaN(item.lat) && !isNaN(item.lng)) {
      setPickup({ address: item.display_name, lat: item.lat, lng: item.lng });
    } else {
      // Resolve place details for lat/lng using Goong place detail API
      try {
        const detail = await getPlaceDetailGoong(String(item.place_id), undefined, item.display_name);
        if (detail && detail.location?.lat && detail.location?.lng) {
          setPickup({ address: detail.formatted_address || item.display_name, lat: detail.location.lat, lng: detail.location.lng });
          if (detail.formatted_address) setPickupInput(detail.formatted_address);
          return;
        }
      } catch (err) {
        console.warn("Error fetching Goong place details for pickup:", err);
      }

      setPickup((prev) => ({ address: item.display_name, lat: prev?.lat || 21.0285, lng: prev?.lng || 105.8542 }));
    }
  };

  // Handle selection of a destination suggestion
  const handleSelectDestSuggestion = async (item: SearchSuggestion) => {
    setDestInput(item.display_name);
    setDestDropdownOpen(false);

    if (item.lat !== undefined && item.lng !== undefined && !isNaN(item.lat) && !isNaN(item.lng)) {
      setDestination({ address: item.display_name, lat: item.lat, lng: item.lng });
    } else {
      // Resolve place details for lat/lng using Goong place detail API
      try {
        const detail = await getPlaceDetailGoong(String(item.place_id), undefined, item.display_name);
        if (detail && detail.location?.lat && detail.location?.lng) {
          setDestination({ address: detail.formatted_address || item.display_name, lat: detail.location.lat, lng: detail.location.lng });
          if (detail.formatted_address) setDestInput(detail.formatted_address);
          return;
        }
      } catch (err) {
        console.warn("Error fetching Goong place details for destination:", err);
      }

      setDestination((prev) => ({ address: item.display_name, lat: prev?.lat || 21.0285, lng: prev?.lng || 105.8542 }));
    }
  };

  // Handle manual typing blur for Pickup (geocode typed address if no dropdown item clicked)
  const handlePickupBlur = () => {
    setTimeout(async () => {
      setPickupDropdownOpen(false);
      if (!pickupInput || pickupInput.trim().length < 3) return;
      if (pickup?.address === pickupInput) return;

      try {
        const predictions = await autoCompleteGoong(pickupInput);
        if (predictions.length > 0) {
          const firstDetail = await getPlaceDetailGoong(predictions[0].place_id, undefined, pickupInput);
          if (firstDetail && firstDetail.location?.lat && firstDetail.location?.lng) {
            setPickup({ address: pickupInput, lat: firstDetail.location.lat, lng: firstDetail.location.lng });
          }
        }
      } catch (err) {
        console.warn("Error resolving manual pickup address:", err);
      }
    }, 200);
  };

  // Handle manual typing blur for Destination
  const handleDestBlur = () => {
    setTimeout(async () => {
      setDestDropdownOpen(false);
      if (!destInput || destInput.trim().length < 3) return;
      if (destination?.address === destInput) return;

      try {
        const predictions = await autoCompleteGoong(destInput);
        if (predictions.length > 0) {
          const firstDetail = await getPlaceDetailGoong(predictions[0].place_id, undefined, destInput);
          if (firstDetail && firstDetail.location?.lat && firstDetail.location?.lng) {
            setDestination({ address: destInput, lat: firstDetail.location.lat, lng: firstDetail.location.lng });
          }
        }
      } catch (err) {
        console.warn("Error resolving manual destination address:", err);
      }
    }, 200);
  };

  // Handle Autocomplete Search for Pickup Input with Goong API & 300ms debounce
  useEffect(() => {
    if (!pickupInput || pickupInput.trim().length < 2 || !pickupDropdownOpen) {
      setPickupSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const predictions = await autoCompleteGoong(pickupInput);
        if (Array.isArray(predictions)) {
          setPickupSuggestions(
            predictions.map((item) => ({
              place_id: item.place_id,
              display_name: item.description,
            }))
          );
        }
      } catch (err) {
        console.error("Error searching pickup location:", err);
      } finally {
        setIsSearchingPickup(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupInput, pickupDropdownOpen]);

  // Handle Autocomplete Search for Destination Input with Goong API & 300ms debounce
  useEffect(() => {
    if (!destInput || destInput.trim().length < 2 || !destDropdownOpen) {
      setDestSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const predictions = await autoCompleteGoong(destInput);
        if (Array.isArray(predictions)) {
          setDestSuggestions(
            predictions.map((item) => ({
              place_id: item.place_id,
              display_name: item.description,
            }))
          );
        }
      } catch (err) {
        console.error("Error searching destination location:", err);
      } finally {
        setIsSearchingDest(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destInput, destDropdownOpen]);

  // GPS Location button click ("Lấy vị trí hiện tại của tôi")
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setIsGpsDenied(true);
      onFormValidationFail('Trình duyệt của bạn không hỗ trợ định vị GPS. Đã chuyển sang chế độ tự nhập địa chỉ thủ công.');
      setPickupDropdownOpen(true);
      setTimeout(() => pickupInputRef.current?.focus(), 100);
      return;
    }

    setIsLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsGpsDenied(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          let address = await reverseGeocodeGoong(lat, lng);
          if (!address) {
            address = `Vị trí điểm đón GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          }
          
          setPickupInput(address);
          setPickup({ address, lat, lng });
        } catch (err) {
          console.error("GPS Reverse Geocoding Error:", err);
          const fallbackAddress = `Vị trí điểm đón GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setPickupInput(fallbackAddress);
          setPickup({ address: fallbackAddress, lat, lng });
        } finally {
          setIsLoadingGps(false);
        }
      },
      (error) => {
        setIsLoadingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setIsGpsDenied(true);
          setPickupDropdownOpen(true);
          setTimeout(() => pickupInputRef.current?.focus(), 100);
          onFormValidationFail('Quyền định vị GPS bị từ chối. Đã chuyển sang chế độ gõ tìm kiếm địa chỉ thủ công (Google Places / Goong Map).');
        } else {
          let msg = 'Không thể lấy vị trí GPS hiện tại. Vui lòng tự gõ địa chỉ thủ công.';
          if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Tín hiệu GPS không khả dụng. Vui lòng tự nhập địa chỉ thủ công.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Hết thời gian chờ GPS. Vui lòng tự nhập địa chỉ thủ công.';
          }
          onFormValidationFail(msg);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-lg shadow-slate-200/50 space-y-6">
      
      {/* Section 1: Customer Info */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{t.form.secCustomer}</span>
          </h3>

          {onOpenPhoneAuth && (
            <button
              type="button"
              onClick={onOpenPhoneAuth}
              className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 shrink-0 self-start sm:self-auto transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Đăng nhập SĐT (Không bắt buộc) - Nhận Voucher 10%</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.form.nameLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={t.form.namePlaceholder}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.form.phoneLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                placeholder={t.form.phonePlaceholder}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Section 2: Pickup & Destination Locations */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
          <MapPin className="w-4 h-4" />
          <span>{t.form.secRoute}</span>
        </h3>

        {/* Pickup Address Field */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <label className="block text-xs font-semibold text-slate-700">
              {t.form.pickupLabel} <span className="text-rose-500">*</span>
            </label>

            {/* GPS Location Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLoadingGps}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95"
              title="GPS"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isLoadingGps ? 'animate-spin text-amber-500' : ''}`} />
              <span>{isLoadingGps ? t.form.gettingGps : t.form.getGpsBtn}</span>
            </button>
          </div>

          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-500 absolute left-3.5 top-3.5 border-2 border-white shadow-sm"></span>
            <input
              ref={pickupInputRef}
              type="text"
              placeholder={isLoadingGps ? 'Đang định vị vị trí GPS và tìm địa chỉ...' : isGpsDenied ? 'Gõ tên đường, địa điểm (Sân bay, Khách sạn...)' : t.form.pickupPlaceholder}
              value={pickupInput}
              onChange={(e) => {
                setPickupInput(e.target.value);
                setPickupDropdownOpen(true);
              }}
              onFocus={() => setPickupDropdownOpen(true)}
              onBlur={handlePickupBlur}
              disabled={isLoadingGps}
              className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all disabled:opacity-80 ${
                isGpsDenied ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            {(isSearchingPickup || isLoadingGps) && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* GPS Denied Fallback Notice */}
          {isGpsDenied && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-300/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 shadow-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="font-bold text-amber-900">
                    Chế độ tự nhập địa chỉ thủ công
                  </p>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded">
                    Quyền GPS bị từ chối
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Trình duyệt bị từ chối quyền vị trí. Bạn có thể tự gõ địa chỉ hoặc chọn bất kỳ địa điểm nào bên trên để Google Places / Goong Map tìm kiếm chính xác.
                </p>
              </div>
            </div>
          )}

          {/* Autocomplete Dropdown for Pickup */}
          {pickupDropdownOpen && (pickupSuggestions.length > 0 || isSearchingPickup) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
              <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <Sparkles className="w-3 h-3" />
                  <span>Google Places Autocomplete</span>
                </span>
                <span>Gợi ý địa chỉ tự động</span>
              </div>
              {isSearchingPickup && pickupSuggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tìm kiếm gợi ý địa chỉ...</span>
                </div>
              )}
              {pickupSuggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectPickupSuggestion(item);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50 text-xs text-slate-800 border-b border-slate-100 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Address Field */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.form.destLabel} <span className="text-rose-500">*</span>
          </label>

          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-rose-500 absolute left-3.5 top-3.5 border-2 border-white shadow-sm"></span>
            <input
              type="text"
              placeholder={t.form.destPlaceholder}
              value={destInput}
              onChange={(e) => {
                setDestInput(e.target.value);
                setDestDropdownOpen(true);
              }}
              onFocus={() => setDestDropdownOpen(true)}
              onBlur={handleDestBlur}
              className="w-full bg-slate-50 border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
            {isSearchingDest && (
              <div className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown for Destination */}
          {destDropdownOpen && (destSuggestions.length > 0 || isSearchingDest) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
              <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span className="flex items-center gap-1 text-rose-700">
                  <Sparkles className="w-3 h-3" />
                  <span>Google Places Autocomplete</span>
                </span>
                <span>Gợi ý địa chỉ tự động</span>
              </div>
              {isSearchingDest && destSuggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tìm kiếm gợi ý địa chỉ...</span>
                </div>
              )}
              {destSuggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectDestSuggestion(item);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 text-xs text-slate-800 border-b border-slate-100 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Destination Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Gợi ý nhanh:</span>
          {quickDestinations.map((place) => (
            <button
              key={place.name}
              type="button"
              onClick={() => {
                setDestInput(place.address);
                setDestination({ address: place.address, lat: place.lat, lng: place.lng });
              }}
              className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-amber-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
            >
              + {place.name}
            </button>
          ))}
        </div>

        {/* Driving Route Calculation Status Indicator */}
        {isCalculatingRoute && (
          <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 shadow-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="font-semibold">Đang tính toán tuyến đường ô tô và khoảng cách thực tế...</span>
          </div>
        )}

      </div>

      {/* Section 3: Vehicle Type & Service Mode Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span>2. Chọn loại gói dịch vụ & phương tiện</span>
          </h3>
        </div>

        {/* Group 1: Lái hộ theo lượt (KM) */}
        <div className="space-y-2">
          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-amber-600" />
            <span>A. Lái hộ theo lượt / Kilomet</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Ô tô / Xe máy */}
            <button
              type="button"
              onClick={() => setVehicleType('Ô tô / Xe máy')}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                vehicleType === 'Ô tô / Xe máy'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${vehicleType === 'Ô tô / Xe máy' ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Ô tô / Xe máy</p>
                <p className={`text-[11px] mt-0.5 ${vehicleType === 'Ô tô / Xe máy' ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}>
                  Lái hộ ô tô, xe máy tính theo lượt
                </p>
              </div>
            </button>

            {/* Dịch vụ Luxury */}
            <button
              type="button"
              onClick={() => setVehicleType('Dịch vụ Luxury')}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                vehicleType === 'Dịch vụ Luxury'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${vehicleType === 'Dịch vụ Luxury' ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Dịch vụ Luxury</p>
                <p className={`text-[11px] mt-0.5 ${vehicleType === 'Dịch vụ Luxury' ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}>
                  Lái hộ dịch vụ Luxury tính theo lượt
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Group 2: Lái hộ theo giờ */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>B. Thuê lái theo giờ</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Thuê theo giờ (Ô tô / Xe máy) */}
            <button
              type="button"
              onClick={() => setVehicleType('Thuê theo giờ (Ô tô / Xe máy)')}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                vehicleType === 'Thuê theo giờ (Ô tô / Xe máy)'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${vehicleType === 'Thuê theo giờ (Ô tô / Xe máy)' ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Theo giờ: Ô tô / Xe máy</p>
                <p className={`text-[11px] mt-0.5 ${vehicleType === 'Thuê theo giờ (Ô tô / Xe máy)' ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}>
                  Thuê tài xế lái ô tô, xe máy theo giờ
                </p>
              </div>
            </button>

            {/* Thuê theo giờ (Dịch vụ Luxury) */}
            <button
              type="button"
              onClick={() => setVehicleType('Thuê theo giờ (Dịch vụ Luxury)')}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                vehicleType === 'Thuê theo giờ (Dịch vụ Luxury)'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${vehicleType === 'Thuê theo giờ (Dịch vụ Luxury)' ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Theo giờ: Dịch vụ Luxury</p>
                <p className={`text-[11px] mt-0.5 ${vehicleType === 'Thuê theo giờ (Dịch vụ Luxury)' ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}>
                  Thuê tài xế lái Dịch vụ Luxury theo giờ
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Group 3: Thuê lái theo ngày (24h) */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>C. Thuê lái theo ngày (Gói 24h)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Thuê theo ngày (Ô tô / Xe máy) */}
            <button
              type="button"
              onClick={() => setVehicleType('Thuê theo ngày (Ô tô / Xe máy)')}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                vehicleType === 'Thuê theo ngày (Ô tô / Xe máy)'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${vehicleType === 'Thuê theo ngày (Ô tô / Xe máy)' ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Theo ngày: Ô tô / Xe máy</p>
                <p className={`text-[11px] mt-0.5 ${vehicleType === 'Thuê theo ngày (Ô tô / Xe máy)' ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}>
                  Thuê tài xế lái ô tô, xe máy trọn ngày
                </p>
              </div>
            </button>

            {/* Thuê theo ngày (Dịch vụ Luxury) */}
            <button
              type="button"
              onClick={() => setVehicleType('Thuê theo ngày (Dịch vụ Luxury)')}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                vehicleType === 'Thuê theo ngày (Dịch vụ Luxury)'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${vehicleType === 'Thuê theo ngày (Dịch vụ Luxury)' ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Theo ngày: Dịch vụ Luxury</p>
                <p className={`text-[11px] mt-0.5 ${vehicleType === 'Thuê theo ngày (Dịch vụ Luxury)' ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}>
                  Thuê tài xế lái Dịch vụ Luxury trọn ngày
                </p>
              </div>
            </button>

          </div>

          {/* Note placed directly under Daily Rental options */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-900 font-bold mt-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>(Lưu ý: Giá trên chưa bao gồm hỗ trợ chi phí ăn ở cho tài xế)</p>
          </div>
        </div>

        {/* Hourly Hours Input Box (If vehicleType includes 'Thuê theo giờ') */}
        {vehicleType.includes('Thuê theo giờ') && (
          <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-300 space-y-2 shadow-xs animate-fadeIn">
            <label className="text-xs font-extrabold text-slate-900 block">
              Nhập số giờ thuê tài xế:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={24}
                value={hourlyHours}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setHourlyHours(isNaN(val) ? 1 : Math.max(1, val));
                }}
                placeholder="Nhập số giờ (ví dụ: 3)"
                className="w-full sm:w-56 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
              <span className="text-xs font-bold text-slate-700 shrink-0">giờ</span>
            </div>
          </div>
        )}

        {/* Daily Days Input Box (If vehicleType includes 'Thuê theo ngày') */}
        {vehicleType.includes('Thuê theo ngày') && (
          <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-300 space-y-2 shadow-xs animate-fadeIn">
            <label className="text-xs font-extrabold text-slate-900 block">
              Nhập số ngày thuê tài xế (24h/ngày):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={30}
                value={dailyDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (setDailyDays) {
                    setDailyDays(isNaN(val) ? 1 : Math.max(1, val));
                  }
                }}
                placeholder="Nhập số ngày (ví dụ: 1)"
                className="w-full sm:w-56 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
              <span className="text-xs font-bold text-slate-700 shrink-0">ngày</span>
            </div>
          </div>
        )}

      </div>

        {/* Prominent Banner for First Trip Offer */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-3.5 rounded-xl border border-amber-600 shadow-xs flex items-center gap-3 text-slate-950 font-black text-xs sm:text-sm">
          <Sparkles className="w-5 h-5 text-slate-950 shrink-0 animate-pulse" />
          <div className="leading-tight">
            <p className="font-extrabold text-slate-950 text-xs sm:text-sm">
              Ưu đãi giảm 10% cho chuyến đi đầu tiên khi nhập mã{' '}
              <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded-md font-mono text-xs sm:text-sm border border-amber-300 font-bold inline-block ml-0.5">
                GOILAI10
              </span>
            </p>
          </div>
        </div>

        {/* Coupon / Voucher Discount Code Input Section */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>MÃ GIẢM GIÁ / VOUCHER KHUYẾN MÃI</span>
            </label>
            {priceBreakdown?.promoCode && priceBreakdown.discountAmount > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Đang dùng: {priceBreakdown.promoCode}
              </span>
            )}
          </div>

          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => handleCouponInputChange(e.target.value)}
                placeholder="Nhập mã ưu đãi của bạn tại đây..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="button"
              onClick={() => handleApplyCoupon()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              Áp Dụng
            </button>
          </form>

          {/* Voucher Result Alert */}
          {priceBreakdown?.promoError ? (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{priceBreakdown.promoError}</span>
            </div>
          ) : priceBreakdown?.promoMessage && priceBreakdown.discountAmount > 0 ? (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{priceBreakdown.promoMessage} ({priceBreakdown.discountCodeName})</span>
              </div>
              <span className="text-emerald-700 font-extrabold text-xs shrink-0">
                Tiết kiệm {PriceCalculator.formatCurrency(priceBreakdown.discountAmount)}
              </span>
            </div>
          ) : null}
        </div>

        {/* Live Distance & Estimated Total Price Banner (Google Maps Distance Matrix / Directions API) */}
        {priceBreakdown && (
          <div className="bg-amber-50/90 border border-amber-300 p-4 rounded-xl shadow-sm transition-all animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                    {t.form.liveTotalTitle} ({vehicleType})
                  </span>
                  {isCalculatingRoute && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-700 font-normal">
                      <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      {t.form.calculatingRoute}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-700 flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {priceBreakdown.isHourly ? (
                    <span>{t.form.hourlyRentalFor} <strong>{priceBreakdown.hourlyHours}h</strong></span>
                  ) : priceBreakdown.distanceKm > 0 ? (
                    <span>{t.form.roadDistance} <strong className="text-slate-900">{priceBreakdown.distanceKm} km</strong> (~ <strong className="text-emerald-700">{priceBreakdown.estimatedMinutes} {t.form.estimatedDuration}</strong>)</span>
                  ) : (
                    <span className="text-slate-500">{t.form.enterAddressPrompt}</span>
                  )}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                {priceBreakdown.discountAmount > 0 ? (
                  <>
                    <div className="text-[11px] text-slate-500 flex items-center justify-start sm:justify-end gap-1">
                      <span className="line-through decoration-slate-400 font-medium">{PriceCalculator.formatCurrency(priceBreakdown.originalPrice)}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                        Mã {priceBreakdown.promoCode}
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
                      {PriceCalculator.formatCurrency(priceBreakdown.totalPrice)}
                    </span>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Đã giảm {PriceCalculator.formatCurrency(priceBreakdown.discountAmount)} (Mã {priceBreakdown.promoCode})
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
                      {PriceCalculator.formatCurrency(priceBreakdown.totalPrice)}
                    </span>
                    <p className="text-[10px] text-slate-500 font-normal">
                      Nhập mã voucher để nhận ưu đãi
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Section 4: Scheduled Pickup Time */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
          <Clock className="w-4 h-4" />
          <span>{t.form.secTime}</span>
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="timeOpt"
              checked={timeOption === 'NOW'}
              onChange={() => {
                setTimeOption('NOW');
                setScheduledTime(new Date());
              }}
              className="accent-amber-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-800">{t.form.pickupNow}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="timeOpt"
              checked={timeOption === 'SCHEDULED'}
              onChange={() => setTimeOption('SCHEDULED')}
              className="accent-amber-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-800">{t.form.schedulePickup}</span>
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
              className="bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
            />
          </div>
        )}
      </div>

      {/* Section 5: Note for Driver */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
          <Edit3 className="w-4 h-4" />
          <span>{t.form.noteLabel}</span>
        </h3>

        <textarea
          rows={2}
          placeholder={t.form.notePlaceholder}
          value={noteForDriver}
          onChange={(e) => setNoteForDriver(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
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
              className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Section 6: VAT Invoice Option */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        
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
              <span className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer border ${needVat ? 'bg-amber-100 border-amber-400' : 'bg-slate-100 border-slate-300'}`}></span>
            </div>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>{t.form.vatCheck}</span>
            </span>
          </label>
        </div>

        {/* Conditional VAT Fields */}
        {needVat && (
          <div className="bg-slate-50 p-4 rounded-xl border border-amber-300 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.form.companyName}</label>
                <input
                  type="text"
                  placeholder={t.form.companyNamePlaceholder}
                  value={vatDetails.companyName}
                  onChange={(e) => setVatDetails({ ...vatDetails, companyName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.form.taxCode}</label>
                <input
                  type="text"
                  placeholder={t.form.taxCodePlaceholder}
                  value={vatDetails.taxCode}
                  onChange={(e) => setVatDetails({ ...vatDetails, taxCode: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.form.companyAddress}</label>
                <input
                  type="text"
                  placeholder={t.form.companyAddressPlaceholder}
                  value={vatDetails.companyAddress}
                  onChange={(e) => setVatDetails({ ...vatDetails, companyAddress: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.form.vatEmail}</label>
                <input
                  type="email"
                  placeholder={t.form.vatEmailPlaceholder}
                  value={vatDetails.email}
                  onChange={(e) => setVatDetails({ ...vatDetails, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

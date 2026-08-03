import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint, VehicleTypeOption, VatDetails, SearchSuggestion, PriceBreakdown } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { useLanguage } from '../i18n/LanguageContext';
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
  const { t } = useLanguage();
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

  // Handle selection of a pickup suggestion
  const handleSelectPickupSuggestion = async (item: SearchSuggestion) => {
    setPickupInput(item.display_name);
    setPickupDropdownOpen(false);

    if (item.lat !== undefined && item.lng !== undefined && !isNaN(item.lat) && !isNaN(item.lng)) {
      setPickup({ address: item.display_name, lat: item.lat, lng: item.lng });
    } else {
      // Resolve place details for lat/lng using details endpoint or search endpoint
      try {
        const res = await fetch(`/api/places/details?place_id=${item.place_id}&address=${encodeURIComponent(item.display_name)}`);
        if (res.ok) {
          const details = await res.json();
          if (details.lat && details.lng) {
            setPickup({ address: details.display_name || item.display_name, lat: details.lat, lng: details.lng });
            if (details.display_name) setPickupInput(details.display_name);
            return;
          }
        }
      } catch (err) {
        console.warn("Error fetching place details for pickup:", err);
      }

      try {
        const geoRes = await fetch(`/api/geocode/search?q=${encodeURIComponent(item.display_name)}`);
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData.length > 0 && geoData[0].lat && geoData[0].lon) {
          setPickup({ address: item.display_name, lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) });
          return;
        }
      } catch (err) {
        console.warn("Error geocoding fallback for pickup:", err);
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
      // Resolve place details for lat/lng using details endpoint or search endpoint
      try {
        const res = await fetch(`/api/places/details?place_id=${item.place_id}&address=${encodeURIComponent(item.display_name)}`);
        if (res.ok) {
          const details = await res.json();
          if (details.lat && details.lng) {
            setDestination({ address: details.display_name || item.display_name, lat: details.lat, lng: details.lng });
            if (details.display_name) setDestInput(details.display_name);
            return;
          }
        }
      } catch (err) {
        console.warn("Error fetching place details for destination:", err);
      }

      try {
        const geoRes = await fetch(`/api/geocode/search?q=${encodeURIComponent(item.display_name)}`);
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData.length > 0 && geoData[0].lat && geoData[0].lon) {
          setDestination({ address: item.display_name, lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) });
          return;
        }
      } catch (err) {
        console.warn("Error geocoding fallback for destination:", err);
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
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(pickupInput)}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const lat = first.lat !== undefined ? parseFloat(first.lat) : undefined;
          const lng = first.lon !== undefined ? parseFloat(first.lon) : (first.lng !== undefined ? parseFloat(first.lng) : undefined);
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            setPickup({ address: pickupInput, lat, lng });
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
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(destInput)}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const lat = first.lat !== undefined ? parseFloat(first.lat) : undefined;
          const lng = first.lon !== undefined ? parseFloat(first.lon) : (first.lng !== undefined ? parseFloat(first.lng) : undefined);
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            setDestination({ address: destInput, lat, lng });
          }
        }
      } catch (err) {
        console.warn("Error resolving manual destination address:", err);
      }
    }, 200);
  };

  // Handle Autocomplete Search for Pickup Input
  useEffect(() => {
    if (!pickupInput || pickupInput.trim().length < 2 || !pickupDropdownOpen) {
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
              lat: item.lat !== undefined && item.lat !== null ? parseFloat(item.lat) : undefined,
              lng: item.lon !== undefined && item.lon !== null ? parseFloat(item.lon) : (item.lng !== undefined && item.lng !== null ? parseFloat(item.lng) : undefined)
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

  // Handle Autocomplete Search for Destination Input
  useEffect(() => {
    if (!destInput || destInput.trim().length < 2 || !destDropdownOpen) {
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
              lat: item.lat !== undefined && item.lat !== null ? parseFloat(item.lat) : undefined,
              lng: item.lon !== undefined && item.lon !== null ? parseFloat(item.lon) : (item.lng !== undefined && item.lng !== null ? parseFloat(item.lng) : undefined)
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
      onFormValidationFail('Trình duyệt của bạn không hỗ trợ định vị GPS. Vui lòng tự nhập địa chỉ thủ công.');
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
          if (!address || (address.includes('(') && address.includes(')'))) {
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
        let msg = 'Không thể lấy vị trí GPS hiện tại.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Quyền định vị GPS bị từ chối. Vui lòng bật chia sẻ vị trí trong trình duyệt hoặc tự nhập địa chỉ thủ công.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Tín hiệu GPS không khả dụng. Vui lòng thử lại hoặc tự nhập địa chỉ thủ công.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Hết thời gian chờ GPS. Vui lòng thử lại hoặc tự nhập địa chỉ thủ công.';
        }
        onFormValidationFail(msg);
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
        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
          <User className="w-4 h-4" />
          <span>{t.form.secCustomer}</span>
        </h3>

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
              type="text"
              placeholder={isLoadingGps ? 'Đang định vị vị trí GPS và tìm địa chỉ...' : t.form.pickupPlaceholder}
              value={pickupInput}
              onChange={(e) => {
                setPickupInput(e.target.value);
                setPickupDropdownOpen(true);
              }}
              onFocus={() => setPickupDropdownOpen(true)}
              onBlur={handlePickupBlur}
              disabled={isLoadingGps}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all disabled:opacity-80"
            />
            {(isSearchingPickup || isLoadingGps) && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

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

      {/* Section 3: Vehicle Type Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
          <Car className="w-4 h-4" />
          <span>{t.form.secVehicle}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Ô tô 4-7 chỗ */}
          <button
            type="button"
            onClick={() => setVehicleType('Ô tô 4-7 chỗ')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Ô tô 4-7 chỗ'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            <Car className={`w-6 h-6 mb-2 ${vehicleType === 'Ô tô 4-7 chỗ' ? 'text-slate-950' : 'text-slate-500'}`} />
            <p className="font-bold text-xs">{t.vehicle.car4_7}</p>
            <p className={`text-[10px] ${vehicleType === 'Ô tô 4-7 chỗ' ? 'text-slate-900' : 'text-slate-500'}`}>Sedan, SUV, Hatchback</p>
          </button>

          {/* Xe máy */}
          <button
            type="button"
            onClick={() => setVehicleType('Xe máy')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Xe máy'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            <Bike className={`w-6 h-6 mb-2 ${vehicleType === 'Xe máy' ? 'text-slate-950' : 'text-slate-500'}`} />
            <p className="font-bold text-xs">{t.vehicle.motorbike}</p>
            <p className={`text-[10px] ${vehicleType === 'Xe máy' ? 'text-slate-900' : 'text-slate-500'}`}>Scooter, Manual, Clutch</p>
          </button>

          {/* Xe sang / Bán tải */}
          <button
            type="button"
            onClick={() => setVehicleType('Xe sang / Bán tải')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Xe sang / Bán tải'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            <ShieldCheck className={`w-6 h-6 mb-2 ${vehicleType === 'Xe sang / Bán tải' ? 'text-slate-950' : 'text-slate-500'}`} />
            <p className="font-bold text-xs">{t.vehicle.luxury}</p>
            <p className={`text-[10px] ${vehicleType === 'Xe sang / Bán tải' ? 'text-slate-900' : 'text-slate-500'}`}>Mercedes, BMW, Pickup...</p>
          </button>

          {/* Thuê theo giờ */}
          <button
            type="button"
            onClick={() => setVehicleType('Thuê theo giờ')}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              vehicleType === 'Thuê theo giờ'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            <Clock className={`w-6 h-6 mb-2 ${vehicleType === 'Thuê theo giờ' ? 'text-slate-950' : 'text-slate-500'}`} />
            <p className="font-bold text-xs">{t.vehicle.hourly}</p>
            <p className={`text-[10px] ${vehicleType === 'Thuê theo giờ' ? 'text-slate-900' : 'text-slate-500'}`}>Combo 3h (500k)</p>
          </button>

        </div>

        {/* Hourly Hours Stepper (Only shown if vehicleType == 'Thuê theo giờ') */}
        {vehicleType === 'Thuê theo giờ' && (
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">{t.form.hourlySelectLabel}:</p>
            </div>
            <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-sm">
              <button
                type="button"
                onClick={() => setHourlyHours(Math.max(3, hourlyHours - 1))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-sm"
              >
                -
              </button>
              <span className="font-extrabold text-amber-700 text-sm px-1">{hourlyHours}h</span>
              <button
                type="button"
                onClick={() => setHourlyHours(hourlyHours + 1)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-sm"
              >
                +
              </button>
            </div>
          </div>
        )}

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
                <span className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
                  {PriceCalculator.formatCurrency(priceBreakdown.totalPrice)}
                </span>
                <p className="text-[10px] text-slate-500">{t.form.noVatNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>

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

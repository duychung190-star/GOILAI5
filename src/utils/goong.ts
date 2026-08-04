/**
 * Goong Maps API Utility Module for D.GO 247
 * Provides direct & proxy integration with Goong.io APIs:
 * - Reverse Geocoding (/Geocode)
 * - Place AutoComplete (/Place/AutoComplete)
 * - Place Detail (/Place/Detail)
 * - Directions & Routing (/Direction)
 * - Fare Calculation based on actual driving road distance
 */

export const GOONG_API_KEY =
  (import.meta.env.VITE_GOONG_API_KEY as string) ||
  'rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut';

// Bac Ninh center coordinate default for Location Bias (Lat: 21.1861, Lng: 106.0763)
export const BAC_NINH_CENTER = {
  lat: 21.1861,
  lng: 106.0763,
  radiusMeters: 50000, // 50km radius around Bac Ninh
};

export interface GoongLocation {
  lat: number;
  lng: number;
}

export interface GoongAutoCompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  compound?: {
    district?: string;
    commune?: string;
    province?: string;
  };
}

export interface GoongPlaceDetailResult {
  place_id: string;
  name: string;
  formatted_address: string;
  location: GoongLocation;
}

export interface GoongDirectionLeg {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  start_address: string;
  end_address: string;
  start_location: GoongLocation;
  end_location: GoongLocation;
}

export interface GoongRouteResult {
  distanceKm: number;
  distanceMeters: number;
  durationMinutes: number;
  durationSeconds: number;
  durationText: string;
  distanceText: string;
  overviewPolyline?: string;
  decodedPath?: [number, number][]; // [lat, lng] list for map rendering
}

/**
 * 1. REVERSE GEOCODING: Convert GPS coordinates (lat, lng) to full detailed address
 * Call Goong Geocoding API or backend proxy endpoint
 */
export async function reverseGeocodeGoong(
  lat: number,
  lng: number,
  apiKey: string = GOONG_API_KEY
): Promise<string> {
  try {
    // Primary: Call Goong Geocode API directly if key is active
    if (apiKey) {
      const url = `https://api.goong.io/Geocode?latlng=${lat},${lng}&api_key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        let address = data.results[0].formatted_address || '';
        address = address.replace(/, Việt Nam$/gi, '').trim();
        if (address) return address;
      }
    }

    // Fallback: Backend proxy endpoint
    const proxyUrl = `/api/geocode/reverse?lat=${lat}&lng=${lng}`;
    const proxyRes = await fetch(proxyUrl);
    const proxyData = await proxyRes.json();
    return proxyData.display_name || `Vị trí (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch (error) {
    console.error('Goong Reverse Geocoding Error:', error);
    return `Vị trí (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
}

/**
 * 2. PLACES AUTOCOMPLETE: Smart address suggestions biased around Bac Ninh region
 * Applies location bias (21.1861, 106.0763) to boost local Bac Ninh locations
 */
export async function autoCompleteGoong(
  input: string,
  apiKey: string = GOONG_API_KEY,
  centerLat: number = BAC_NINH_CENTER.lat,
  centerLng: number = BAC_NINH_CENTER.lng
): Promise<GoongAutoCompletePrediction[]> {
  if (!input || input.trim().length === 0) return [];

  const cleanInput = input.trim();
  try {
    if (apiKey) {
      const url = `https://api.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(
        cleanInput
      )}&location=${centerLat},${centerLng}&radius=${BAC_NINH_CENTER.radiusMeters}&more_compound=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && Array.isArray(data.predictions)) {
        return data.predictions.map((p: any) => ({
          place_id: p.place_id,
          description: p.description,
          structured_formatting: p.structured_formatting,
          compound: p.compound,
        }));
      }
    }

    // Proxy fallback
    const proxyUrl = `/api/geocode/search?q=${encodeURIComponent(cleanInput)}`;
    const proxyRes = await fetch(proxyUrl);
    const proxyData = await proxyRes.json();

    if (Array.isArray(proxyData)) {
      return proxyData.map((item: any) => ({
        place_id: item.place_id || item.id || String(Math.random()),
        description: item.display_name || item.name,
      }));
    }

    return [];
  } catch (error) {
    console.error('Goong AutoComplete Error:', error);
    return [];
  }
}

/**
 * 2b. PLACE DETAIL: Get exact Lat/Lng coordinates when a suggestion is clicked
 */
export async function getPlaceDetailGoong(
  placeId: string,
  apiKey: string = GOONG_API_KEY,
  fallbackAddress?: string
): Promise<GoongPlaceDetailResult | null> {
  try {
    if (apiKey && placeId) {
      const url = `https://api.goong.io/Place/Detail?place_id=${placeId}&api_key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const res = data.result;
        return {
          place_id: res.place_id || placeId,
          name: res.name || res.formatted_address,
          formatted_address: res.formatted_address || res.name,
          location: {
            lat: res.geometry?.location?.lat,
            lng: res.geometry?.location?.lng,
          },
        };
      }
    }

    // Proxy fallback
    const params = new URLSearchParams();
    if (placeId) params.append('place_id', placeId);
    if (fallbackAddress) params.append('q', fallbackAddress);

    const proxyRes = await fetch(`/api/places/details?${params.toString()}`);
    const proxyData = await proxyRes.json();

    if (proxyData && typeof proxyData.lat === 'number' && typeof proxyData.lng === 'number') {
      return {
        place_id: proxyData.place_id || placeId,
        name: proxyData.display_name || fallbackAddress || '',
        formatted_address: proxyData.display_name || fallbackAddress || '',
        location: {
          lat: proxyData.lat,
          lng: proxyData.lng,
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Goong Place Detail Error:', error);
    return null;
  }
}

/**
 * 3. DIRECTIONS API: Get actual driving route, exact road distance & duration
 */
export async function getDirectionsGoong(
  origin: GoongLocation | string,
  destination: GoongLocation | string,
  vehicle: 'car' | 'bike' | 'taxi' | 'truck' = 'car',
  apiKey: string = GOONG_API_KEY
): Promise<GoongRouteResult | null> {
  try {
    let originStr = '';
    let destStr = '';

    if (typeof origin === 'object' && origin.lat && origin.lng) {
      originStr = `${origin.lat},${origin.lng}`;
    } else {
      originStr = String(origin);
    }

    if (typeof destination === 'object' && destination.lat && destination.lng) {
      destStr = `${destination.lat},${destination.lng}`;
    } else {
      destStr = String(destination);
    }

    if (apiKey && originStr && destStr) {
      const url = `https://api.goong.io/Direction?origin=${encodeURIComponent(
        originStr
      )}&destination=${encodeURIComponent(destStr)}&vehicle=${vehicle}&api_key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes[0] && data.routes[0].legs && data.routes[0].legs[0]) {
        const leg = data.routes[0].legs[0];
        const distanceMeters = leg.distance?.value || 0;
        const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
        const durationSeconds = leg.duration?.value || 0;
        const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

        let decodedPath: [number, number][] = [];
        if (data.routes[0].overview_polyline?.points) {
          decodedPath = decodeGoongPolyline(data.routes[0].overview_polyline.points);
        }

        return {
          distanceKm,
          distanceMeters,
          durationMinutes,
          durationSeconds,
          durationText: leg.duration?.text || `${durationMinutes} phút`,
          distanceText: leg.distance?.text || `${distanceKm} km`,
          overviewPolyline: data.routes[0].overview_polyline?.points,
          decodedPath,
        };
      }
    }

    // Proxy fallback route
    const params = new URLSearchParams();
    if (typeof origin === 'object') {
      params.append('startLat', String(origin.lat));
      params.append('startLng', String(origin.lng));
    } else {
      params.append('origin', String(origin));
    }

    if (typeof destination === 'object') {
      params.append('endLat', String(destination.lat));
      params.append('endLng', String(destination.lng));
    } else {
      params.append('destination', String(destination));
    }

    const proxyRes = await fetch(`/api/route?${params.toString()}`);
    const proxyData = await proxyRes.json();

    if (proxyData && typeof proxyData.distanceKm === 'number' && proxyData.distanceKm > 0) {
      return {
        distanceKm: proxyData.distanceKm,
        distanceMeters: proxyData.distanceMeters || Math.round(proxyData.distanceKm * 1000),
        durationMinutes: proxyData.durationMinutes || 1,
        durationSeconds: proxyData.durationSeconds || (proxyData.durationMinutes || 1) * 60,
        durationText: proxyData.durationText || `${proxyData.durationMinutes || 1} phút`,
        distanceText: proxyData.distanceText || `${proxyData.distanceKm} km`,
        decodedPath: proxyData.routeGeometry || [],
      };
    }

    return null;
  } catch (error) {
    console.error('Goong Direction API Error:', error);
    return null;
  }
}

/**
 * Polyline Decoder (Google / Goong Polyline Algorithm)
 */
export function decodeGoongPolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

/**
 * 4. FARE CALCULATION: D.GO 247 Driver Service Pricing Rule (Bắc Ninh)
 * - First 2km base fare: 100,000 VNĐ
 * - Subsequent km: 15,000 VNĐ/km
 * - Night surcharge (22:00 - 05:00): +20%
 */
export function calculateGoongDriverFare(
  distanceKm: number,
  isNightTime: boolean = false
): {
  basePrice: number;
  perKmPrice: number;
  totalPrice: number;
  nightSurcharge: number;
} {
  if (distanceKm <= 0) {
    return { basePrice: 0, perKmPrice: 0, totalPrice: 0, nightSurcharge: 0 };
  }

  const BASE_PRICE = 100000; // First 2km base fee: 100,000 VND
  const BASE_KM = 2;
  const KM_RATE = 15000; // 15,000 VND per additional km

  let basePrice = BASE_PRICE;
  let additionalKmPrice = 0;

  if (distanceKm > BASE_KM) {
    const extraKm = distanceKm - BASE_KM;
    additionalKmPrice = Math.ceil(extraKm) * KM_RATE;
  }

  let subtotal = basePrice + additionalKmPrice;
  let nightSurcharge = 0;

  if (isNightTime) {
    nightSurcharge = Math.round(subtotal * 0.2); // 20% night surcharge
  }

  const totalPrice = subtotal + nightSurcharge;

  return {
    basePrice,
    perKmPrice: additionalKmPrice,
    nightSurcharge,
    totalPrice,
  };
}

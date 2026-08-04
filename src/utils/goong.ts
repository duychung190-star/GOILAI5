/**
 * Goong Maps API Utility Module for D.GO 247
 * Provides integration with Goong.io APIs:
 * - Place AutoComplete (rsapi.goong.io/Place/AutoComplete)
 * - Place Detail (rsapi.goong.io/Place/Detail)
 * - Direction & Driving Route (rsapi.goong.io/Direction)
 * - Reverse Geocoding (rsapi.goong.io/Geocode)
 * - Fare Calculation based on exact Goong road distance
 */

export const GOONG_API_KEY_AUTOCOMPLETE = 'rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut';
export const GOONG_API_KEY_DIRECTION = 'rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut';

export const GOONG_API_KEY =
  (import.meta.env.VITE_GOONG_API_KEY as string) ||
  GOONG_API_KEY_AUTOCOMPLETE;

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
  apiKey: string = GOONG_API_KEY_AUTOCOMPLETE
): Promise<string> {
  try {
    if (apiKey) {
      const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${apiKey}`;
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
 * Calls: https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY_AUTOCOMPLETE}&input=${text}
 */
export async function autoCompleteGoong(
  input: string,
  apiKey: string = GOONG_API_KEY_AUTOCOMPLETE,
  centerLat: number = BAC_NINH_CENTER.lat,
  centerLng: number = BAC_NINH_CENTER.lng
): Promise<GoongAutoCompletePrediction[]> {
  if (!input || input.trim().length === 0) return [];

  const cleanInput = input.trim();
  try {
    if (apiKey) {
      const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(
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
 * 2b. PLACE DETAIL: Get exact Lat, Lng coordinates when a suggestion is clicked
 * Calls: https://rsapi.goong.io/Place/Detail?place_id=${place_id}&api_key=${GOONG_API_KEY_AUTOCOMPLETE}
 */
export async function getPlaceDetailGoong(
  placeId: string,
  apiKey: string = GOONG_API_KEY_AUTOCOMPLETE,
  fallbackAddress?: string
): Promise<GoongPlaceDetailResult | null> {
  try {
    if (apiKey && placeId) {
      const url = `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${apiKey}`;
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
 * 3. DIRECTION API: Extract exact road distance (km) & duration (mins) from Goong Map
 * Calls: https://rsapi.goong.io/Direction?origin=${lat1},${lng1}&destination=${lat2},${lng2}&vehicle=car&api_key=${GOONG_API_KEY_DIRECTION}
 */
export async function getDirectionsGoong(
  origin: GoongLocation | string,
  destination: GoongLocation | string,
  vehicle: 'car' | 'bike' | 'taxi' | 'truck' = 'car',
  apiKey: string = GOONG_API_KEY_DIRECTION
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
      const url = `https://rsapi.goong.io/Direction?origin=${encodeURIComponent(
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
 * 4. FARE CALCULATION: D.GO 247 Driver Service Pricing Rule
 * - 1st km base fare: 220,000 VNĐ
 * - Before 22:00: +10,000 VNĐ / km for 2nd km onwards
 * - After 22:00 (22:00 - 05:00): +15,000 VNĐ / km for 2nd km onwards
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

  const BASE_PRICE = 220000; // First 1km base fee: 220,000 VND
  const ratePerKm = isNightTime ? 15000 : 10000;

  let extraKmPrice = 0;
  if (distanceKm > 1) {
    extraKmPrice = Math.round((distanceKm - 1) * ratePerKm);
  }

  const totalPrice = BASE_PRICE + extraKmPrice;

  return {
    basePrice: BASE_PRICE,
    perKmPrice: extraKmPrice,
    nightSurcharge: 0,
    totalPrice,
  };
}

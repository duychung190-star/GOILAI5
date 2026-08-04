import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory database of bookings (for demonstration & dispatcher view)
const bookingsStore: any[] = [];

// Telegram Bot details
const TELEGRAM_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "8182785112:AAEO1WlI59qkaCDR1OuO00z2No6cTwk4acE").trim();
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || "-1003936078147").trim();

// Helper function to send Telegram notification
const sendTelegramNotification = async (bookingData: any) => {
  try {
    const formattedPrice = typeof bookingData.totalPrice === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalPrice || 0)
      : (bookingData.totalPrice || '0 ₫');

    const name = bookingData.customerName || bookingData.name || 'Khách hàng';
    const phone = bookingData.customerPhone || bookingData.phone || '';
    const pickup = bookingData.pickupAddress || bookingData.pickup || '';
    const dropoff = bookingData.destinationAddress || bookingData.dropoff || '';

    let text = `🚗 CÓ ĐƠN ĐẶT XE MỚI!\n` +
      `Khách: ${name} - ${phone}\n` +
      `Đón: ${pickup}\n` +
      `Đến: ${dropoff}\n` +
      `Tổng tiền: ${formattedPrice}`;

    if (bookingData.vehicleType) {
      text += `\nLoại xe: ${bookingData.vehicleType}`;
    }
    if (bookingData.distanceKm) {
      text += `\nKhoảng cách: ${bookingData.distanceKm} km`;
    }
    if (bookingData.noteForDriver) {
      text += `\nGhi chú: ${bookingData.noteForDriver}`;
    }

    // Determine target chat ID options
    let targetChatId = TELEGRAM_CHAT_ID;
    const isNumeric = /^-?\d+$/.test(targetChatId);
    const startsWithAt = targetChatId.startsWith('@');

    const chatCandidates: string[] = [targetChatId];
    if (!isNumeric && !startsWithAt && targetChatId.trim().length > 0) {
      // Add candidate with @ prefix if it's a channel/username
      const channelHandle = `@${targetChatId.replace(/\s+/g, '')}`;
      if (!chatCandidates.includes(channelHandle)) {
        chatCandidates.push(channelHandle);
      }
    }

    let lastResult: any = { ok: false };

    for (const cid of chatCandidates) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: cid,
            text: text
          }),
        });

        const resJson = await response.json();
        console.log(`Telegram API send attempt with chat_id="${cid}" result:`, resJson);

        if (resJson && resJson.ok) {
          return resJson;
        }
        lastResult = resJson;
      } catch (err) {
        console.error(`Attempt failed for chat_id=${cid}:`, err);
      }
    }

    return lastResult;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return { ok: false, error: String(error) };
  }
};

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "D.GO - Gọi Lái 247" });
});

// Create new booking
app.post("/api/booking", async (req, res) => {
  try {
    const bookingData = req.body;
    bookingData.id = bookingData.id || `DGO-${Date.now().toString().slice(-6)}`;
    bookingData.createdAt = Date.now();
    bookingData.status = bookingData.status || "PENDING";

    bookingsStore.unshift(bookingData);

    // Keep store capped at 100 items
    if (bookingsStore.length > 100) {
      bookingsStore.pop();
    }

    // Trigger Telegram notification
    const telegramResult = await sendTelegramNotification(bookingData);

    res.json({
      success: true,
      booking: bookingData,
      telegram: telegramResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all bookings
app.get("/api/bookings", (req, res) => {
  res.json({ success: true, bookings: bookingsStore });
});

// Update booking status
app.patch("/api/booking/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = bookingsStore.find(b => b.id === id);
  if (booking) {
    booking.status = status;
    res.json({ success: true, booking });
  } else {
    res.status(404).json({ success: false, message: "Booking not found" });
  }
});

// Helper to decode Google Maps overview_polyline string into Lat/Lng coordinate tuples
function decodeGooglePolyline(encoded: string): [number, number][] {
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
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Helper to format Nominatim response into a clean, human-readable Vietnamese address
function formatNominatimAddress(data: any): string {
  if (!data || typeof data !== 'object') return '';
  const addr = data.address;
  if (!addr) {
    let name = data.display_name || '';
    return name.replace(/, \d{5,6}/g, '').replace(/, Việt Nam$/gi, '').trim();
  }

  const parts: string[] = [];

  // 1. POI / Building / Amenity name
  const poi = addr.amenity || addr.building || addr.shop || addr.office || addr.tourism || addr.historic || addr.leisure || addr.hospital || addr.school || addr.hotel;
  
  // 2. House number & Street
  const house = addr.house_number || '';
  const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || '';

  if (poi && poi.trim().length > 0) {
    parts.push(poi.trim());
  }

  if (house && road) {
    parts.push(`Số ${house} ${road}`.trim());
  } else if (road) {
    parts.push(road.trim());
  } else if (house) {
    parts.push(`Số ${house}`.trim());
  }

  // 3. Ward / Suburb / Quarter / Village
  const wardRaw = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.subdistrict || addr.hamlet || addr.residential || '';
  if (wardRaw && wardRaw.trim().length > 0) {
    const ward = wardRaw.trim();
    if (!/^(Phường|Xã|Thị trấn)/i.test(ward)) {
      parts.push(`Phường ${ward}`);
    } else {
      parts.push(ward);
    }
  }

  // 4. District / County / City District
  const districtRaw = addr.city_district || addr.district || addr.county || addr.town || '';
  if (districtRaw && districtRaw.trim().length > 0) {
    const district = districtRaw.trim();
    if (!/^(Quận|Huyện|Thị xã|Thành phố)/i.test(district)) {
      parts.push(`Quận ${district}`);
    } else {
      parts.push(district);
    }
  }

  // 5. City / Province / State
  const cityRaw = addr.city || addr.state || addr.province || '';
  if (cityRaw && cityRaw.trim().length > 0) {
    const city = cityRaw.trim();
    parts.push(city);
  }

  if (parts.length >= 2) {
    return parts.join(', ');
  }

  // If parsed parts are too short, clean up display_name
  let displayName = data.display_name || '';
  displayName = displayName
    .replace(/, \d{5,6}/g, '')
    .replace(/, Việt Nam$/gi, '')
    .trim();

  return displayName || parts.join(', ') || '';
}

// Proxy route for Places Autocomplete and Geocoding (search places in Vietnam with Goong API primary)
app.get("/api/geocode/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) return res.json([]);

    const cleanQuery = query.trim();
    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Maps AutoComplete API (centered on Bac Ninh / Northern VN: 21.1861, 106.0763)
    if (goongApiKey) {
      try {
        const goongAutoUrl = `https://rsapi.goong.io/Place/AutoComplete?api_key=${goongApiKey}&input=${encodeURIComponent(cleanQuery)}&location=21.1861,106.0763&radius=50000&more_compound=true`;
        const goongRes = await fetch(goongAutoUrl);
        const goongData = await goongRes.json();

        if (goongData.status === 'OK' && Array.isArray(goongData.predictions) && goongData.predictions.length > 0) {
          const formatted = goongData.predictions.slice(0, 8).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.description,
            source: 'goong_autocomplete'
          }));
          return res.json(formatted);
        }

        // 2. Try Goong Geocode API if AutoComplete returned 0 predictions
        const goongGeoUrl = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(cleanQuery)}&api_key=${goongApiKey}`;
        const goongGeoRes = await fetch(goongGeoUrl);
        const goongGeoData = await goongGeoRes.json();

        if (goongGeoData.status === 'OK' && Array.isArray(goongGeoData.results) && goongGeoData.results.length > 0) {
          const formatted = goongGeoData.results.slice(0, 8).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.formatted_address,
            lat: item.geometry?.location?.lat,
            lon: item.geometry?.location?.lng,
            source: 'goong_geocode'
          }));
          return res.json(formatted);
        }
      } catch (goongErr) {
        console.warn('Goong Maps search error, trying Google/OSM fallbacks:', goongErr);
      }
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;
    if (googleApiKey) {
      try {
        // 1. Try Google Places Text Search API for places, POIs, streets, airports, stations
        const gPlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(cleanQuery)}&region=vn&language=vi&key=${googleApiKey}`;
        const gRes = await fetch(gPlacesUrl);
        const gData = await gRes.json();
        if (gData.status === 'OK' && gData.results && gData.results.length > 0) {
          const formatted = gData.results.slice(0, 6).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.name && !item.formatted_address.includes(item.name) 
              ? `${item.name}, ${item.formatted_address}` 
              : item.formatted_address,
            lat: item.geometry?.location?.lat,
            lon: item.geometry?.location?.lng,
            source: 'google_places'
          }));
          return res.json(formatted);
        }

        // 2. Try Google Places Autocomplete API
        const gAutoUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(cleanQuery)}&components=country:vn&language=vi&key=${googleApiKey}`;
        const gAutoRes = await fetch(gAutoUrl);
        const gAutoData = await gAutoRes.json();
        if (gAutoData.status === 'OK' && gAutoData.predictions && gAutoData.predictions.length > 0) {
          const formatted = gAutoData.predictions.slice(0, 6).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.description,
            source: 'google_autocomplete'
          }));
          return res.json(formatted);
        }

        // 3. Fallback to Google Geocoding API
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanQuery)}&components=country:VN&key=${googleApiKey}&language=vi`;
        const gGeoRes = await fetch(gUrl);
        const gGeoData = await gGeoRes.json();
        if (gGeoData.status === 'OK' && gGeoData.results && gGeoData.results.length > 0) {
          const formatted = gGeoData.results.slice(0, 6).map((item: any, idx: number) => ({
            place_id: item.place_id || idx,
            display_name: item.formatted_address,
            lat: item.geometry?.location?.lat,
            lon: item.geometry?.location?.lng,
            source: 'google_geocode'
          }));
          return res.json(formatted);
        }
      } catch (gErr) {
        console.warn('Google Maps Places search fallback:', gErr);
      }
    }

    // Primary Fallback: OpenStreetMap Nominatim search
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=vn&limit=6&addressdetails=1&accept-language=vi`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DGO-GoiLai247-App/1.0 (contact@dgo247.vn)',
          'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => {
            const customAddr = formatNominatimAddress(item);
            return {
              place_id: item.place_id,
              display_name: customAddr || item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              source: 'nominatim'
            };
          });
          return res.json(formatted);
        }
      }
    } catch (nomErr) {
      console.warn('Nominatim search failed:', nomErr);
    }

    // Secondary Fallback: Photon API search for Vietnam bounding box
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6&lang=vi&bbox=102,8.5,109.5,23.5`;
      const pRes = await fetch(photonUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData?.features && Array.isArray(pData.features) && pData.features.length > 0) {
          const formatted = pData.features.map((feat: any) => {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [105.8542, 21.0285];
            const nameParts = [props.name, props.street, props.district, props.city, props.state].filter(Boolean);
            return {
              place_id: props.osm_id || Math.random().toString(),
              display_name: nameParts.length > 0 ? nameParts.join(', ') : cleanQuery,
              lat: coords[1],
              lon: coords[0],
              source: 'photon'
            };
          });
          return res.json(formatted);
        }
      }
    } catch (pErr) {
      console.warn('Photon fallback search failed:', pErr);
    }

    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for Place Details (retrieve lat/lng by place_id using Goong API primary)
app.get("/api/places/details", async (req, res) => {
  try {
    const { place_id, address, q } = req.query;
    const searchAddress = (address || q || '').toString();
    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Place Detail API
    if (goongApiKey && place_id) {
      try {
        const goongDetailUrl = `https://rsapi.goong.io/Place/Detail?place_id=${place_id}&api_key=${goongApiKey}`;
        const goongRes = await fetch(goongDetailUrl);
        const goongData = await goongRes.json();

        if (goongData.status === 'OK' && goongData.result) {
          const result = goongData.result;
          return res.json({
            place_id: result.place_id || place_id,
            display_name: result.formatted_address || result.name,
            lat: result.geometry?.location?.lat,
            lng: result.geometry?.location?.lng,
            source: 'goong_details'
          });
        }
      } catch (goongErr) {
        console.warn('Goong Place Detail API failed:', goongErr);
      }
    }

    // 2. Try Goong Geocode search if searchAddress is present and place_id lookup failed
    if (goongApiKey && searchAddress) {
      try {
        const goongGeoUrl = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(searchAddress)}&api_key=${goongApiKey}`;
        const goongGeoRes = await fetch(goongGeoUrl);
        const goongGeoData = await goongGeoRes.json();

        if (goongGeoData.status === 'OK' && Array.isArray(goongGeoData.results) && goongGeoData.results.length > 0) {
          const first = goongGeoData.results[0];
          return res.json({
            place_id: first.place_id || place_id,
            display_name: first.formatted_address || searchAddress,
            lat: first.geometry?.location?.lat,
            lng: first.geometry?.location?.lng,
            source: 'goong_geocode_details'
          });
        }
      } catch (goongGeoErr) {
        console.warn('Goong Geocode fallback details failed:', goongGeoErr);
      }
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;
    if (googleApiKey && place_id) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,geometry&language=vi&key=${googleApiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.result) {
          const result = data.result;
          return res.json({
            place_id,
            display_name: result.name && !result.formatted_address.includes(result.name)
              ? `${result.name}, ${result.formatted_address}`
              : result.formatted_address,
            lat: result.geometry?.location?.lat,
            lng: result.geometry?.location?.lng,
            source: 'google_details'
          });
        }
      } catch (gErr) {
        console.warn('Google place details error:', gErr);
      }
    }

    // Fallback: Geocode searchAddress using OpenStreetMap Nominatim
    if (searchAddress) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&countrycodes=vn&limit=1&addressdetails=1&accept-language=vi`;
        const nomRes = await fetch(nomUrl, {
          headers: {
            'User-Agent': 'DGO-GoiLai247-App/1.0 (contact@dgo247.vn)',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
          }
        });
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData) && nomData.length > 0) {
            const first = nomData[0];
            return res.json({
              place_id: first.place_id || place_id,
              display_name: formatNominatimAddress(first) || searchAddress,
              lat: parseFloat(first.lat),
              lng: parseFloat(first.lon),
              source: 'nominatim_details'
            });
          }
        }
      } catch (nomErr) {
        console.warn('Nominatim details geocoding failed:', nomErr);
      }
    }

    res.status(404).json({ error: "Place details not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for Reverse Geocoding (lat, lng -> address string using Goong API primary)
app.get("/api/geocode/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Maps Geocode Reverse API
    if (goongApiKey) {
      try {
        const goongReverseUrl = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${goongApiKey}`;
        const goongRes = await fetch(goongReverseUrl);
        const goongData = await goongRes.json();

        if (goongData.status === 'OK' && Array.isArray(goongData.results) && goongData.results.length > 0) {
          let formattedAddress = goongData.results[0].formatted_address || '';
          formattedAddress = formattedAddress.replace(/, Việt Nam$/gi, '').trim();
          return res.json({
            display_name: formattedAddress,
            source: 'goong_reverse',
            raw: goongData.results[0]
          });
        }
      } catch (goongErr) {
        console.warn('Goong Maps reverse geocoding error:', goongErr);
      }
    }

    // 2. Try Google Maps Geocoding API if key is set
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;
    if (googleApiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&language=vi`;
        const gRes = await fetch(googleUrl);
        const gData = await gRes.json();
        if (gData.status === 'OK' && gData.results && gData.results.length > 0) {
          let formattedAddress = gData.results[0].formatted_address || '';
          formattedAddress = formattedAddress.replace(/, Việt Nam$/gi, '').trim();
          return res.json({
            display_name: formattedAddress,
            source: 'google',
            raw: gData.results[0]
          });
        }
      } catch (gErr) {
        console.warn('Google Maps reverse geocoding failed:', gErr);
      }
    }

    // 3. Try Nominatim OpenStreetMap with Vietnamese language headers
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DGO-GoiLai247-App/1.0 (contact@dgo247.vn)',
          'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && (data.address || data.display_name)) {
          const formattedAddress = formatNominatimAddress(data);
          return res.json({
            display_name: formattedAddress || data.display_name,
            address: data.address,
            source: 'nominatim'
          });
        }
      }
    } catch (nomErr) {
      console.warn('Nominatim reverse geocoding failed:', nomErr);
    }

    // 4. Fallback to BigDataCloud Reverse Geocode
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`;
      const bdcRes = await fetch(bdcUrl);
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const parts = [];
        if (bdcData.locality) parts.push(bdcData.locality);
        if (bdcData.city) parts.push(bdcData.city);
        if (bdcData.principalSubdivision) parts.push(bdcData.principalSubdivision);
        if (parts.length > 0) {
          return res.json({
            display_name: parts.join(', '),
            source: 'bigdatacloud'
          });
        }
      }
    } catch (bdcErr) {
      console.warn('BigDataCloud reverse geocoding failed:', bdcErr);
    }

    res.json({
      display_name: `Vị trí tại điểm đón (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`,
      source: 'coords'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for Driving Route & Distance Calculation (Goong Maps Direction API primary with Google & OSRM fallbacks)
app.get("/api/route", async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng, origin, destination } = req.query;
    if ((!startLat || !startLng || !endLat || !endLng) && (!origin || !destination)) {
      return res.status(400).json({ error: "Missing start or end location coordinates/addresses" });
    }

    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Maps Direction API
    if (goongApiKey && startLat && startLng && endLat && endLng) {
      try {
        const goongDirUrl = `https://rsapi.goong.io/Direction?origin=${startLat},${startLng}&destination=${endLat},${endLng}&vehicle=car&api_key=${goongApiKey}`;
        const goongRes = await fetch(goongDirUrl);
        const goongData = await goongRes.json();

        if (goongData.routes && goongData.routes[0] && goongData.routes[0].legs && goongData.routes[0].legs[0]) {
          const leg = goongData.routes[0].legs[0];
          const distanceMeters = leg.distance ? leg.distance.value : 0;
          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
          const durationSeconds = leg.duration ? leg.duration.value : 0;
          const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

          let routeGeometry: [number, number][] = [];
          if (goongData.routes[0].overview_polyline && goongData.routes[0].overview_polyline.points) {
            routeGeometry = decodeGooglePolyline(goongData.routes[0].overview_polyline.points);
          }

          return res.json({
            success: true,
            source: 'goong_directions',
            distanceMeters,
            distanceKm,
            distanceText: leg.distance ? leg.distance.text : `${distanceKm} km`,
            durationSeconds,
            durationMinutes,
            durationText: leg.duration ? leg.duration.text : `${durationMinutes} phút`,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            routeGeometry,
            routes: goongData.routes
          });
        }
      } catch (goongDirErr) {
        console.warn('Goong Direction API failed, trying Google/OSRM fallback:', goongDirErr);
      }
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;

    // 2. Try Google Maps Directions API
    if (googleApiKey) {
      try {
        const originParam = (startLat && startLng) ? `${startLat},${startLng}` : encodeURIComponent(String(origin));
        const destParam = (endLat && endLng) ? `${endLat},${endLng}` : encodeURIComponent(String(destination));
        
        const googleDirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destParam}&mode=driving&language=vi&key=${googleApiKey}`;
        const gRes = await fetch(googleDirUrl);
        const gData = await gRes.json();

        if (gData.status === 'OK' && gData.routes && gData.routes[0] && gData.routes[0].legs && gData.routes[0].legs[0]) {
          const leg = gData.routes[0].legs[0];
          const distanceMeters = leg.distance ? leg.distance.value : 0;
          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
          const durationSeconds = leg.duration ? leg.duration.value : 0;
          const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

          let routeGeometry: [number, number][] = [];
          if (gData.routes[0].overview_polyline && gData.routes[0].overview_polyline.points) {
            routeGeometry = decodeGooglePolyline(gData.routes[0].overview_polyline.points);
          }

          return res.json({
            success: true,
            source: 'google_directions',
            distanceMeters,
            distanceKm,
            distanceText: leg.distance ? leg.distance.text : `${distanceKm} km`,
            durationSeconds,
            durationMinutes,
            durationText: leg.duration ? leg.duration.text : `${durationMinutes} phút`,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            routeGeometry,
            routes: gData.routes
          });
        }
      } catch (gErr) {
        console.warn('Google Directions API failed, trying OSRM fallback:', gErr);
      }
    }

    // 3. Fallback to OSRM Driving Route API
    if (startLat && startLng && endLat && endLng) {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distanceMeters = route.distance || 0;
        const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
        const durationSeconds = route.duration || 0;
        const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

        let routeGeometry: [number, number][] = [];
        if (route.geometry && Array.isArray(route.geometry.coordinates)) {
          routeGeometry = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        }

        return res.json({
          success: true,
          source: 'osrm',
          distanceMeters,
          distanceKm,
          distanceText: `${distanceKm} km`,
          durationSeconds,
          durationMinutes,
          durationText: `${durationMinutes} phút`,
          routeGeometry,
          routes: data.routes
        });
      }

      return res.json(data);
    }

    res.status(400).json({ error: "Could not calculate driving distance with given parameters" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`D.GO - Gọi Lái 247 server running on http://localhost:${PORT}`);
  });
}

startServer();

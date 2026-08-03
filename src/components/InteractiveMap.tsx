import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationPoint } from '../types';
import { MapPin, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  pickup: LocationPoint | null;
  destination: LocationPoint | null;
  routeGeometry?: [number, number][] | null;
  isCalculatingRoute?: boolean;
  onSelectMapLocation?: (lat: number, lng: number, type: 'pickup' | 'destination') => void;
  targetMode?: 'pickup' | 'destination';
}

// Fix standard Leaflet default icon URL issues with bundling
const pickupIcon = L.divIcon({
  className: 'custom-leaflet-pickup-marker',
  html: `<div style="background-color: #10B981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
          <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
        </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const destinationIcon = L.divIcon({
  className: 'custom-leaflet-destination-marker',
  html: `<div style="background-color: #EF4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
          <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
        </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickup,
  destination,
  routeGeometry,
  isCalculatingRoute,
  onSelectMapLocation,
  targetMode = 'pickup'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Default initial center: Hanoi, Vietnam coordinates
  const defaultCenter = [21.028511, 105.804817];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter as [number, number],
        zoom: 13,
        zoomControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | D.GO - Gọi Lái 247',
        maxZoom: 19,
      }).addTo(map);

      // Handle Map Click to set position
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onSelectMapLocation) {
          onSelectMapLocation(e.latlng.lat, e.latlng.lng, targetMode);
        }
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Markers and Route Polyline whenever pickup, destination, or routeGeometry changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers & route
    if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current);
    if (destinationMarkerRef.current) map.removeLayer(destinationMarkerRef.current);
    if (routePolylineRef.current) map.removeLayer(routePolylineRef.current);

    const bounds: L.LatLngExpression[] = [];

    // Add Pickup Marker
    if (pickup && pickup.lat && pickup.lng) {
      const pickupLatLng: [number, number] = [pickup.lat, pickup.lng];
      pickupMarkerRef.current = L.marker(pickupLatLng, { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<b>Điểm đón:</b><br/>${pickup.address || 'Vị trí điểm đón'}`);
      bounds.push(pickupLatLng);
    }

    // Add Destination Marker
    if (destination && destination.lat && destination.lng) {
      const destLatLng: [number, number] = [destination.lat, destination.lng];
      destinationMarkerRef.current = L.marker(destLatLng, { icon: destinationIcon })
        .addTo(map)
        .bindPopup(`<b>Điểm đến:</b><br/>${destination.address || 'Vị trí điểm đến'}`);
      bounds.push(destLatLng);
    }

    // Render driving route
    if (routeGeometry && routeGeometry.length > 0) {
      // Draw actual driving route polyline along real roads in blue
      routePolylineRef.current = L.polyline(routeGeometry, {
        color: '#2563EB',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Add route geometry points to bounds to ensure complete route fits on screen
      routeGeometry.forEach(pt => bounds.push(pt));

      if (bounds.length > 0) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [45, 45], maxZoom: 16 });
      }
    } else if (pickup && pickup.lat && pickup.lng && destination && destination.lat && destination.lng) {
      // Fallback straight line while route is calculating
      const latlngs: [number, number][] = [
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      ];

      routePolylineRef.current = L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);

      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    } else if (bounds.length > 0) {
      map.setView(bounds[0], 14);
    }
  }, [pickup, destination, routeGeometry]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      
      {/* Container element for Leaflet Map */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[320px]" />

      {/* Map Action Banner overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 shadow-md flex items-center gap-1.5 pointer-events-none">
        {isCalculatingRoute ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-700 font-semibold">Đang tính tuyến đường ô tô...</span>
          </>
        ) : (
          <>
            <Navigation className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Click bản đồ để chọn vị trí</span>
          </>
        )}
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block"></span>
          <span className="font-semibold text-slate-800">Điểm đón:</span>
          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-[200px]">
            {pickup?.address ? pickup.address.split(',')[0] : 'Chưa chọn'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-white inline-block"></span>
          <span className="font-semibold text-slate-800">Điểm đến:</span>
          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-[200px]">
            {destination?.address ? destination.address.split(',')[0] : 'Chưa chọn'}
          </span>
        </div>
      </div>

    </div>
  );
};

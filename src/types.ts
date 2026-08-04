export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
}

export type VehicleTypeOption = 
  | 'Ô tô 4-7 chỗ'
  | 'Xe máy'
  | 'Xe sang / Bán tải'
  | 'Thuê theo giờ';

export interface VatDetails {
  companyName: string;
  taxCode: string;
  companyAddress: string;
  email: string;
}

export interface PriceBreakdown {
  basePrice: number;
  nightSurcharge: number;
  nightPercent: number; // 0, 10, or 20
  vatAmount: number;
  totalBeforeVat: number;
  totalPrice: number;
  distanceKm: number;
  estimatedMinutes: number;
  isHourly: boolean;
  hourlyHours: number;
}

export interface DriverRating {
  stars: number;
  review?: string;
  tags?: string[];
  driverName?: string;
  createdAt: number;
}

export interface BookingRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  distanceKm: number;
  totalPrice: number;
  vehicleType: VehicleTypeOption;
  noteForDriver: string;
  scheduledTime: number; // Timestamp or scheduled pickup date ms
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  needVat: boolean;
  vatDetails?: VatDetails;
  breakdown: PriceBreakdown;
  rating?: DriverRating;
}

export interface SearchSuggestion {
  place_id: string | number;
  display_name: string;
  lat: number;
  lng: number;
}

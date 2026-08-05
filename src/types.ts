export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
}

export type VehicleTypeOption = 
  | 'Ô tô / Xe máy'
  | 'Xe Sang'
  | 'Thuê theo giờ (Ô tô / Xe máy)'
  | 'Thuê theo giờ (Xe Sang)'
  | 'Thuê theo ngày (Ô tô / Xe máy)'
  | 'Thuê theo ngày (Xe Sang)';

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
  isDaily?: boolean;
  dailyDays?: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  token?: string;
  agreedTerms?: boolean;
  tier: 'MỚI' | 'THÂN THIẾT' | 'VIP' | 'KIM CƯƠNG';
  tripsCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyScorePercent: number; // Tỷ lệ trung thành (VD: 92%)
  avatarUrl?: string;
  createdAt: number;
}

export interface DriverRating {
  stars: number;
  review?: string;
  tags?: string[];
  driverName?: string;
  customerName?: string;
  customerPhone?: string;
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
  isNewCustomer?: boolean;
  totalOrdersCount?: number;
}

export interface SearchSuggestion {
  place_id: string | number;
  display_name: string;
  lat: number;
  lng: number;
}

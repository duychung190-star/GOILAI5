export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
}

export type VehicleTypeOption = 
  | 'Ô tô / Xe máy'
  | 'Dịch vụ Luxury'
  | 'Thuê theo giờ (Ô tô / Xe máy)'
  | 'Thuê theo giờ (Dịch vụ Luxury)'
  | 'Thuê theo ngày (Ô tô / Xe máy)'
  | 'Thuê theo ngày (Dịch vụ Luxury)';

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
  originalPrice: number;    // Giá gốc (chưa giảm)
  discountPercent: number;  // Tỷ lệ % giảm (ví dụ: 10, 20)
  discountAmount: number;   // Số tiền giảm
  totalPrice: number;       // Giá khách phải thanh toán (originalPrice - discountAmount)
  promoCode?: string;       // Mã giảm giá áp dụng (e.g., GOILAI247, VIP20, DGO50K)
  discountCodeName?: string;// Tên hiển thị của voucher
  promoMessage?: string;    // Thông báo thành công khi áp mã
  promoError?: string;      // Thông báo lỗi khi mã không hợp lệ
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
  status: 'PENDING' | 'ACCEPTED' | 'DRIVER_EN_ROUTE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverAssigned?: string;
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

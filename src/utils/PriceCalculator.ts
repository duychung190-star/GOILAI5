import { PriceBreakdown, VehicleTypeOption } from '../types';

export class PriceCalculator {
  /**
   * Tính khoảng cách đường bộ dự kiến (Driving Distance) dựa trên lộ trình giao thông thực tế.
   * Ưu tiên số km trả về trực tiếp từ Google Maps Directions API (travelMode: 'DRIVING').
   */
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineDistance = R * c;

    // Áp dụng hệ số chuyển đổi đường bộ thực tế (Road Driving Factor ~1.35x) thay vì đường chim bay
    const estimatedDrivingDistance = straightLineDistance * 1.35;

    // Làm tròn 1 chữ số thập phân
    return Math.round(estimatedDrivingDistance * 10) / 10;
  }

  /**
   * Áp dụng bảng giá chuẩn D.GO - Gọi Lái 247
   */
  static calculatePrice(
    distanceKm: number,
    vehicleType: VehicleTypeOption,
    isHourly: boolean = false,
    hourlyHours: number = 3,
    scheduledTimeDate: Date = new Date(),
    needVat: boolean = false,
    roadDurationMinutes: number | null = null
  ): PriceBreakdown {
    let basePrice = 0;

    if (isHourly || vehicleType === 'Thuê theo giờ') {
      const validHours = Math.max(3, hourlyHours);
      if (validHours <= 3) {
        basePrice = 500000; // Combo 3h đầu tiên
      } else {
        basePrice = 500000 + (validHours - 3) * 100000;
      }
    } else {
      // Tính theo số KM
      const dist = Math.max(0, distanceKm);

      if (dist === 0) {
        basePrice = 0;
      } else if (dist <= 5) {
        basePrice = 250000; // 5 km đầu tiên: 250.000 VNĐ
      } else if (dist <= 10) {
        basePrice = 350000; // km thứ 6 đến km thứ 10: 350.000 VNĐ
      } else {
        // Km thứ 11 trở đi: +15.000 VNĐ/km
        const extraKm = Math.ceil(dist - 10);
        basePrice = 350000 + extraKm * 15000;
      }
    }

    // Phụ phí đêm:
    // 23:00 - 23:59 (+10% tổng cước)
    // 00:00 - 05:00 (+20% tổng cước)
    const hours = scheduledTimeDate.getHours();
    let nightPercent = 0;

    if (hours === 23) {
      nightPercent = 10;
    } else if (hours >= 0 && hours <= 5) {
      nightPercent = 20;
    }

    const nightSurcharge = Math.round(basePrice * (nightPercent / 100));
    const totalBeforeVat = basePrice + nightSurcharge;

    let vatAmount = 0;
    if (needVat) {
      vatAmount = Math.round(totalBeforeVat * 0.08);
    }

    const totalPrice = totalBeforeVat + vatAmount;

    // Ước tính thời gian di chuyển bằng ô tô
    const estimatedMinutes = isHourly || vehicleType === 'Thuê theo giờ'
      ? hourlyHours * 60
      : (roadDurationMinutes !== null && roadDurationMinutes > 0)
      ? roadDurationMinutes
      : distanceKm > 0
      ? Math.max(5, Math.round((distanceKm / 28) * 60))
      : 0;

    return {
      basePrice,
      nightSurcharge,
      nightPercent,
      vatAmount,
      totalBeforeVat,
      totalPrice,
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedMinutes,
      isHourly: isHourly || vehicleType === 'Thuê theo giờ',
      hourlyHours
    };
  }

  /**
   * Format số tiền sang định dạng VNĐ chuẩn
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  }
}

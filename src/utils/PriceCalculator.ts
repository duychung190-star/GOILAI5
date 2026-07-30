import { PriceBreakdown, VehicleTypeOption } from '../types';

export class PriceCalculator {
  /**
   * Tính khoảng cách giữa 2 điểm tọa độ GPS bằng công thức Haversine (tương tự Location.distanceTo)
   * Trả về số KM (làm tròn 1 chữ số thập phân)
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
    const distance = R * c;

    // Làm tròn 1 chữ số thập phân
    return Math.round(distance * 10) / 10;
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
    needVat: boolean = false
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
      } else if (dist <= 3) {
        basePrice = 238000;
      } else if (dist <= 4) {
        basePrice = 254000;
      } else if (dist <= 5) {
        basePrice = 270000;
      } else if (dist <= 6) {
        basePrice = 286000;
      } else if (dist <= 7) {
        basePrice = 302000;
      } else if (dist <= 8) {
        basePrice = 318000;
      } else if (dist <= 9) {
        basePrice = 334000;
      } else if (dist <= 10) {
        basePrice = 350000;
      } else if (dist <= 11) {
        basePrice = 365000;
      } else if (dist <= 12) {
        basePrice = 380000;
      } else if (dist <= 13) {
        basePrice = 395000;
      } else if (dist <= 14) {
        basePrice = 410000;
      } else if (dist <= 15) {
        basePrice = 425000;
      } else if (dist <= 16) {
        basePrice = 440000;
      } else if (dist <= 17) {
        basePrice = 455000;
      } else if (dist <= 18) {
        basePrice = 470000;
      } else if (dist <= 19) {
        basePrice = 485000;
      } else if (dist <= 20) {
        basePrice = 500000;
      } else if (dist <= 21) {
        basePrice = 513000;
      } else if (dist <= 22) {
        basePrice = 526000;
      } else if (dist <= 23) {
        basePrice = 539000;
      } else if (dist <= 24) {
        basePrice = 552000;
      } else if (dist <= 25) {
        basePrice = 565000;
      } else {
        // Từ km thứ 26 trở đi: 565,000 + 12.000đ/km
        const extraKm = Math.ceil(dist - 25);
        basePrice = 565000 + extraKm * 12000;
      }
    }

    // Phụ phí đêm:
    // 23:00 - 23:59 (+10%)
    // 00:00 - 05:00 (+20%)
    const hours = scheduledTimeDate.getHours();
    let nightPercent = 0;

    if (hours === 23) {
      nightPercent = 10;
    } else if (hours >= 0 && hours < 5) {
      nightPercent = 20;
    }

    const nightSurcharge = Math.round(basePrice * (nightPercent / 100));
    const totalBeforeVat = basePrice + nightSurcharge;

    let vatAmount = 0;
    if (needVat) {
      vatAmount = Math.round(totalBeforeVat * 0.08);
    }

    const totalPrice = totalBeforeVat + vatAmount;

    // Ước tính thời gian di chuyển (trung bình 25-30km/h trong thành phố)
    const estimatedMinutes = isHourly || vehicleType === 'Thuê theo giờ'
      ? hourlyHours * 60
      : distanceKm > 0
      ? Math.max(8, Math.round((distanceKm / 28) * 60))
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

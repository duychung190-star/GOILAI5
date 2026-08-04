import { PriceBreakdown, VehicleTypeOption } from '../types';

export class PriceCalculator {
  /**
   * Tính khoảng cách đường bộ thực tế (Driving Distance) từ Goong Maps API.
   * Tuyệt đối không tính khoảng cách đường chim bay.
   */
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    // Không dùng công thức haversine/đường chim bay.
    // Việc tính quãng đường đường bộ 100% dùng dữ liệu từ Goong Direction API.
    return 0;
  }

  /**
   * Thuật toán Tính giá D.GO 247 (Cập nhật):
   * 1. Lái hộ theo cuốc (Dựa trên số Km lấy từ Goong Map & Khung giờ):
   *    - Trước 22h: 220.000đ cho km đầu tiên, từ km thứ 2 trở đi +10.000đ/km.
   *    - Sau 22h (22:00 - 04:59): 220.000đ cho km đầu tiên, từ km thứ 2 trở đi +15.000đ/km.
   * 2. Thuê theo giờ (Dựa vào số giờ khách chọn):
   *    - <= 3 giờ: 450.000 VNĐ
   *    - > 3 giờ: 450.000 + ((Số giờ - 3) * 100.000) VNĐ
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

    const currentHour = scheduledTimeDate ? scheduledTimeDate.getHours() : new Date().getHours();
    const isAfter22h = currentHour >= 22 || currentHour < 5;

    if (isHourly || vehicleType === 'Thuê theo giờ') {
      const hours = Math.max(1, hourlyHours);
      if (hours <= 3) {
        basePrice = 450000; // Package <= 3 hours: 450.000 VNĐ
      } else {
        basePrice = 450000 + (hours - 3) * 100000; // Extra hours: +100.000 VNĐ/h
      }
    } else {
      // Lái hộ theo cuốc (Km từ Goong Direction API)
      const dist = Math.max(0, distanceKm);

      if (dist === 0) {
        basePrice = 0;
      } else if (dist <= 1) {
        basePrice = 220000; // 1km đầu tiên: 220.000 VNĐ
      } else {
        // Từ km thứ 2 trở đi:
        // Trước 22h: +10.000đ/km
        // Sau 22h: +15.000đ/km
        const ratePerKm = isAfter22h ? 15000 : 10000;
        basePrice = Math.round(220000 + (dist - 1) * ratePerKm);
      }
    }

    const nightPercent = 0;
    const nightSurcharge = 0;

    const totalBeforeVat = basePrice; // Tạm tính

    let vatAmount = 0;
    if (needVat) {
      vatAmount = Math.round(totalBeforeVat * 0.08);
    }

    const totalPrice = totalBeforeVat + vatAmount;

    // Thời gian di chuyển
    const estimatedMinutes = (isHourly || vehicleType === 'Thuê theo giờ')
      ? hourlyHours * 60
      : (roadDurationMinutes !== null && roadDurationMinutes > 0)
      ? roadDurationMinutes
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


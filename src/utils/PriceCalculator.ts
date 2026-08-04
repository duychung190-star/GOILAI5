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
   * Thuật toán Tính giá D.GO 247:
   * 1. Lái hộ theo cuốc (Dựa trên số Km lấy từ Goong Map):
   *    - Km <= 5km: 250.000 VNĐ
   *    - 5km < Km <= 10km: 350.000 VNĐ
   *    - Km > 10km: 350.000 + ((Khoảng cách - 10) * 15.000) VNĐ
   * 2. Thuê theo giờ (Dựa vào số giờ khách chọn):
   *    - <= 3 giờ: 450.000 VNĐ
   *    - > 3 giờ: 450.000 + ((Số giờ - 3) * 100.000) VNĐ
   * 3. Phụ phí đêm (Dựa trên thời gian thực tế - Realtime trên thiết bị của khách):
   *    - 23:00 - 23:59 (hour === 23): 10% * Phí cơ bản
   *    - 00:00 - 04:59 (hour >= 0 && hour < 5): 20% * Phí cơ bản
   *    - Cộng phụ phí đêm vào Phí cơ bản = Tạm tính
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
      } else if (dist <= 5) {
        basePrice = 250000; // Khoảng cách <= 5km: 250.000 VNĐ
      } else if (dist <= 10) {
        basePrice = 350000; // Khoảng cách > 5km và <= 10km: 350.000 VNĐ
      } else {
        // Khoảng cách > 10km: 350.000 + ((Khoảng cách - 10) * 15.000) VNĐ
        basePrice = Math.round(350000 + (dist - 10) * 15000);
      }
    }

    // Phụ phí đêm (Realtime trên thiết bị khách hoặc giờ đặt hẹn):
    // hour === 23 -> 10%
    // 00:00 - 04:59 (hour >= 0 && hour < 5) -> 20%
    const currentHour = scheduledTimeDate ? scheduledTimeDate.getHours() : new Date().getHours();
    let nightPercent = 0;

    if (currentHour === 23) {
      nightPercent = 10;
    } else if (currentHour >= 0 && currentHour < 5) {
      nightPercent = 20;
    }

    const nightSurcharge = Math.round(basePrice * (nightPercent / 100));
    const totalBeforeVat = basePrice + nightSurcharge; // Tạm tính

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


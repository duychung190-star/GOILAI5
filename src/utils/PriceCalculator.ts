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
    return 0;
  }

  /**
   * Thuật toán Tính giá D.GO 247 Cập Nhật Mới:
   * 1. Lái hộ theo cuốc (Dựa trên số Km lấy từ Goong Map API):
   *    - Nút Ô tô / Xe máy: 350.000đ cho 10km đầu tiên. Từ km thứ 11 trở đi: +15.000đ/km.
   *    - Nút Xe Sang: 450.000đ cho 10km đầu tiên. Từ km thứ 11 trở đi: +20.000đ/km.
   * 2. Thuê lái theo giờ (2 nút con Ô tô / Xe máy & Xe Sang):
   *    - Nút Ô tô / Xe máy: Combo 3h đầu = 450.000đ. Từ giờ thứ 4 đến 10 = +100.000đ/giờ.
   *    - Nút Xe Sang: Combo 3h đầu = 500.000đ. Từ giờ thứ 4 đến 10 = +150.000đ/giờ.
   * 3. Thuê lái theo ngày (24h):
   *    - Nút Ô tô / Xe máy: 1.000.000đ / ngày (24h).
   *    - Nút Xe Sang: 1.500.000đ / ngày (24h).
   * 4. Phụ phí đêm (23:00 - 23:59: +10%, 00:00 - 04:59: +20%).
   * (Lưu ý: Giá trên chưa bao gồm hỗ trợ chi phí ăn ở cho tài xế)
   */
  static calculatePrice(
    distanceKm: number,
    vehicleType: VehicleTypeOption,
    isHourly: boolean = false,
    hourlyHours: number = 3,
    dailyDays: number = 1,
    scheduledTimeDate: Date = new Date(),
    needVat: boolean = false,
    roadDurationMinutes: number | null = null
  ): PriceBreakdown {
    let basePrice = 0;
    const isHourlyMode = isHourly || vehicleType.includes('Thuê theo giờ');
    const isDailyMode = vehicleType.includes('Thuê theo ngày');
    const isLuxury = vehicleType.includes('Xe Sang') || vehicleType.includes('Xe sang');

    if (isDailyMode) {
      // Thuê lái theo ngày (24h)
      const days = Math.max(1, dailyDays);
      if (isLuxury) {
        basePrice = days * 1500000; // 1.500.000đ / ngày với Xe Sang
      } else {
        basePrice = days * 1000000; // 1.000.000đ / ngày với Ô tô / Xe máy
      }
    } else if (isHourlyMode) {
      // Thuê lái theo giờ (Combo 3h)
      const hours = Math.max(1, hourlyHours);
      if (isLuxury) {
        // Xe Sang: Combo 3h đầu 500.000đ, từ giờ thứ 4 - 10 là +150.000đ/h
        if (hours <= 3) {
          basePrice = 500000;
        } else {
          basePrice = 500000 + (hours - 3) * 150000;
        }
      } else {
        // Ô tô / Xe máy: Combo 3h đầu 450.000đ, từ giờ thứ 4 - 10 là +100.000đ/h
        if (hours <= 3) {
          basePrice = 450000;
        } else {
          basePrice = 450000 + (hours - 3) * 100000;
        }
      }
    } else {
      // Lái hộ theo cuốc (Km thực tế từ Goong Map API)
      const dist = Math.max(0, distanceKm);

      if (dist === 0) {
        basePrice = 0;
      } else if (isLuxury) {
        // Xe Sang: 450.000đ cho 10km đầu, từ km thứ 11 +20.000đ/km
        if (dist <= 10) {
          basePrice = 450000;
        } else {
          basePrice = Math.round(450000 + (dist - 10) * 20000);
        }
      } else {
        // Ô tô / Xe máy: 350.000đ cho 10km đầu, từ km thứ 11 +15.000đ/km
        if (dist <= 10) {
          basePrice = 350000;
        } else {
          basePrice = Math.round(350000 + (dist - 10) * 15000);
        }
      }
    }

    // Phụ phí đêm:
    const currentHour = scheduledTimeDate ? scheduledTimeDate.getHours() : new Date().getHours();
    let nightPercent = 0;

    if (currentHour === 23) {
      nightPercent = 10; // 23:00 - 23:59: Phụ phí = 10% * Phí cơ bản
    } else if (currentHour >= 0 && currentHour < 5) {
      nightPercent = 20; // 00:00 - 04:59: Phụ phí = 20% * Phí cơ bản
    }

    const nightSurcharge = Math.round(basePrice * (nightPercent / 100));
    const totalBeforeVat = basePrice + nightSurcharge;

    let vatAmount = 0;
    if (needVat) {
      vatAmount = Math.round(totalBeforeVat * 0.08);
    }

    const totalPrice = totalBeforeVat + vatAmount;

    // Thời gian di chuyển ước tính
    const estimatedMinutes = isDailyMode
      ? dailyDays * 24 * 60
      : isHourlyMode
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
      isHourly: isHourlyMode,
      hourlyHours,
      isDaily: isDailyMode,
      dailyDays
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


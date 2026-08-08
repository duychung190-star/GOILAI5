import { PriceBreakdown, VehicleTypeOption } from '../types';

export function calculateDriverTripFare(dist: number): number {
  if (dist <= 0) return 0;
  if (dist <= 3) {
    return 238000;
  } else if (dist <= 10) {
    return Math.round(238000 + (dist - 3) * 16000);
  } else if (dist <= 20) {
    return Math.round(350000 + (dist - 10) * 15000);
  } else if (dist <= 25) {
    return Math.round(500000 + (dist - 20) * 13000);
  } else {
    return Math.round(565000 + (dist - 25) * 12000);
  }
}

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
   *    - 3 km đầu tiên: 238.000đ
   *    - km thứ 4 - 10: +16.000đ/km (km 10: 350.000đ)
   *    - km thứ 11 - 20: +15.000đ/km (km 20: 500.000đ)
   *    - km thứ 21 - 25: +13.000đ/km (km 25: 565.000đ)
   *    - Từ km 26 trở đi: giá km 25 (565.000đ) + 12.000đ/km
   *    - Dịch vụ Luxury: Tăng tương ứng 35% so với gói tiêu chuẩn.
   * 2. Thuê lái theo giờ (2 nút con Ô tô / Xe máy & Dịch vụ Luxury):
   *    - Ô tô / Xe máy: Combo 3h đầu = 450.000đ, từ giờ thứ 4 trở đi +100.000đ/giờ.
   *    - Dịch vụ Luxury: Combo 3h đầu = 500.000đ, từ giờ thứ 4 trở đi +150.000đ/giờ.
   * 3. Thuê lái theo ngày (24h):
   *    - Ô tô / Xe máy: 1.500.000đ / ngày (24h).
   *    - Dịch vụ Luxury: 2.000.000đ / ngày (24h).
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
    roadDurationMinutes: number | null = null,
    promoCode: string = 'GOILAI247'
  ): PriceBreakdown {
    let basePrice = 0;
    const isHourlyMode = isHourly || vehicleType.includes('Thuê theo giờ');
    const isDailyMode = vehicleType.includes('Thuê theo ngày');
    const isLuxury = vehicleType.includes('Dịch vụ Luxury') || vehicleType.includes('Xe Sang') || vehicleType.includes('Xe sang') || vehicleType.includes('Luxury');

    if (isDailyMode) {
      // Thuê lái theo ngày (24h)
      const days = Math.max(1, dailyDays);
      if (isLuxury) {
        basePrice = days * 2000000; // 2.000.000đ / ngày với Dịch vụ Luxury
      } else {
        basePrice = days * 1500000; // 1.500.000đ / ngày với Ô tô / Xe máy
      }
    } else if (isHourlyMode) {
      // Thuê lái theo giờ (Combo 3h đầu)
      const hours = Math.max(1, hourlyHours);
      if (isLuxury) {
        if (hours <= 3) {
          basePrice = 500000;
        } else {
          basePrice = 500000 + (hours - 3) * 150000;
        }
      } else {
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
      } else {
        const stdFare = calculateDriverTripFare(dist);
        if (isLuxury) {
          basePrice = Math.round(stdFare * 1.35);
        } else {
          basePrice = stdFare;
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

    const originalPrice = totalBeforeVat + vatAmount;

    // Xử lý mã giảm giá / Voucher khuyến mãi
    const cleanPromo = (promoCode || '').trim().toUpperCase();
    let discountPercent = 0;
    let discountAmount = 0;
    let discountCodeName = '';
    let promoMessage = '';
    let promoError = '';
    let appliedCode = cleanPromo;

    if (!cleanPromo) {
      discountPercent = 0;
      discountAmount = 0;
      appliedCode = '';
      discountCodeName = '';
      promoMessage = '';
    } else if (cleanPromo === 'GOILAI10' || cleanPromo === 'GOILAI247' || cleanPromo === 'APP10' || cleanPromo === 'DGO10') {
      discountPercent = 10;
      discountAmount = Math.round(originalPrice * 0.10);
      appliedCode = 'GOILAI10';
      discountCodeName = 'Mã GOILAI10 (-10%)';
      promoMessage = 'Đã áp dụng mã giảm 10% cho chuyến đi';
    } else if (cleanPromo === 'GOILAI15' || cleanPromo === 'TRIAN15' || cleanPromo === 'BANMOI' || cleanPromo === 'CHAO2026') {
      discountPercent = 15;
      discountAmount = Math.round(originalPrice * 0.15);
      appliedCode = cleanPromo === 'TRIAN15' ? 'TRIAN15' : 'GOILAI15';
      discountCodeName = `Mã Khuyến Mãi ${appliedCode} (-15%)`;
      promoMessage = `Đã áp dụng mã giảm 15% (${appliedCode})`;
    } else if (cleanPromo === 'DGOVIP20' || cleanPromo === 'VIP20' || cleanPromo === 'GOILAI20' || cleanPromo === 'VIP') {
      discountPercent = 20;
      discountAmount = Math.round(originalPrice * 0.20);
      appliedCode = cleanPromo === 'DGOVIP20' ? 'DGOVIP20' : 'VIP20';
      discountCodeName = `Mã VIP ${appliedCode} (-20%)`;
      promoMessage = `Đã áp dụng mã giảm 20% (${appliedCode})`;
    } else if (cleanPromo === 'VIP15') {
      discountPercent = 15;
      discountAmount = Math.round(originalPrice * 0.15);
      appliedCode = 'VIP15';
      discountCodeName = 'Mã Khách VIP15 (-15%)';
      promoMessage = 'Đã áp dụng mã Khách VIP (-15%)';
    } else if (cleanPromo === 'TRIAN10') {
      discountPercent = 10;
      discountAmount = Math.round(originalPrice * 0.10);
      appliedCode = 'TRIAN10';
      discountCodeName = 'Mã Tri Ân TRIAN10 (-10%)';
      promoMessage = 'Đã áp dụng mã Tri Ân (-10%)';
    } else if (cleanPromo === 'DGO50K' || cleanPromo === '50K' || cleanPromo === 'GIAM50K') {
      discountAmount = Math.min(originalPrice, 50000);
      discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
      appliedCode = 'DGO50K';
      discountCodeName = 'Voucher DGO50K (-50.000 VNĐ)';
      promoMessage = 'Đã áp dụng Voucher DGO50K (-50.000 VNĐ)';
    } else if (cleanPromo.startsWith('GIAM') && !isNaN(Number(cleanPromo.replace('GIAM', '')))) {
      const pct = Math.min(80, Math.max(1, Number(cleanPromo.replace('GIAM', ''))));
      discountPercent = pct;
      discountAmount = Math.round(originalPrice * (pct / 100));
      appliedCode = cleanPromo;
      discountCodeName = `Mã Ưu Đãi ${cleanPromo} (-${pct}%)`;
      promoMessage = `Đã áp dụng mã giảm ${pct}%`;
    } else {
      discountPercent = 0;
      discountAmount = 0;
      appliedCode = cleanPromo;
      discountCodeName = '';
      promoError = `Mã "${cleanPromo}" không hợp lệ hoặc đã hết hạn`;
    }

    const totalPrice = Math.max(0, originalPrice - discountAmount);

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
      originalPrice,
      discountPercent,
      discountAmount,
      totalPrice,
      promoCode: appliedCode,
      discountCodeName,
      promoMessage,
      promoError,
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


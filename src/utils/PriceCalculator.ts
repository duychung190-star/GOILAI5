import { PriceBreakdown, VehicleTypeOption } from '../types';

/**
 * Tính giá cước theo lượt (Km) - Xe máy / Ô tô tiêu chuẩn:
 * - 10 km đầu tiên: 350.000 VNĐ
 * - Từ km thứ 11 trở đi: +15.000 VNĐ / km
 */
export function calculateDriverTripFare(dist: number): number {
  if (dist <= 0) return 0;
  if (dist <= 10) {
    return 350000;
  }
  return Math.round(350000 + (dist - 10) * 15000);
}

/**
 * Tính giá cước theo lượt (Km) - Dịch vụ Xe sang (Luxury):
 * - 10 km đầu tiên: 450.000 VNĐ
 * - Từ km thứ 11 trở đi: +20.000 VNĐ / km
 */
export function calculateLuxuryTripFare(dist: number): number {
  if (dist <= 0) return 0;
  if (dist <= 10) {
    return 450000;
  }
  return Math.round(450000 + (dist - 10) * 20000);
}

/**
 * Tính giá thuê lái theo giờ:
 * - Xe máy / Ô tô: 500.000 VNĐ / 3h đầu, +150.000 VNĐ / h tiếp theo.
 *   Khóa block 10 tiếng tính lại từ đầu (1 block 10h = 500k + 7 * 150k = 1.550.000đ).
 * - Dịch vụ Xe sang: Tính cộng thêm 20% so với giá thường.
 */
export function calculateHourlyFare(hours: number, isLuxury: boolean = false): number {
  const h = Math.max(1, hours);
  const fullBlocks = Math.floor(h / 10);
  const remainder = h % 10;
  const block10Price = 500000 + 7 * 150000; // 1.550.000 VNĐ cho 1 block 10 tiếng
  
  let remainderPrice = 0;
  if (remainder > 0) {
    if (remainder <= 3) {
      remainderPrice = 500000;
    } else {
      remainderPrice = 500000 + (remainder - 3) * 150000;
    }
  }

  const standardTotal = fullBlocks * block10Price + remainderPrice;
  if (isLuxury) {
    return Math.round(standardTotal * 1.20);
  }
  return standardTotal;
}

export class PriceCalculator {
  /**
   * Phí chờ: 40.000đ / 30 phút
   */
  static WAITING_FEE_PER_30_MIN = 40000;

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
   * 1. Lái hộ theo cuốc (Km thực tế):
   *    - Xe máy / Ô tô: 350.000đ / 10km đầu, từ km 11 trở đi +15.000đ/km.
   *    - Xe sang (Luxury): 450.000đ / 10km đầu, từ km 11 trở đi +20.000đ/km.
   * 2. Phí chờ phát sinh: 40.000đ / 30 phút.
   * 3. Thuê lái theo giờ:
   *    - Xe máy / Ô tô: 500.000đ / 3h đầu, +150.000đ/h tiếp theo, khóa block 10 tiếng tính lại từ đầu.
   *    - Dịch vụ xe sang: tính cộng thêm 20% giá thường.
   * 4. Thuê lái theo ngày 24h:
   *    - Xe máy / Ô tô: 1.500.000đ / ngày (24h).
   *    - Dịch vụ xe sang: 2.000.000đ / ngày (24h).
   * 5. Khách đi theo bảng giá (nhiều điểm / chưa có điểm đến cụ thể):
   *    - Không hiển thị số tiền, chỉ hiển thị mã voucher giảm 10% sau chuyến đi (DGO10).
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
    promoCode: string = 'GOILAI10',
    isAsPerPriceTable: boolean = false
  ): PriceBreakdown {
    // Trường hợp khách chọn dịch vụ đi theo bảng giá (hoặc chưa có điểm đến cụ thể / đi nhiều điểm)
    if (isAsPerPriceTable) {
      return {
        basePrice: 0,
        nightSurcharge: 0,
        nightPercent: 0,
        vatAmount: 0,
        totalBeforeVat: 0,
        originalPrice: 0,
        discountPercent: 10,
        discountAmount: 0,
        totalPrice: 0,
        promoCode: 'DGO10',
        discountCodeName: 'Voucher giảm 10% sau chuyến đi (DGO10)',
        promoMessage: 'Áp dụng mã DGO10 để được giảm 10% tổng cước thực tế sau khi hoàn thành chuyến đi',
        distanceKm: 0,
        estimatedMinutes: 0,
        isHourly: false,
        hourlyHours: 0,
        isDaily: false,
        dailyDays: 0,
        isAsPerPriceTable: true
      };
    }

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
      // Thuê lái theo giờ (500k/3h đầu, +150k/h tiếp theo, block 10h lặp lại, xe sang +20%)
      const hours = Math.max(1, hourlyHours);
      basePrice = calculateHourlyFare(hours, isLuxury);
    } else {
      // Lái hộ theo cuốc (Km thực tế từ Goong Map API)
      const dist = Math.max(0, distanceKm);
      if (dist === 0) {
        basePrice = 0;
      } else {
        if (isLuxury) {
          basePrice = calculateLuxuryTripFare(dist);
        } else {
          basePrice = calculateDriverTripFare(dist);
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
      appliedCode = cleanPromo === 'DGO10' ? 'DGO10' : 'GOILAI10';
      discountCodeName = `Mã ${appliedCode} (-10%)`;
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
      dailyDays,
      isAsPerPriceTable: false
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


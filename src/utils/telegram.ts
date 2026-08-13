export const sendTelegramNotification = async (bookingData: {
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  totalPrice: number | string;
  originalPrice?: number | string;
  discountAmount?: number | string;
  discountPercent?: number;
  promoCode?: string;
  discountCodeName?: string;
  vehicleType?: string;
  distanceKm?: number;
  noteForDriver?: string;
  isNewCustomer?: boolean;
  totalOrdersCount?: number;
}) => {
  const token = "8182785112:AAEO1WlI59qkaCDR1OuO00z2No6cTwk4acE".trim();
  const rawChatId = "-1003936078147".trim();

  const formattedPrice = typeof bookingData.totalPrice === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalPrice)
    : bookingData.totalPrice;

  const originalPriceVal = bookingData.originalPrice;
  const formattedOriginalPrice = typeof originalPriceVal === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPriceVal)
    : originalPriceVal;

  const discountVal = bookingData.discountAmount;
  const formattedDiscount = typeof discountVal === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountVal)
    : discountVal;

  const promoCode = bookingData.promoCode || 'GOILAI247';
  const discountName = bookingData.discountCodeName || 'Mã App GOILAI247 (-10%)';

  let text = `🚗 CÓ ĐƠN ĐẶT XE MỚI!\n`;

  if (bookingData.isNewCustomer) {
    text += `👉 🌱 KHÁCH HÀNG MỚI ĐẶT LẦN ĐẦU\n`;
  } else if (bookingData.totalOrdersCount) {
    text += `👉 🔥 KHÁCH HÀNG CŨ QUAY LẠI (Cuốc thứ ${bookingData.totalOrdersCount})\n`;
  }

  text += `Khách: ${bookingData.name} - ${bookingData.phone}\n` +
    `Đón: ${bookingData.pickup}\n` +
    `Đến: ${bookingData.dropoff}\n`;

  if (bookingData.vehicleType) {
    text += `Loại xe: ${bookingData.vehicleType}\n`;
  }
  if (bookingData.distanceKm) {
    text += `Khoảng cách: ${bookingData.distanceKm} km\n`;
  }

  text += `------------------\n` +
    `🎁 Voucher áp dụng: ${promoCode} (${discountName})\n`;

  if (formattedOriginalPrice) {
    text += `💵 Giá gốc: ${formattedOriginalPrice}\n`;
  }
  if (formattedDiscount) {
    text += `🏷️ Số tiền giảm: -${formattedDiscount}\n`;
  }

  text += `💰 Giá sau khi giảm (Khách trả): ${formattedPrice}`;

  if (bookingData.noteForDriver) {
    text += `\nGhi chú: ${bookingData.noteForDriver}`;
  }

  const bookingId = (bookingData as any).id || (bookingData as any).bookingId || `DGO-${Date.now().toString().slice(-6)}`;

  const replyMarkup = {
    inline_keyboard: [
      [{ text: "✅ Đã nhận cuốc", callback_data: `nhan_cuoc_${bookingId}` }],
      [{ text: "🚘 Tài xế đang đến", callback_data: `tai_xe_dang_den_${bookingId}` }],
      [{ text: "❌ Hủy cuốc", callback_data: `huy_cuoc_${bookingId}` }]
    ]
  };

  const isNumeric = /^-?\d+$/.test(rawChatId);
  const startsWithAt = rawChatId.startsWith('@');

  const chatCandidates: string[] = [rawChatId];
  if (!isNumeric && !startsWithAt && rawChatId.length > 0) {
    const handle = `@${rawChatId.replace(/\s+/g, '')}`;
    if (!chatCandidates.includes(handle)) {
      chatCandidates.push(handle);
    }
  }

  let lastResult: any = { ok: false };

  for (const cid of chatCandidates) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: cid, text: text, reply_markup: replyMarkup }),
      });
      const data = await response.json();
      console.log(`Telegram notification attempt (${cid}) result:`, data);
      if (data && data.ok) {
        return data;
      }
      lastResult = data;
    } catch (error) {
      console.error(`Error sending Telegram notification to ${cid}:`, error);
    }
  }

  return lastResult;
};

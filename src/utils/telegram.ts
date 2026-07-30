export const sendTelegramNotification = async (bookingData: {
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  totalPrice: number | string;
  vehicleType?: string;
  distanceKm?: number;
  noteForDriver?: string;
}) => {
  const token = "8182785112:AAEO1WlI59qkaCDR1OuO00z2No6cTwk4acE".trim();
  const rawChatId = "-1003936078147".trim();

  const formattedPrice = typeof bookingData.totalPrice === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalPrice)
    : bookingData.totalPrice;

  let text = `🚗 CÓ ĐƠN ĐẶT XE MỚI!\n` +
    `Khách: ${bookingData.name} - ${bookingData.phone}\n` +
    `Đón: ${bookingData.pickup}\n` +
    `Đến: ${bookingData.dropoff}\n` +
    `Tổng tiền: ${formattedPrice}`;

  if (bookingData.vehicleType) {
    text += `\nLoại xe: ${bookingData.vehicleType}`;
  }
  if (bookingData.distanceKm) {
    text += `\nKhoảng cách: ${bookingData.distanceKm} km`;
  }
  if (bookingData.noteForDriver) {
    text += `\nGhi chú: ${bookingData.noteForDriver}`;
  }

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
        body: JSON.stringify({ chat_id: cid, text: text }),
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

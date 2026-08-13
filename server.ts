import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { saveFirestoreUser, getFirestoreUser, saveFirestoreBooking, saveFirestoreRating, getFirestoreRatings, incrementFirestoreUserOrderCount } from './src/lib/firebase-server';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory database of bookings (for demonstration & dispatcher view)
const bookingsStore: any[] = [];

// Telegram Bot details
const TELEGRAM_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "8182785112:AAEO1WlI59qkaCDR1OuO00z2No6cTwk4acE").trim();
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || "-1003936078147").trim();

// Helper to hash passwords securely with salt
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'dgo_salt_247_secret').digest('hex');
}

// Helper to validate Vietnamese phone numbers
function isValidVietnamesePhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.trim().replace(/\D/g, '');
  if (/^(03|05|07|08|09)\d{8}$/.test(clean)) return true;
  if (/^84(3|5|7|8|9)\d{8}$/.test(clean)) return true;
  return clean.length >= 9 && clean.length <= 11;
}

// Helper function to send Telegram notification
const sendTelegramNotification = async (bookingData: any) => {
  try {
    const formattedPrice = typeof bookingData.totalPrice === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalPrice || 0)
      : (bookingData.totalPrice || '0 ₫');

    const originalPriceNum = bookingData.breakdown?.originalPrice || bookingData.originalPrice;
    const formattedOriginalPrice = typeof originalPriceNum === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPriceNum)
      : (originalPriceNum || null);

    const discountAmountNum = bookingData.breakdown?.discountAmount || bookingData.discountAmount;
    const formattedDiscount = typeof discountAmountNum === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmountNum)
      : (discountAmountNum || null);

    const name = bookingData.customerName || bookingData.fullName || bookingData.name || 'Khách hàng';
    const phone = bookingData.customerPhone || bookingData.phoneNumber || bookingData.phone || '';
    const pickup = bookingData.pickupLocation || bookingData.pickupAddress || '';
    const dropoff = bookingData.dropoffLocation || bookingData.destinationAddress || '';
    const orderIndex = bookingData.orderIndex || bookingData.totalOrdersCount || 1;
    const distanceKm = bookingData.distanceKm || 0;
    const durationMinutes = bookingData.durationMinutes || bookingData.breakdown?.estimatedMinutes || Math.round(distanceKm * 2.2 + 5);
    const vehicleType = bookingData.vehicleType || 'Ô tô / Xe máy';
    const noteForDriver = bookingData.noteForDriver || bookingData.note || 'Không có ghi chú';

    let text = '';
    if (orderIndex === 1) {
      text = `🆕 CÓ ĐƠN ĐẶT XE MỚI (KHÁCH HÀNG MỚI)\n` +
        `- Khách hàng: ${name} - ${phone}\n` +
        `- Lộ trình: ${pickup} ➔ ${dropoff}\n` +
        `- Quãng đường: ${distanceKm} km | Thời gian: ${durationMinutes} phút\n` +
        `- Loại xe: ${vehicleType}\n` +
        `- Ghi chú cho tài xế: ${noteForDriver}\n` +
        `- Tổng tiền: ${formattedPrice}`;
    } else {
      text = `🔥 CÓ ĐƠN ĐẶT XE MỚI (KHÁCH CŨ QUAY LẠI - LẦN THỨ ${orderIndex})\n` +
        `- Khách hàng: ${name} - ${phone}\n` +
        `- Lộ trình: ${pickup} ➔ ${dropoff}\n` +
        `- Quãng đường: ${distanceKm} km | Thời gian: ${durationMinutes} phút\n` +
        `- Loại xe: ${vehicleType}\n` +
        `- Ghi chú cho tài xế: ${noteForDriver}\n` +
        `- Tổng tiền: ${formattedPrice}\n` +
        `- Tần suất: Khách đã đặt ${orderIndex} chuyến trên D.GO!`;
    }

    const promoCode = bookingData.breakdown?.promoCode || bookingData.promoCode;
    const discountName = bookingData.breakdown?.discountCodeName || bookingData.discountCodeName;

    if (promoCode && discountAmountNum > 0) {
      text += `\n------------------\n` +
        `🎁 Voucher áp dụng: ${promoCode}${discountName ? ` (${discountName})` : ''}\n`;
      if (formattedOriginalPrice) {
        text += `💵 Giá gốc: ${formattedOriginalPrice}\n`;
      }
      if (formattedDiscount) {
        text += `🏷️ Số tiền giảm: -${formattedDiscount}\n`;
      }
      text += `💰 Giá thanh toán (Khách trả): ${formattedPrice}`;
    }

    const bookingId = bookingData.id || bookingData.bookingId || `DGO-${Date.now().toString().slice(-6)}`;

    // Inline Keyboard Action Buttons for Telegram Dispatcher / Driver
    const replyMarkup = {
      inline_keyboard: [
        [{ text: "✅ Đã nhận cuốc", callback_data: `nhan_${bookingId}` }],
        [{ text: "🚘 Tài xế đang đến", callback_data: `xacnhan_${bookingId}` }],
        [{ text: "❌ Hủy cuốc", callback_data: `huy_${bookingId}` }]
      ]
    };

    // Determine target chat ID options
    let targetChatId = TELEGRAM_CHAT_ID;
    const isNumeric = /^-?\d+$/.test(targetChatId);
    const startsWithAt = targetChatId.startsWith('@');

    const chatCandidates: string[] = [targetChatId];
    if (!isNumeric && !startsWithAt && targetChatId.trim().length > 0) {
      // Add candidate with @ prefix if it's a channel/username
      const channelHandle = `@${targetChatId.replace(/\s+/g, '')}`;
      if (!chatCandidates.includes(channelHandle)) {
        chatCandidates.push(channelHandle);
      }
    }

    let lastResult: any = { ok: false };

    for (const cid of chatCandidates) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: cid,
            text: text,
            reply_markup: replyMarkup
          }),
        });

        const resJson = await response.json();
        console.log(`Telegram API send attempt with chat_id="${cid}" result:`, resJson);

        if (resJson && resJson.ok) {
          return resJson;
        }
        lastResult = resJson;
      } catch (err) {
        console.error(`Attempt failed for chat_id=${cid}:`, err);
      }
    }

    return lastResult;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return { ok: false, error: String(error) };
  }
};

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "D.GO - Gọi Lái 247" });
});

// Daily visitor counter store
let visitorStore = {
  date: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }),
  todayCount: 1540 + Math.floor(Math.random() * 50),
  totalCount: 148200 + Math.floor(Math.random() * 500),
  activeOnline: Math.floor(Math.random() * 15) + 25
};

const checkAndResetDailyVisitors = () => {
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
  if (visitorStore.date !== todayStr) {
    visitorStore.date = todayStr;
    visitorStore.todayCount = 1200 + Math.floor(Math.random() * 200);
  }
};

app.get("/api/visitors", (req, res) => {
  checkAndResetDailyVisitors();
  visitorStore.activeOnline = Math.floor(Math.random() * 12) + 22;
  res.json({
    success: true,
    date: visitorStore.date,
    todayCount: visitorStore.todayCount,
    totalCount: visitorStore.totalCount,
    activeOnline: visitorStore.activeOnline
  });
});

app.post("/api/visitors/hit", (req, res) => {
  checkAndResetDailyVisitors();
  visitorStore.todayCount += 1;
  visitorStore.totalCount += 1;
  res.json({
    success: true,
    todayCount: visitorStore.todayCount,
    totalCount: visitorStore.totalCount
  });
});

// Create new booking
app.post("/api/booking", async (req, res) => {
  try {
    const bookingData = req.body;
    bookingData.id = bookingData.id || `DGO-${Date.now().toString().slice(-6)}`;
    bookingData.createdAt = Date.now();
    bookingData.status = bookingData.status || "PENDING";

    const phoneRaw = bookingData.customerPhone || bookingData.phoneNumber || '';
    const cleanPhone = phoneRaw.replace(/\D/g, '');
    const name = bookingData.customerName || bookingData.fullName || 'Khách hàng';

    // 1. Calculate Retention Metrics and increment totalOrdersCount in Firestore users collection
    let orderIndex = 1;
    if (cleanPhone) {
      orderIndex = await incrementFirestoreUserOrderCount(cleanPhone, name);
    }

    bookingData.orderIndex = orderIndex;
    bookingData.totalOrdersCount = orderIndex;
    bookingData.isNewCustomer = orderIndex === 1;
    bookingData.customerPhoneClean = cleanPhone;
    bookingData.phoneNumber = cleanPhone || bookingData.customerPhone;
    bookingData.pickupLocation = bookingData.pickupLocation || bookingData.pickupAddress;
    bookingData.dropoffLocation = bookingData.dropoffLocation || bookingData.destinationAddress;

    // 2. Save booking to Cloud Firestore `bookings` collection
    await saveFirestoreBooking(bookingData);

    // Save to local memory store for dispatcher view
    bookingsStore.unshift(bookingData);

    // Update user in memory store if present
    if (cleanPhone) {
      let user = usersStore.get(cleanPhone);
      if (user) {
        user.tripsCount = Math.max(user.tripsCount + 1, orderIndex);
        user.totalSpent = (user.totalSpent || 0) + (bookingData.totalPrice || 0);
        if (user.tripsCount >= 10) user.tier = 'KIM CƯƠNG';
        else if (user.tripsCount >= 5) user.tier = 'VIP';
        else if (user.tripsCount >= 2) user.tier = 'THÂN THIẾT';
        user.loyaltyPoints = user.tripsCount * 10;
        user.loyaltyScorePercent = Math.min(99, 85 + user.tripsCount * 3);
        await saveFirestoreUser(cleanPhone, user);
      }
    }

    // Keep store capped at 100 items
    if (bookingsStore.length > 100) {
      bookingsStore.pop();
    }

    // 3. Trigger Telegram notification
    const telegramResult = await sendTelegramNotification(bookingData);

    res.json({
      success: true,
      booking: bookingData,
      telegram: telegramResult
    });
  } catch (err: any) {
    console.error('Error in /api/booking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all bookings (for Dispatcher & Admin view)
app.get("/api/bookings", async (req, res) => {
  try {
    res.json({
      success: true,
      bookings: bookingsStore
    });
  } catch (err: any) {
    console.error("Error in GET /api/bookings:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Telegram Webhook for handling Inline Keyboard Button clicks (nhan_*, xacnhan_*, huy_*)
app.post("/api/telegram-webhook", async (req, res) => {
  try {
    const update = req.body;
    if (update && update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackId = callbackQuery.id;
      const data = callbackQuery.data; // e.g. "nhan_DGO-123456", "xacnhan_DGO-123456", "huy_DGO-123456"
      const fromUser = callbackQuery.from?.first_name || callbackQuery.from?.username || 'Tài xế';

      let responseText = "Đã ghi nhận thao tác!";
      let newStatus = "";

      if (data) {
        if (data.startsWith("nhan_")) {
          const bookingId = data.replace("nhan_", "");
          newStatus = "ACCEPTED";
          responseText = `✅ ${fromUser} đã nhận cuốc ${bookingId}!`;
        } else if (data.startsWith("xacnhan_")) {
          const bookingId = data.replace("xacnhan_", "");
          newStatus = "DRIVER_EN_ROUTE";
          responseText = `🚘 ${fromUser} đang di chuyển đến đón khách đơn ${bookingId}!`;
        } else if (data.startsWith("huy_")) {
          const bookingId = data.replace("huy_", "");
          newStatus = "CANCELLED";
          responseText = `❌ ${fromUser} đã hủy cuốc ${bookingId}!`;
        }

        // Update status in local store if found
        if (newStatus && data) {
          const parts = data.split("_");
          const targetId = parts[1];
          const matchedBooking = bookingsStore.find(b => b.id === targetId || b.id === `DGO-${targetId}`);
          if (matchedBooking) {
            matchedBooking.status = newStatus;
            matchedBooking.driverAssigned = fromUser;
          }
        }
      }

      // Answer Telegram Callback Query to remove button loading indicator
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackId,
          text: responseText,
          show_alert: true
        })
      });
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error("Error handling Telegram webhook:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// User Profiles & Loyalty Store
interface UserProfileData {
  phone: string;
  name: string;
  passwordHash?: string;
  agreedTerms?: boolean;
  token?: string;
  tier: 'MỚI' | 'THÂN THIẾT' | 'VIP' | 'KIM CƯƠNG';
  tripsCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyScorePercent: number;
  createdAt: number;
}

const usersStore: Map<string, UserProfileData> = new Map();

// Sample Driver Ratings Feed for Customer Feedback Showcase
const sampleRatings = [
  {
    id: 'r-corp-1',
    customerName: 'Anh Nguyễn Thế Vinh',
    companyName: 'Công ty Logistics Vinh Phát',
    isEnterprise: true,
    customerPhone: '098****123',
    stars: 5,
    review: 'Công ty chúng tôi thường xuyên cần tài xế lái xe đưa đón sếp và đối tác đi tiệc rượu, công tác tỉnh. Dịch vụ D.GO 247 cực kỳ chuyên nghiệp, tài xế văn minh, lịch sự. Rất hài lòng vì D.GO hỗ trợ xuất hóa đơn GTGT / VAT điện tử rất nhanh chóng và đầy đủ chứng từ, giúp phòng kế toán dễ dàng hạch toán chi phí hợp lệ cho doanh nghiệp!',
    tags: ['Khách hàng Doanh nghiệp', 'Xuất hóa đơn VAT chuẩn chỉnh', 'Tài xế lịch sự & chu đáo', 'Lái xe an toàn'],
    driverName: 'Tài xế Nguyễn Văn Hùng',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'r-corp-2',
    customerName: 'Chị Phạm Thanh Vân',
    companyName: 'Công ty Truyền thông & Event SunMedia',
    isEnterprise: true,
    customerPhone: '091****888',
    stars: 5,
    review: 'Là đơn vị sự kiện, bên mình thường phải đặt tài xế lái ô tô cho đoàn khách VIP vào đêm muộn. D.GO 247 luôn có mặt đúng giờ, xe sạch sẽ. Ưu điểm vượt trội là việc xuất hóa đơn VAT tên công ty rõ ràng, thủ tục minh bạch, thanh toán linh hoạt theo hợp đồng doanh nghiệp. Hợp tác lâu dài!',
    tags: ['Khách hàng Doanh nghiệp', 'Xuất hóa đơn VAT nhanh chóng', 'Phục vụ khách VIP', 'Đến đúng hẹn'],
    driverName: 'Tài xế Trần Quốc Bảo',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'r-corp-3',
    customerName: 'Anh Lê Quốc Tuấn',
    companyName: 'Cty Xây dựng & Thương mại Hưng Thịnh',
    isEnterprise: true,
    customerPhone: '093****555',
    stars: 5,
    review: 'Điều khiến công ty tôi tin dùng D.GO 247 hơn hẳn các dịch vụ khác là tốc độ phản hồi cực nhanh và dịch vụ xuất hóa đơn GTGT doanh nghiệp trong ngày. Lái xe cẩn thận, biết giữ gìn tài sản của khách. Tiết kiệm đáng kể thời gian và chi phí cho công ty!',
    tags: ['Khách hàng Doanh nghiệp', 'Hóa đơn VAT điện tử', 'Thanh toán linh hoạt', 'Nhiệt tình hỗ trợ'],
    driverName: 'Tài xế Lê Hoài Nam',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'r-1',
    customerName: 'Anh Minh (Thanh Xuân)',
    customerPhone: '098****321',
    stars: 5,
    review: 'Tài xế lái xe rất êm và cẩn thận. Bữa tiệc xong ăn uống no say có tài xế D.GO đưa về nhà an toàn tuyệt đối. Sẽ tiếp tục dùng dịch vụ!',
    tags: ['Tài xế lịch sự & chu đáo', 'Lái xe an toàn & êm ái', 'Đến đúng hẹn'],
    driverName: 'Tài xế Phạm Hoàng Nam',
    createdAt: Date.now() - 3600000 * 36,
  },
  {
    id: 'r-2',
    customerName: 'Chị Mai (Cầu Giấy)',
    customerPhone: '091****777',
    stars: 5,
    review: 'Đã đặt lần thứ 6 rồi, rất thích thái độ nhiệt tình của các bạn tài xế D.GO 247. Giá cả công khai minh bạch không bị vẽ tiền.',
    tags: ['Thái độ chuyên nghiệp', 'Cung đường tối ưu', 'Xe sạch sẽ'],
    driverName: 'Tài xế Vũ Đình Trọng',
    createdAt: Date.now() - 3600000 * 48,
  },
];

// Get all public driver ratings & reviews
app.get("/api/ratings", async (req, res) => {
  try {
    const ratingsFromBookings = (bookingsStore || [])
      .filter(b => b && b.rating)
      .map(b => ({
        id: b.id,
        customerName: b.customerName,
        companyName: b.companyName,
        isEnterprise: b.isEnterprise,
        customerPhone: b.customerPhone ? b.customerPhone.slice(0, 4) + '****' + b.customerPhone.slice(-3) : 'Khách hàng',
        stars: b.rating!.stars,
        review: b.rating!.review,
        tags: b.rating!.tags,
        driverName: b.rating!.driverName || 'Tài xế D.GO 247',
        createdAt: b.rating!.createdAt || b.createdAt,
      }));

    let firestoreRatings: any[] = [];
    try {
      firestoreRatings = await getFirestoreRatings();
    } catch (e) {
      console.warn('[Server] Error fetching Firestore ratings, fallback to sample ratings:', e);
    }

    // Deduplicate ratings by id
    const ratingMap = new Map();
    [...(Array.isArray(firestoreRatings) ? firestoreRatings : []), ...sampleRatings, ...ratingsFromBookings].forEach(item => {
      if (item && item.id && !ratingMap.has(item.id)) {
        ratingMap.set(item.id, item);
      }
    });

    const allRatings = Array.from(ratingMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const avgStars = (allRatings.reduce((acc, curr) => acc + (curr.stars || 5), 0) / (allRatings.length || 1)).toFixed(1);

    res.json({
      success: true,
      ratings: allRatings,
      stats: {
        averageStars: Number(avgStars) || 4.9,
        totalReviews: allRatings.length,
        satisfactionRate: 98.6 // Tỷ lệ hài lòng %
      }
    });
  } catch (err: any) {
    console.error('[Server] Error in GET /api/ratings:', err);
    res.json({
      success: true,
      ratings: sampleRatings,
      stats: {
        averageStars: 4.9,
        totalReviews: sampleRatings.length,
        satisfactionRate: 98.6
      }
    });
  }
});

// Post a public direct customer rating & review
app.post("/api/ratings", async (req, res) => {
  try {
    const { customerName, companyName, isEnterprise, stars, review, tags, driverName, customerPhone } = req.body;
    const newRating = {
      id: `r-user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerName: customerName || 'Khách hàng',
      companyName: companyName || undefined,
      isEnterprise: !!isEnterprise,
      customerPhone: customerPhone ? customerPhone.slice(0, 4) + '****' + customerPhone.slice(-3) : undefined,
      stars: Number(stars) || 5,
      review: review || '',
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Chất lượng dịch vụ xuất sắc'],
      driverName: driverName || 'Tài xế D.GO 247',
      createdAt: Date.now(),
    };

    sampleRatings.unshift(newRating);
    try {
      await saveFirestoreRating(newRating);
    } catch (e) {
      console.warn('[Server] Error saving rating to Firestore:', e);
    }

    res.json({ success: true, rating: newRating });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// ================= USER AUTHENTICATION & RETENTION SYSTEM =================

// Register Endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, phone, password, confirmPassword, agreedTerms } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập Họ và Tên hợp lệ (ít nhất 2 ký tự)" });
    }

    if (!isValidVietnamesePhone(phone)) {
      return res.status(400).json({ success: false, message: "Số điện thoại không đúng định dạng Việt Nam. Ví dụ: 0971999734" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu phải chứa ít nhất 6 ký tự" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu xác nhận không trùng khớp" });
    }

    if (agreedTerms === false) {
      return res.status(400).json({ success: false, message: "Bạn cần đồng ý với Điều khoản dịch vụ & Chính sách bảo mật để đăng ký" });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');

    // Check memory store or Firestore for existing user
    let existingUser = usersStore.get(cleanPhone);
    if (!existingUser) {
      const fsUser = await getFirestoreUser(cleanPhone);
      if (fsUser) existingUser = fsUser as any;
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Số điện thoại này đã được đăng ký. Vui lòng chuyển sang Đăng nhập" });
    }

    // Compute existing trip history for this phone number
    const customerBookings = bookingsStore.filter(b => b.customerPhone && b.customerPhone.replace(/\D/g, '') === cleanPhone);
    const tripsCount = Math.max(1, customerBookings.length);
    const totalSpent = customerBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    let tier: 'MỚI' | 'THÂN THIẾT' | 'VIP' | 'KIM CƯƠNG' = 'MỚI';
    if (tripsCount >= 10) tier = 'KIM CƯƠNG';
    else if (tripsCount >= 5) tier = 'VIP';
    else if (tripsCount >= 2) tier = 'THÂN THIẾT';

    const token = `dgo_token_${cleanPhone}_${Date.now()}`;
    const passwordHash = hashPassword(password);

    const newUser: UserProfileData = {
      phone: cleanPhone,
      name: name.trim(),
      passwordHash,
      agreedTerms: true,
      token,
      tier,
      tripsCount,
      totalSpent,
      loyaltyPoints: tripsCount * 10,
      loyaltyScorePercent: Math.min(99, 85 + tripsCount * 3),
      createdAt: Date.now()
    };

    usersStore.set(cleanPhone, newUser);
    await saveFirestoreUser(cleanPhone, newUser);

    const userToReturn = { ...newUser };
    delete userToReturn.passwordHash;

    res.json({
      success: true,
      user: userToReturn,
      token,
      message: "Đăng ký tài khoản D.GO 247 thành công!"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login Endpoint (Phone + Password)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !isValidVietnamesePhone(phone)) {
      return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu" });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    let user = usersStore.get(cleanPhone);

    // If user does not exist in memory, fetch from Firestore
    if (!user) {
      const fsUser = await getFirestoreUser(cleanPhone);
      if (fsUser) {
        user = fsUser as any;
        usersStore.set(cleanPhone, user!);
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Số điện thoại chưa được đăng ký tài khoản. Vui lòng chọn Đăng ký" });
    }

    // Verify Password Hash
    if (user.passwordHash) {
      const inputHash = hashPassword(password);
      if (inputHash !== user.passwordHash) {
        return res.status(400).json({ success: false, message: "Mật khẩu không chính xác" });
      }
    }

    // Refresh trips count and loyalty score
    const customerBookings = bookingsStore.filter(b => b.customerPhone && b.customerPhone.replace(/\D/g, '') === cleanPhone);
    const tripsCount = Math.max(customerBookings.length, user.tripsCount);
    const totalSpent = customerBookings.reduce((sum, b) => sum + (b.totalPrice || 0), user.totalSpent);

    let tier: 'MỚI' | 'THÂN THIẾT' | 'VIP' | 'KIM CƯƠNG' = 'MỚI';
    if (tripsCount >= 10) tier = 'KIM CƯƠNG';
    else if (tripsCount >= 5) tier = 'VIP';
    else if (tripsCount >= 2) tier = 'THÂN THIẾT';

    user.tripsCount = tripsCount;
    user.totalSpent = totalSpent;
    user.tier = tier;
    user.loyaltyPoints = tripsCount * 10;
    user.loyaltyScorePercent = Math.min(99, 85 + tripsCount * 3);
    user.token = `dgo_token_${cleanPhone}_${Date.now()}`;

    usersStore.set(cleanPhone, user);
    await saveFirestoreUser(cleanPhone, user);

    const userToReturn = { ...user };
    delete userToReturn.passwordHash;

    res.json({
      success: true,
      user: userToReturn,
      token: user.token,
      message: "Đăng nhập thành công!"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset Password Endpoint
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!isValidVietnamesePhone(phone)) {
      return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới phải chứa ít nhất 6 ký tự" });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    let user = usersStore.get(cleanPhone);
    if (!user) {
      const fsUser = await getFirestoreUser(cleanPhone);
      if (fsUser) {
        user = fsUser as any;
        usersStore.set(cleanPhone, user!);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "Số điện thoại chưa đăng ký tài khoản" });
    }

    user.passwordHash = hashPassword(newPassword);
    usersStore.set(cleanPhone, user);
    await saveFirestoreUser(cleanPhone, user);

    res.json({ success: true, message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Current User Session Endpoint (Auto Login Persistence)
app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const phoneQuery = req.query.phone as string;

    let targetPhone = '';
    if (authHeader && authHeader.startsWith('Bearer dgo_token_')) {
      const parts = authHeader.replace('Bearer dgo_token_', '').split('_');
      targetPhone = parts[0];
    } else if (phoneQuery) {
      targetPhone = phoneQuery.trim().replace(/\D/g, '');
    }

    if (!targetPhone) {
      return res.status(401).json({ success: false, message: "Không tìm thấy phiên đăng nhập" });
    }

    let user = usersStore.get(targetPhone);
    if (!user) {
      const fsUser = await getFirestoreUser(targetPhone);
      if (fsUser) {
        user = fsUser as any;
        usersStore.set(targetPhone, user!);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "Tài khoản không tồn tại" });
    }

    // Refresh trips count from bookings
    const customerBookings = bookingsStore.filter(b => b.customerPhone && b.customerPhone.replace(/\D/g, '') === targetPhone);
    user.tripsCount = Math.max(customerBookings.length, user.tripsCount);
    
    const userToReturn = { ...user };
    delete userToReturn.passwordHash;

    res.json({ success: true, user: userToReturn });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Phone Authentication & Loyalty Status API (Quick OTP fallback)
app.post("/api/auth/phone-login", (req, res) => {
  const { phone, name } = req.body;
  if (!phone || phone.trim().length < 8) {
    return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ" });
  }

  const cleanPhone = phone.trim().replace(/\D/g, '');
  let user = usersStore.get(cleanPhone);

  // Calculate customer trips count from bookingStore
  const customerBookings = bookingsStore.filter(b => b.customerPhone && b.customerPhone.replace(/\D/g, '') === cleanPhone);
  const tripsCount = Math.max(customerBookings.length, user ? user.tripsCount : 1);
  const totalSpent = customerBookings.reduce((sum, b) => sum + (b.totalPrice || 0), user ? user.totalSpent : 350000);

  let tier: 'MỚI' | 'THÂN THIẾT' | 'VIP' | 'KIM CƯƠNG' = 'MỚI';
  if (tripsCount >= 10) tier = 'KIM CƯƠNG';
  else if (tripsCount >= 5) tier = 'VIP';
  else if (tripsCount >= 2) tier = 'THÂN THIẾT';

  // Loyalty score percent (e.g. 92% to 99% based on trips)
  const loyaltyScorePercent = Math.min(99, 85 + tripsCount * 3);

  if (!user) {
    user = {
      phone: cleanPhone,
      name: name ? name.trim() : `Khách hàng ${cleanPhone.slice(-4)}`,
      tier,
      tripsCount,
      totalSpent,
      loyaltyPoints: tripsCount * 10,
      loyaltyScorePercent,
      createdAt: Date.now()
    };
    usersStore.set(cleanPhone, user);
  } else {
    if (name) user.name = name.trim();
    user.tripsCount = tripsCount;
    user.totalSpent = totalSpent;
    user.tier = tier;
    user.loyaltyPoints = tripsCount * 10;
    user.loyaltyScorePercent = loyaltyScorePercent;
  }

  res.json({
    success: true,
    user,
    message: "Đăng nhập thành công"
  });
});

// Update booking status
app.patch("/api/booking/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = bookingsStore.find(b => b.id === id);
  if (booking) {
    booking.status = status;
    res.json({ success: true, booking });
  } else {
    res.status(404).json({ success: false, message: "Booking not found" });
  }
});

// Submit driver rating & review for a booking
app.post("/api/booking/:id/rating", (req, res) => {
  const { id } = req.params;
  const { stars, review, tags, driverName } = req.body;
  const booking = bookingsStore.find(b => b.id === id);
  
  if (booking) {
    booking.rating = {
      stars: stars || 5,
      review: review || '',
      tags: tags || [],
      driverName: driverName || 'Tài xế D.GO 247',
      createdAt: Date.now()
    };
    res.json({ success: true, booking });
  } else {
    // If booking was stored in localStorage on client side, return success with structured rating object
    res.json({
      success: true,
      rating: {
        stars: stars || 5,
        review: review || '',
        tags: tags || [],
        driverName: driverName || 'Tài xế D.GO 247',
        createdAt: Date.now()
      }
    });
  }
});

// Helper to decode Google Maps overview_polyline string into Lat/Lng coordinate tuples
function decodeGooglePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Helper to format Nominatim response into a clean, human-readable Vietnamese address
function formatNominatimAddress(data: any): string {
  if (!data || typeof data !== 'object') return '';
  const addr = data.address;
  if (!addr) {
    let name = data.display_name || '';
    return name.replace(/, \d{5,6}/g, '').replace(/, Việt Nam$/gi, '').trim();
  }

  const parts: string[] = [];

  // 1. POI / Building / Amenity name
  const poi = addr.amenity || addr.building || addr.shop || addr.office || addr.tourism || addr.historic || addr.leisure || addr.hospital || addr.school || addr.hotel;
  
  // 2. House number & Street
  const house = addr.house_number || '';
  const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || '';

  if (poi && poi.trim().length > 0) {
    parts.push(poi.trim());
  }

  if (house && road) {
    parts.push(`Số ${house} ${road}`.trim());
  } else if (road) {
    parts.push(road.trim());
  } else if (house) {
    parts.push(`Số ${house}`.trim());
  }

  // 3. Ward / Suburb / Quarter / Village
  const wardRaw = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.subdistrict || addr.hamlet || addr.residential || '';
  if (wardRaw && wardRaw.trim().length > 0) {
    const ward = wardRaw.trim();
    if (!/^(Phường|Xã|Thị trấn)/i.test(ward)) {
      parts.push(`Phường ${ward}`);
    } else {
      parts.push(ward);
    }
  }

  // 4. District / County / City District
  const districtRaw = addr.city_district || addr.district || addr.county || addr.town || '';
  if (districtRaw && districtRaw.trim().length > 0) {
    const district = districtRaw.trim();
    if (!/^(Quận|Huyện|Thị xã|Thành phố)/i.test(district)) {
      parts.push(`Quận ${district}`);
    } else {
      parts.push(district);
    }
  }

  // 5. City / Province / State
  const cityRaw = addr.city || addr.state || addr.province || '';
  if (cityRaw && cityRaw.trim().length > 0) {
    const city = cityRaw.trim();
    parts.push(city);
  }

  if (parts.length >= 2) {
    return parts.join(', ');
  }

  // If parsed parts are too short, clean up display_name
  let displayName = data.display_name || '';
  displayName = displayName
    .replace(/, \d{5,6}/g, '')
    .replace(/, Việt Nam$/gi, '')
    .trim();

  return displayName || parts.join(', ') || '';
}

// Proxy route for Places Autocomplete and Geocoding (search places in Vietnam with Goong API primary)
app.get("/api/geocode/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) return res.json([]);

    const cleanQuery = query.trim();
    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Maps AutoComplete API (centered on Bac Ninh / Northern VN: 21.1861, 106.0763)
    if (goongApiKey) {
      try {
        const goongAutoUrl = `https://rsapi.goong.io/Place/AutoComplete?api_key=${goongApiKey}&input=${encodeURIComponent(cleanQuery)}&location=21.1861,106.0763&radius=50000&more_compound=true`;
        const goongRes = await fetch(goongAutoUrl);
        const goongData = await goongRes.json();

        if (goongData.status === 'OK' && Array.isArray(goongData.predictions) && goongData.predictions.length > 0) {
          const formatted = goongData.predictions.slice(0, 8).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.description,
            source: 'goong_autocomplete'
          }));
          return res.json(formatted);
        }

        // 2. Try Goong Geocode API if AutoComplete returned 0 predictions
        const goongGeoUrl = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(cleanQuery)}&api_key=${goongApiKey}`;
        const goongGeoRes = await fetch(goongGeoUrl);
        const goongGeoData = await goongGeoRes.json();

        if (goongGeoData.status === 'OK' && Array.isArray(goongGeoData.results) && goongGeoData.results.length > 0) {
          const formatted = goongGeoData.results.slice(0, 8).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.formatted_address,
            lat: item.geometry?.location?.lat,
            lon: item.geometry?.location?.lng,
            source: 'goong_geocode'
          }));
          return res.json(formatted);
        }
      } catch (goongErr) {
        console.warn('Goong Maps search error, trying Google/OSM fallbacks:', goongErr);
      }
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;
    if (googleApiKey) {
      try {
        // 1. Try Google Places Text Search API for places, POIs, streets, airports, stations
        const gPlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(cleanQuery)}&region=vn&language=vi&key=${googleApiKey}`;
        const gRes = await fetch(gPlacesUrl);
        const gData = await gRes.json();
        if (gData.status === 'OK' && gData.results && gData.results.length > 0) {
          const formatted = gData.results.slice(0, 6).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.name && !item.formatted_address.includes(item.name) 
              ? `${item.name}, ${item.formatted_address}` 
              : item.formatted_address,
            lat: item.geometry?.location?.lat,
            lon: item.geometry?.location?.lng,
            source: 'google_places'
          }));
          return res.json(formatted);
        }

        // 2. Try Google Places Autocomplete API
        const gAutoUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(cleanQuery)}&components=country:vn&language=vi&key=${googleApiKey}`;
        const gAutoRes = await fetch(gAutoUrl);
        const gAutoData = await gAutoRes.json();
        if (gAutoData.status === 'OK' && gAutoData.predictions && gAutoData.predictions.length > 0) {
          const formatted = gAutoData.predictions.slice(0, 6).map((item: any) => ({
            place_id: item.place_id,
            display_name: item.description,
            source: 'google_autocomplete'
          }));
          return res.json(formatted);
        }

        // 3. Fallback to Google Geocoding API
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanQuery)}&components=country:VN&key=${googleApiKey}&language=vi`;
        const gGeoRes = await fetch(gUrl);
        const gGeoData = await gGeoRes.json();
        if (gGeoData.status === 'OK' && gGeoData.results && gGeoData.results.length > 0) {
          const formatted = gGeoData.results.slice(0, 6).map((item: any, idx: number) => ({
            place_id: item.place_id || idx,
            display_name: item.formatted_address,
            lat: item.geometry?.location?.lat,
            lon: item.geometry?.location?.lng,
            source: 'google_geocode'
          }));
          return res.json(formatted);
        }
      } catch (gErr) {
        console.warn('Google Maps Places search fallback:', gErr);
      }
    }

    // Primary Fallback: OpenStreetMap Nominatim search
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=vn&limit=6&addressdetails=1&accept-language=vi`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DGO-GoiLai247-App/1.0 (contact@dgo247.vn)',
          'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => {
            const customAddr = formatNominatimAddress(item);
            return {
              place_id: item.place_id,
              display_name: customAddr || item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              source: 'nominatim'
            };
          });
          return res.json(formatted);
        }
      }
    } catch (nomErr) {
      console.warn('Nominatim search failed:', nomErr);
    }

    // Secondary Fallback: Photon API search for Vietnam bounding box
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6&lang=vi&bbox=102,8.5,109.5,23.5`;
      const pRes = await fetch(photonUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData?.features && Array.isArray(pData.features) && pData.features.length > 0) {
          const formatted = pData.features.map((feat: any) => {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [105.8542, 21.0285];
            const nameParts = [props.name, props.street, props.district, props.city, props.state].filter(Boolean);
            return {
              place_id: props.osm_id || Math.random().toString(),
              display_name: nameParts.length > 0 ? nameParts.join(', ') : cleanQuery,
              lat: coords[1],
              lon: coords[0],
              source: 'photon'
            };
          });
          return res.json(formatted);
        }
      }
    } catch (pErr) {
      console.warn('Photon fallback search failed:', pErr);
    }

    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for Place Details (retrieve lat/lng by place_id using Goong API primary)
app.get("/api/places/details", async (req, res) => {
  try {
    const { place_id, address, q } = req.query;
    const searchAddress = (address || q || '').toString();
    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Place Detail API
    if (goongApiKey && place_id) {
      try {
        const goongDetailUrl = `https://rsapi.goong.io/Place/Detail?place_id=${place_id}&api_key=${goongApiKey}`;
        const goongRes = await fetch(goongDetailUrl);
        const goongData = await goongRes.json();

        if (goongData.status === 'OK' && goongData.result) {
          const result = goongData.result;
          return res.json({
            place_id: result.place_id || place_id,
            display_name: result.formatted_address || result.name,
            lat: result.geometry?.location?.lat,
            lng: result.geometry?.location?.lng,
            source: 'goong_details'
          });
        }
      } catch (goongErr) {
        console.warn('Goong Place Detail API failed:', goongErr);
      }
    }

    // 2. Try Goong Geocode search if searchAddress is present and place_id lookup failed
    if (goongApiKey && searchAddress) {
      try {
        const goongGeoUrl = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(searchAddress)}&api_key=${goongApiKey}`;
        const goongGeoRes = await fetch(goongGeoUrl);
        const goongGeoData = await goongGeoRes.json();

        if (goongGeoData.status === 'OK' && Array.isArray(goongGeoData.results) && goongGeoData.results.length > 0) {
          const first = goongGeoData.results[0];
          return res.json({
            place_id: first.place_id || place_id,
            display_name: first.formatted_address || searchAddress,
            lat: first.geometry?.location?.lat,
            lng: first.geometry?.location?.lng,
            source: 'goong_geocode_details'
          });
        }
      } catch (goongGeoErr) {
        console.warn('Goong Geocode fallback details failed:', goongGeoErr);
      }
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;
    if (googleApiKey && place_id) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,geometry&language=vi&key=${googleApiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.result) {
          const result = data.result;
          return res.json({
            place_id,
            display_name: result.name && !result.formatted_address.includes(result.name)
              ? `${result.name}, ${result.formatted_address}`
              : result.formatted_address,
            lat: result.geometry?.location?.lat,
            lng: result.geometry?.location?.lng,
            source: 'google_details'
          });
        }
      } catch (gErr) {
        console.warn('Google place details error:', gErr);
      }
    }

    // Fallback: Geocode searchAddress using OpenStreetMap Nominatim
    if (searchAddress) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&countrycodes=vn&limit=1&addressdetails=1&accept-language=vi`;
        const nomRes = await fetch(nomUrl, {
          headers: {
            'User-Agent': 'DGO-GoiLai247-App/1.0 (contact@dgo247.vn)',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
          }
        });
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData) && nomData.length > 0) {
            const first = nomData[0];
            return res.json({
              place_id: first.place_id || place_id,
              display_name: formatNominatimAddress(first) || searchAddress,
              lat: parseFloat(first.lat),
              lng: parseFloat(first.lon),
              source: 'nominatim_details'
            });
          }
        }
      } catch (nomErr) {
        console.warn('Nominatim details geocoding failed:', nomErr);
      }
    }

    res.status(404).json({ error: "Place details not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for Reverse Geocoding (lat, lng -> address string using Goong API primary)
app.get("/api/geocode/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Maps Geocode Reverse API
    if (goongApiKey) {
      try {
        const goongReverseUrl = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${goongApiKey}`;
        const goongRes = await fetch(goongReverseUrl);
        const goongData = await goongRes.json();

        if (goongData.status === 'OK' && Array.isArray(goongData.results) && goongData.results.length > 0) {
          let formattedAddress = goongData.results[0].formatted_address || '';
          formattedAddress = formattedAddress.replace(/, Việt Nam$/gi, '').trim();
          return res.json({
            display_name: formattedAddress,
            source: 'goong_reverse',
            raw: goongData.results[0]
          });
        }
      } catch (goongErr) {
        console.warn('Goong Maps reverse geocoding error:', goongErr);
      }
    }

    // 2. Try Google Maps Geocoding API if key is set
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;
    if (googleApiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&language=vi`;
        const gRes = await fetch(googleUrl);
        const gData = await gRes.json();
        if (gData.status === 'OK' && gData.results && gData.results.length > 0) {
          let formattedAddress = gData.results[0].formatted_address || '';
          formattedAddress = formattedAddress.replace(/, Việt Nam$/gi, '').trim();
          return res.json({
            display_name: formattedAddress,
            source: 'google',
            raw: gData.results[0]
          });
        }
      } catch (gErr) {
        console.warn('Google Maps reverse geocoding failed:', gErr);
      }
    }

    // 3. Try Nominatim OpenStreetMap with Vietnamese language headers
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DGO-GoiLai247-App/1.0 (contact@dgo247.vn)',
          'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && (data.address || data.display_name)) {
          const formattedAddress = formatNominatimAddress(data);
          return res.json({
            display_name: formattedAddress || data.display_name,
            address: data.address,
            source: 'nominatim'
          });
        }
      }
    } catch (nomErr) {
      console.warn('Nominatim reverse geocoding failed:', nomErr);
    }

    // 4. Fallback to BigDataCloud Reverse Geocode
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`;
      const bdcRes = await fetch(bdcUrl);
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const parts = [];
        if (bdcData.locality) parts.push(bdcData.locality);
        if (bdcData.city) parts.push(bdcData.city);
        if (bdcData.principalSubdivision) parts.push(bdcData.principalSubdivision);
        if (parts.length > 0) {
          return res.json({
            display_name: parts.join(', '),
            source: 'bigdatacloud'
          });
        }
      }
    } catch (bdcErr) {
      console.warn('BigDataCloud reverse geocoding failed:', bdcErr);
    }

    res.json({
      display_name: `Vị trí tại điểm đón (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`,
      source: 'coords'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for Driving Route & Distance Calculation (Goong Maps Direction API primary with Google & OSRM fallbacks)
app.get("/api/route", async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng, origin, destination } = req.query;
    if ((!startLat || !startLng || !endLat || !endLng) && (!origin || !destination)) {
      return res.status(400).json({ error: "Missing start or end location coordinates/addresses" });
    }

    const goongApiKey = (process.env.GOONG_API_KEY || "rudsCqy11hsus94Pxv1DgUTSB5EbRcMMcwY3Q4Ut").trim();

    // 1. Primary: Try Goong Maps Direction API
    if (goongApiKey && startLat && startLng && endLat && endLng) {
      try {
        const goongDirUrl = `https://rsapi.goong.io/Direction?origin=${startLat},${startLng}&destination=${endLat},${endLng}&vehicle=car&api_key=${goongApiKey}`;
        const goongRes = await fetch(goongDirUrl);
        const goongData = await goongRes.json();

        if (goongData.routes && goongData.routes[0] && goongData.routes[0].legs && goongData.routes[0].legs[0]) {
          const leg = goongData.routes[0].legs[0];
          const distanceMeters = leg.distance ? leg.distance.value : 0;
          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
          const durationSeconds = leg.duration ? leg.duration.value : 0;
          const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

          let routeGeometry: [number, number][] = [];
          if (goongData.routes[0].overview_polyline && goongData.routes[0].overview_polyline.points) {
            routeGeometry = decodeGooglePolyline(goongData.routes[0].overview_polyline.points);
          }

          return res.json({
            success: true,
            source: 'goong_directions',
            distanceMeters,
            distanceKm,
            distanceText: leg.distance ? leg.distance.text : `${distanceKm} km`,
            durationSeconds,
            durationMinutes,
            durationText: leg.duration ? leg.duration.text : `${durationMinutes} phút`,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            routeGeometry,
            routes: goongData.routes
          });
        }
      } catch (goongDirErr) {
        console.warn('Goong Direction API failed, trying Google/OSRM fallback:', goongDirErr);
      }
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY;

    // 2. Try Google Maps Directions API
    if (googleApiKey) {
      try {
        const originParam = (startLat && startLng) ? `${startLat},${startLng}` : encodeURIComponent(String(origin));
        const destParam = (endLat && endLng) ? `${endLat},${endLng}` : encodeURIComponent(String(destination));
        
        const googleDirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destParam}&mode=driving&language=vi&key=${googleApiKey}`;
        const gRes = await fetch(googleDirUrl);
        const gData = await gRes.json();

        if (gData.status === 'OK' && gData.routes && gData.routes[0] && gData.routes[0].legs && gData.routes[0].legs[0]) {
          const leg = gData.routes[0].legs[0];
          const distanceMeters = leg.distance ? leg.distance.value : 0;
          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
          const durationSeconds = leg.duration ? leg.duration.value : 0;
          const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

          let routeGeometry: [number, number][] = [];
          if (gData.routes[0].overview_polyline && gData.routes[0].overview_polyline.points) {
            routeGeometry = decodeGooglePolyline(gData.routes[0].overview_polyline.points);
          }

          return res.json({
            success: true,
            source: 'google_directions',
            distanceMeters,
            distanceKm,
            distanceText: leg.distance ? leg.distance.text : `${distanceKm} km`,
            durationSeconds,
            durationMinutes,
            durationText: leg.duration ? leg.duration.text : `${durationMinutes} phút`,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            routeGeometry,
            routes: gData.routes
          });
        }
      } catch (gErr) {
        console.warn('Google Directions API failed, trying OSRM fallback:', gErr);
      }
    }

    // 3. Fallback to OSRM Driving Route API
    if (startLat && startLng && endLat && endLng) {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distanceMeters = route.distance || 0;
        const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
        const durationSeconds = route.duration || 0;
        const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

        let routeGeometry: [number, number][] = [];
        if (route.geometry && Array.isArray(route.geometry.coordinates)) {
          routeGeometry = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        }

        return res.json({
          success: true,
          source: 'osrm',
          distanceMeters,
          distanceKm,
          distanceText: `${distanceKm} km`,
          durationSeconds,
          durationMinutes,
          durationText: `${durationMinutes} phút`,
          routeGeometry,
          routes: data.routes
        });
      }

      return res.json(data);
    }

    res.status(400).json({ error: "Could not calculate driving distance with given parameters" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Digital Asset Links for Android App Links verification
app.get("/.well-known/assetlinks.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(path.join(process.cwd(), "public", ".well-known", "assetlinks.json"));
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`D.GO - Gọi Lái 247 server running on http://localhost:${PORT}`);
  });
}

startServer();

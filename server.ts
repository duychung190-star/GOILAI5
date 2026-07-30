import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory database of bookings (for demonstration & dispatcher view)
const bookingsStore: any[] = [];

// Telegram Bot details
const TELEGRAM_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "8182785112:AAEO1WlI59qkaCDR1OuO00z2No6cTwk4acE").trim();
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || "-1003936078147").trim();

// Helper function to send Telegram notification
const sendTelegramNotification = async (bookingData: any) => {
  try {
    const formattedPrice = typeof bookingData.totalPrice === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalPrice || 0)
      : (bookingData.totalPrice || '0 ₫');

    const name = bookingData.customerName || bookingData.name || 'Khách hàng';
    const phone = bookingData.customerPhone || bookingData.phone || '';
    const pickup = bookingData.pickupAddress || bookingData.pickup || '';
    const dropoff = bookingData.destinationAddress || bookingData.dropoff || '';

    let text = `🚗 CÓ ĐƠN ĐẶT XE MỚI!\n` +
      `Khách: ${name} - ${phone}\n` +
      `Đón: ${pickup}\n` +
      `Đến: ${dropoff}\n` +
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
            text: text
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

// Create new booking
app.post("/api/booking", async (req, res) => {
  try {
    const bookingData = req.body;
    bookingData.id = bookingData.id || `DGO-${Date.now().toString().slice(-6)}`;
    bookingData.createdAt = Date.now();
    bookingData.status = bookingData.status || "PENDING";

    bookingsStore.unshift(bookingData);

    // Keep store capped at 100 items
    if (bookingsStore.length > 100) {
      bookingsStore.pop();
    }

    // Trigger Telegram notification
    const telegramResult = await sendTelegramNotification(bookingData);

    res.json({
      success: true,
      booking: bookingData,
      telegram: telegramResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all bookings
app.get("/api/bookings", (req, res) => {
  res.json({ success: true, bookings: bookingsStore });
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

// Proxy route for Nominatim OpenStreetMap Geocoding (search places in Vietnam)
app.get("/api/geocode/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json([]);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DGO-GoiLai247-App/1.0'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for Reverse Geocoding (lat, lng -> address string)
app.get("/api/geocode/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DGO-GoiLai247-App/1.0'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for OSRM Route (driving route between 2 lat/lng points)
app.get("/api/route", async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;
    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ error: "Missing start or end coordinates" });
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

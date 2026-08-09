import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, BookingRequest } from '../types';

/**
 * Service kết nối Cloud Firestore để quản lý Hồ sơ người dùng & Lịch sử đơn hàng
 */

function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore request timed out')), ms)
    ),
  ]);
}

// 1. Lưu hoặc Cập nhật Hồ sơ người dùng vào Firestore
export async function saveUserProfileToFirestore(userProfile: UserProfile): Promise<void> {
  try {
    if (!userProfile.phone) return;
    const cleanPhone = userProfile.phone.replace(/\D/g, '');
    if (!cleanPhone) return;

    const userDocRef = doc(db, 'users', cleanPhone);
    const dataToSave = {
      phone: cleanPhone,
      name: userProfile.name || '',
      email: userProfile.email || '',
      tier: userProfile.tier || 'MỚI',
      tripsCount: userProfile.tripsCount || 0,
      totalSpent: userProfile.totalSpent || 0,
      loyaltyPoints: userProfile.loyaltyPoints || 0,
      loyaltyScorePercent: userProfile.loyaltyScorePercent || 85,
      createdAt: userProfile.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    await withTimeout(setDoc(userDocRef, dataToSave, { merge: true }));
  } catch (err: any) {
    if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 'permission-denied') {
      console.log('[Firestore Service] Permission denied or API disabled, using local state.');
    } else {
      console.log('[Firestore Service] Unreachable or offline when saving profile:', err?.message || err);
    }
  }
}

// 2. Lấy Hồ sơ người dùng từ Firestore
export async function getUserProfileFromFirestore(phone: string): Promise<UserProfile | null> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return null;

    const userDocRef = doc(db, 'users', cleanPhone);
    const snap = await withTimeout(getDoc(userDocRef));

    if (snap.exists()) {
      const data = snap.data();
      return {
        phone: data.phone || cleanPhone,
        name: data.name || '',
        email: data.email || '',
        tier: data.tier || 'MỚI',
        tripsCount: data.tripsCount || 0,
        totalSpent: data.totalSpent || 0,
        loyaltyPoints: data.loyaltyPoints || 0,
        loyaltyScorePercent: data.loyaltyScorePercent || 85,
        createdAt: data.createdAt || Date.now()
      } as UserProfile;
    }
  } catch (err: any) {
    if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 'permission-denied') {
      console.log('[Firestore Service] Permission denied or API disabled when loading profile.');
    } else {
      console.log('[Firestore Service] Unreachable or offline when loading profile:', err?.message || err);
    }
  }
  return null;
}

// 3. Lấy Lịch sử Đặt xe từ Firestore
export async function getUserBookingHistoryFromFirestore(phone: string): Promise<BookingRequest[]> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return [];

    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('customerPhoneClean', '==', cleanPhone)
    );

    const snap = await withTimeout(getDocs(q));
    const bookings: BookingRequest[] = [];

    snap.forEach((docSnap) => {
      bookings.push(docSnap.data() as BookingRequest);
    });

    // Sắp xếp theo thời gian mới nhất
    return bookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err: any) {
    if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 'permission-denied') {
      console.log('[Firestore Service] Permission denied or API disabled when loading booking history.');
    } else {
      console.log('[Firestore Service] Unreachable or offline when loading booking history:', err?.message || err);
    }
    return [];
  }
}

// 4. Đồng bộ đầy đủ thông tin từ Firestore (Hồ sơ + Lịch sử đơn)
export async function syncUserFromFirestore(loginUser: UserProfile): Promise<{ user: UserProfile; orderHistory: BookingRequest[] }> {
  const cleanPhone = (loginUser.phone || '').replace(/\D/g, '');

  try {
    // Lưu bản ghi mới nhất vào Firestore
    await saveUserProfileToFirestore(loginUser);

    // Lấy dữ liệu từ Firestore
    const fsUser = await getUserProfileFromFirestore(cleanPhone);
    const orderHistory = await getUserBookingHistoryFromFirestore(cleanPhone);

    const mergedTripsCount = Math.max(
      loginUser.tripsCount || 0,
      fsUser?.tripsCount || 0,
      orderHistory.length
    );

    let updatedTier: 'MỚI' | 'THÂN THIẾT' | 'VIP' | 'KIM CƯƠNG' = 'MỚI';
    if (mergedTripsCount >= 10) updatedTier = 'KIM CƯƠNG';
    else if (mergedTripsCount >= 5) updatedTier = 'VIP';
    else if (mergedTripsCount >= 2) updatedTier = 'THÂN THIẾT';

    const mergedUser: UserProfile = {
      ...loginUser,
      ...(fsUser || {}),
      name: loginUser.name || fsUser?.name || '',
      phone: cleanPhone || loginUser.phone,
      tripsCount: mergedTripsCount,
      tier: updatedTier,
      loyaltyPoints: mergedTripsCount * 10,
      loyaltyScorePercent: Math.min(99, 85 + mergedTripsCount * 3)
    };

    // Cập nhật lại bản ghi chuẩn hóa lên Firestore
    await saveUserProfileToFirestore(mergedUser);

    return {
      user: mergedUser,
      orderHistory
    };
  } catch (e) {
    return {
      user: loginUser,
      orderHistory: []
    };
  }
}

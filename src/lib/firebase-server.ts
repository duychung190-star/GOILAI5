import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfigData.firestoreDatabaseId || '(default)');

function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
}

function isExpectedFirestoreError(err: any): boolean {
  const msg = err?.message || String(err || '');
  const code = err?.code || '';
  return (
    msg.includes('offline') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('Cloud Firestore API') ||
    msg.includes('timed out') ||
    msg.includes('Failed to fetch') ||
    msg.includes('fetch') ||
    code === 'unavailable' ||
    code === 'permission-denied'
  );
}

export async function getFirestoreUser(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return null;
    const userRef = doc(db, 'users', cleanPhone);
    const snap = await withTimeout(getDoc(userRef));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log(`[Firestore Server] Offline/Permission check for user ${phone}, using memory cache.`);
    } else {
      console.warn('[Firestore Server] Error getting user:', err?.message || err);
    }
  }
  return null;
}

export async function saveFirestoreUser(phone: string, userData: any) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return;
    const userRef = doc(db, 'users', cleanPhone);
    await withTimeout(setDoc(userRef, { ...userData, updatedAt: Date.now() }, { merge: true }));
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log(`[Firestore Server] Offline/Permission check saving user ${phone}.`);
    } else {
      console.warn('[Firestore Server] Error saving user:', err?.message || err);
    }
  }
}

export async function incrementFirestoreUserOrderCount(phone: string, name?: string): Promise<number> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return 1;

    const userRef = doc(db, 'users', cleanPhone);
    const snap = await withTimeout(getDoc(userRef));

    let currentCount = 0;
    if (snap.exists()) {
      const data = snap.data();
      currentCount = data.totalOrdersCount ?? data.tripsCount ?? 0;
    }

    const newCount = currentCount + 1;

    const updateData: any = {
      phoneNumber: cleanPhone,
      phone: cleanPhone,
      totalOrdersCount: newCount,
      tripsCount: newCount,
      updatedAt: Date.now()
    };

    if (name) {
      updateData.fullName = name.trim();
      updateData.name = name.trim();
    }

    if (!snap.exists()) {
      updateData.createdAt = Date.now();
    }

    await withTimeout(setDoc(userRef, updateData, { merge: true }));
    return newCount;
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log(`[Firestore Server] Offline/Permission check incrementing order count for ${phone}.`);
    } else {
      console.warn('[Firestore Server] Error incrementing order count:', err?.message || err);
    }
    return 1;
  }
}

export async function updateFirestoreBookingStatus(bookingId: string, status: string, driverAssigned?: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const rideRef = doc(db, 'rides', bookingId);
    const updateData: any = {
      status,
      updatedAt: Date.now()
    };
    if (driverAssigned) {
      updateData.driverAssigned = driverAssigned;
    }
    await Promise.all([
      withTimeout(setDoc(bookingRef, updateData, { merge: true })),
      withTimeout(setDoc(rideRef, { ...updateData, rideId: bookingId, bookingId }, { merge: true }))
    ]);
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log(`[Firestore Server] Offline/Permission check updating status for ${bookingId}.`);
    } else {
      console.warn('[Firestore Server] Error updating booking status:', err?.message || err);
    }
  }
}

export async function saveFirestoreBooking(bookingData: any) {
  try {
    const bookingRef = doc(db, 'bookings', bookingData.id);
    const rideRef = doc(db, 'rides', bookingData.id);
    const cleanPhone = (bookingData.phoneNumber || bookingData.customerPhone || '').replace(/\D/g, '');
    
    const docData = {
      bookingId: bookingData.id,
      id: bookingData.id,
      phoneNumber: cleanPhone || bookingData.customerPhone,
      customerPhone: bookingData.customerPhone,
      customerName: bookingData.customerName || bookingData.fullName || 'Khách hàng',
      pickupLocation: bookingData.pickupLocation || bookingData.pickupAddress,
      pickupAddress: bookingData.pickupAddress,
      dropoffLocation: bookingData.dropoffLocation || bookingData.destinationAddress,
      destinationAddress: bookingData.destinationAddress,
      distanceKm: bookingData.distanceKm || 0,
      totalPrice: bookingData.totalPrice || 0,
      orderIndex: bookingData.orderIndex || bookingData.totalOrdersCount || 1,
      totalOrdersCount: bookingData.orderIndex || bookingData.totalOrdersCount || 1,
      status: bookingData.status || 'PENDING',
      vehicleType: bookingData.vehicleType,
      noteForDriver: bookingData.noteForDriver || '',
      createdAt: bookingData.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    await Promise.all([
      withTimeout(setDoc(bookingRef, docData, { merge: true })),
      withTimeout(setDoc(rideRef, docData, { merge: true }))
    ]);
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log(`[Firestore Server] Offline/Permission check saving booking ${bookingData.id}.`);
    } else {
      console.warn('[Firestore Server] Error saving booking:', err?.message || err);
    }
  }
}

export async function saveFirestoreRating(ratingData: any) {
  try {
    const ratingRef = doc(db, 'ratings', ratingData.id);
    await withTimeout(setDoc(ratingRef, { ...ratingData, updatedAt: Date.now() }));
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log(`[Firestore Server] Offline/Permission check saving rating ${ratingData.id}.`);
    } else {
      console.warn('[Firestore Server] Error saving rating:', err?.message || err);
    }
  }
}

export async function getFirestoreRatings() {
  try {
    const ratingsRef = collection(db, 'ratings');
    const snap = await withTimeout(getDocs(ratingsRef));
    const list: any[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log('[Firestore Server] Offline/Permission check fetching ratings, using local sample ratings.');
    } else {
      console.warn('[Firestore Server] Error fetching ratings:', err?.message || err);
    }
    return [];
  }
}

export async function getFirestoreUserBookingsCount(phone: string): Promise<number> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return 0;
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('customerPhoneClean', '==', cleanPhone));
    const snap = await withTimeout(getDocs(q));
    return snap.size;
  } catch (err: any) {
    if (isExpectedFirestoreError(err)) {
      console.log(`[Firestore Server] Offline/Permission check querying bookings count for ${phone}.`);
    } else {
      console.warn('[Firestore Server] Error querying user bookings count:', err?.message || err);
    }
    return 0;
  }
}

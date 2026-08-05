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
    if (err?.message?.includes('offline') || err?.code === 'unavailable' || err?.message?.includes('timed out')) {
      // Quietly return null to fallback to memory store
      console.log(`[Firestore Server] Offline or timeout fetching user ${phone}, using memory cache.`);
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
    if (err?.message?.includes('offline') || err?.code === 'unavailable' || err?.message?.includes('timed out')) {
      console.log(`[Firestore Server] Offline or timeout saving user ${phone}.`);
    } else {
      console.warn('[Firestore Server] Error saving user:', err?.message || err);
    }
  }
}

export async function saveFirestoreBooking(bookingData: any) {
  try {
    const bookingRef = doc(db, 'bookings', bookingData.id);
    await withTimeout(setDoc(bookingRef, { ...bookingData, updatedAt: Date.now() }));
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable' || err?.message?.includes('timed out')) {
      console.log(`[Firestore Server] Offline or timeout saving booking ${bookingData.id}.`);
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
    if (err?.message?.includes('offline') || err?.code === 'unavailable' || err?.message?.includes('timed out')) {
      console.log(`[Firestore Server] Offline or timeout saving rating ${ratingData.id}.`);
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
    if (err?.message?.includes('offline') || err?.code === 'unavailable' || err?.message?.includes('timed out')) {
      console.log('[Firestore Server] Offline or timeout fetching ratings, using local sample ratings.');
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
    if (err?.message?.includes('offline') || err?.code === 'unavailable' || err?.message?.includes('timed out')) {
      console.log(`[Firestore Server] Offline or timeout querying bookings count for ${phone}.`);
    } else {
      console.warn('[Firestore Server] Error querying user bookings count:', err?.message || err);
    }
    return 0;
  }
}

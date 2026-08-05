import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
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
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || '(default)');

export async function getFirestoreUser(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return null;
    const userRef = doc(db, 'users', cleanPhone);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('[Firestore] Error getting user:', err);
  }
  return null;
}

export async function saveFirestoreUser(phone: string, userData: any) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return;
    const userRef = doc(db, 'users', cleanPhone);
    await setDoc(userRef, { ...userData, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving user:', err);
  }
}

export async function saveFirestoreBooking(bookingData: any) {
  try {
    const bookingRef = doc(db, 'bookings', bookingData.id);
    await setDoc(bookingRef, { ...bookingData, updatedAt: Date.now() });
  } catch (err) {
    console.warn('[Firestore] Error saving booking:', err);
  }
}

export async function saveFirestoreRating(ratingData: any) {
  try {
    const ratingRef = doc(db, 'ratings', ratingData.id);
    await setDoc(ratingRef, { ...ratingData, updatedAt: Date.now() });
  } catch (err) {
    console.warn('[Firestore] Error saving rating:', err);
  }
}

export async function getFirestoreRatings() {
  try {
    const ratingsRef = collection(db, 'ratings');
    const snap = await getDocs(ratingsRef);
    const list: any[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err) {
    console.warn('[Firestore] Error fetching ratings:', err);
    return [];
  }
}

export async function getFirestoreUserBookingsCount(phone: string): Promise<number> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return 0;
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('customerPhoneClean', '==', cleanPhone));
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.warn('[Firestore] Error querying user bookings count:', err);
    return 0;
  }
}

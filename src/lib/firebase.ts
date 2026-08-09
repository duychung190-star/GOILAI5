import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
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
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfigData.firestoreDatabaseId || '(default)');

// Ensure Firebase Auth session exists
export async function ensureFirebaseAuth(): Promise<FirebaseUser | null> {
  try {
    if (auth.currentUser) return auth.currentUser;
    const userCred = await signInAnonymously(auth);
    return userCred.user;
  } catch (err) {
    console.warn('[Firebase Auth] Anonymous sign-in notice:', err);
    return null;
  }
}

// Fetch user profile from Cloud Firestore by phone number
export async function fetchFirestoreUserProfile(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return null;
    const userRef = doc(db, 'users', cleanPhone);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err: any) {
    if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 'permission-denied') {
      console.log('[Firestore] API disabled or permission denied, using local storage.');
    } else {
      console.warn('[Firestore] Notice fetching user profile:', err?.message || err);
    }
  }
  return null;
}

// Subscribe to real-time updates for user profile and trip count
export function subscribeToUserTripCount(phone: string, callback: (data: any) => void) {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return () => {};
  const userRef = doc(db, 'users', cleanPhone);
  
  try {
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    }, (err: any) => {
      if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 'permission-denied') {
        console.log('[Firestore] Realtime subscription disabled (Permission Denied). Unsubscribing.');
        if (typeof unsubscribe === 'function') unsubscribe();
      } else {
        console.warn('[Firestore] Notice in user trip count subscription:', err?.message || err);
      }
    });
    return unsubscribe;
  } catch (err) {
    console.log('[Firestore] Unable to subscribe to trip count:', err);
    return () => {};
  }
}

export default app;


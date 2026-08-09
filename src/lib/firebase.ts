import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Helper to resolve Firebase environment variables on Vercel/Node/Vite or fallback to config JSON
const getEnvVar = (envKey: string, fallback: string = '') => {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
  const processEnv = typeof process !== 'undefined' ? process.env || {} : {};

  return (
    processEnv[envKey] ||
    metaEnv[envKey] ||
    metaEnv[`VITE_${envKey}`] ||
    processEnv[`VITE_${envKey}`] ||
    fallback
  );
};

const firebaseConfig = {
  apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY', firebaseConfigData.apiKey),
  authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN', firebaseConfigData.authDomain),
  projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID', firebaseConfigData.projectId),
  storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET', firebaseConfigData.storageBucket),
  messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', firebaseConfigData.messagingSenderId),
  appId: getEnvVar('REACT_APP_FIREBASE_APP_ID', firebaseConfigData.appId),
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = initializeFirestore(
  app,
  { experimentalForceLongPolling: true },
  firebaseConfigData.firestoreDatabaseId || '(default)'
);

export const ensureFirebaseAuth = async () => {
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Converts Vietnamese phone number to fake email identifier for Firebase Auth: {sdt}@dgo247.com
 */
export function phoneToAuthEmail(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `${cleanPhone}@dgo247.com`;
}

/**
 * Register a new customer with Firebase Auth and initialize document in Cloud Firestore
 */
export async function registerCustomerWithFirebase(fullName: string, phoneNumber: string, password: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const email = phoneToAuthEmail(cleanPhone);

  // 1. Create user on Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Create document in Cloud Firestore `users/{phoneNumber}`
  const userRef = doc(db, 'users', cleanPhone);
  const userData = {
    fullName: fullName.trim(),
    name: fullName.trim(),
    phoneNumber: cleanPhone,
    phone: cleanPhone,
    totalOrdersCount: 0,
    tripsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: Date.now()
  };

  await setDoc(userRef, userData, { merge: true });

  return {
    firebaseUser: userCredential.user,
    profile: {
      ...userData,
      createdAt: Date.now()
    }
  };
}

/**
 * Login customer with Firebase Auth and load user document from Cloud Firestore
 */
export async function loginCustomerWithFirebase(phoneNumber: string, password: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const email = phoneToAuthEmail(cleanPhone);

  // 1. Authenticate with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // 2. Read document from Firestore `users/{phoneNumber}`
  const userRef = doc(db, 'users', cleanPhone);
  const snap = await getDoc(userRef);

  let profileData: any = {
    fullName: '',
    name: '',
    phoneNumber: cleanPhone,
    phone: cleanPhone,
    totalOrdersCount: 0,
    tripsCount: 0,
    createdAt: Date.now()
  };

  if (snap.exists()) {
    profileData = snap.data();
  } else {
    // If user exists in Auth but not Firestore document, create it
    await setDoc(userRef, profileData, { merge: true });
  }

  return {
    firebaseUser: userCredential.user,
    profile: profileData
  };
}

/**
 * Logout customer from Firebase Auth
 */
export async function logoutCustomerFromFirebase() {
  await signOut(auth);
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



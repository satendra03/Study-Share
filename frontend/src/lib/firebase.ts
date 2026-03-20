import { env } from "../config/env.config";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Guard against re-initialization on Next.js hot reloads in development
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth works on both server and client
const auth = getAuth(app);

/**
 * Analytics ONLY works in the browser — it uses window, navigator, etc.
 * Next.js renders on the server first, so we must never call getAnalytics()
 * at module load time. Call this function instead, and only from client components.
 *
 * Example usage:
 *   import { getFirebaseAnalytics } from '@/src/lib/firebase';
 *   const analytics = getFirebaseAnalytics();
 *   if (analytics) logEvent(analytics, 'page_view');
 */
let analyticsInstance: Analytics | null = null;

export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null; // server-side — skip
  if (!env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null; // analytics not configured
  if (!analyticsInstance) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
}

import { getStorage } from "firebase/storage";

export const storage = getStorage(app);

export { app, auth };

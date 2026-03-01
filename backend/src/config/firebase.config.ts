// Firebase Admin configuration
import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";

console.log();
console.log("🔥 Loading firebase.config.ts...");

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Handles service account credential validation and app initialization
 */
function initializeFirebase(): void {
  if (firebaseInitialized || admin.apps.length > 0) {
    console.log("✅ Firebase already initialized");
    return;
  }

  try {
    const adminKey = process.env.FIREBASE_ADMIN_KEY;

    if (!adminKey) {
      console.error("❌ FIREBASE_ADMIN_KEY is undefined in environment variables");
      throw new Error("FIREBASE_ADMIN_KEY is required");
    }

    console.log("🔑 Initializing Firebase Admin SDK...");

    // Parse and validate service account
    const serviceAccount = JSON.parse(adminKey) as ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
    // console.log(`📍 Project ID: ${serviceAccount.project_id || "unknown"}`);
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error);
    process.exit(1);
  }
}

/**
 * Get Firebase Auth instance
 */
function getFirebaseAuth(): admin.auth.Auth {
  if (!firebaseInitialized || !admin.apps.length) {
    initializeFirebase();
  }
  return admin.auth();
}

/**
 * Get Firestore instance
 */
function getFirebaseFirestore(): admin.firestore.Firestore {
  if (!firebaseInitialized || !admin.apps.length) {
    initializeFirebase();
  }
  return admin.firestore();
}

/**
 * Check Firebase initialization status
 */
function isFirebaseInitialized(): boolean {
  return firebaseInitialized && admin.apps.length > 0;
}

// Initialize on import
initializeFirebase();

const auth: admin.auth.Auth = getFirebaseAuth();
const db: admin.firestore.Firestore = getFirebaseFirestore();

export {
  admin,
  auth,
  db,
  initializeFirebase,
  getFirebaseAuth,
  getFirebaseFirestore,
  isFirebaseInitialized,
};

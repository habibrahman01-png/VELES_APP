import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

const firebaseAdminSetupError =
  "Firebase Admin environment variables are not set. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET in .env.local";

let cachedAdminApp: ReturnType<typeof initializeApp> | null = null;

export function getFirebaseAdminSetupError() {
  return firebaseAdminSetupError;
}

export function isFirebaseAdminConfigured() {
  return Boolean(projectId && clientEmail && privateKey && storageBucket);
}

function ensureFirebaseAdminConfig() {
  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(firebaseAdminSetupError);
  }
}

export function getAdminApp() {
  ensureFirebaseAdminConfig();

  if (cachedAdminApp) {
    return cachedAdminApp;
  }

  cachedAdminApp =
    getApps().length === 0
      ? initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          }),
          storageBucket
        })
      : getApps()[0]!;

  return cachedAdminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminStorage() {
  return getStorage(getAdminApp()).bucket();
}

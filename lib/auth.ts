import { cookies } from "next/headers";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { UserProfile } from "@/lib/types";

const sessionCookieName = process.env.SESSION_COOKIE_NAME || "__session";

export async function getServerSession() {
  let adminAuth;

  try {
    adminAuth = getAdminAuth();
  } catch (error) {
    console.error("Firebase Admin auth is unavailable while reading the server session.", error);
    return null;
  }

  const token = cookies().get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }

  try {
    return await adminAuth.verifySessionCookie(token, true);
  } catch {
    return null;
  }
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function getCurrentUserProfile() {
  let adminDb;

  try {
    adminDb = getAdminDb();
  } catch (error) {
    console.error("Firebase Admin Firestore is unavailable while loading the current user profile.", error);
    return null;
  }

  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const snapshot = await adminDb.collection("users").doc(session.uid).get();
  if (!snapshot.exists) {
    return null;
  }

  return { id: snapshot.id, ...(snapshot.data() as Omit<UserProfile, "id">) };
}

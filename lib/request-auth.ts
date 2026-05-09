import { NextRequest } from "next/server";

import { getAdminAuth } from "@/lib/firebase-admin";

const sessionCookieName = process.env.SESSION_COOKIE_NAME || "__session";

export async function getRequestSession(request: NextRequest) {
  let adminAuth;

  try {
    adminAuth = getAdminAuth();
  } catch (error) {
    console.error("Firebase Admin auth is unavailable while verifying a request session.", error);
    return null;
  }

  const token = request.cookies.get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }

  try {
    return await adminAuth.verifySessionCookie(token, true);
  } catch {
    return null;
  }
}

export async function requireAdminRequest(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session || session.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireAuthenticatedRequest(request: NextRequest) {
  const session = await getRequestSession(request);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

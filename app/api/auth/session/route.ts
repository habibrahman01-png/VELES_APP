import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebase-admin";

const sessionCookieName = process.env.SESSION_COOKIE_NAME || "__session";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const expiresIn = 1000 * 60 * 60 * 24 * 5;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({
      ok: true,
      role: decodedToken.role === "ADMIN" ? "ADMIN" : "USER"
    });
    response.cookies.set(sessionCookieName, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Unable to create the Firebase session cookie.", error);
    return NextResponse.json({ error: "Unable to start a secure session." }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/"
  });
  return response;
}

import { NextResponse } from "next/server";

const sessionCookieName = process.env.SESSION_COOKIE_NAME || "__session";

export async function POST() {
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

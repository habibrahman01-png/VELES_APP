import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

// One-time admin bootstrap:
// 1. Sign up normally at /signup.
// 2. Find your UID in Firebase Console -> Authentication.
// 3. Send a POST request to this endpoint with { "uid": "YOUR_UID" }
//    and the x-admin-secret header set to ADMIN_SECRET.
// 4. Sign out and sign back in so the refreshed ID token includes role: "ADMIN".
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-admin-secret");
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    await adminAuth.setCustomUserClaims(uid, { role: "ADMIN" });
    await adminDb.collection("users").doc(uid).set({ role: "ADMIN" }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to assign the ADMIN custom claim.", error);
    return NextResponse.json({ error: "Unable to set the admin role." }, { status: 503 });
  }
}

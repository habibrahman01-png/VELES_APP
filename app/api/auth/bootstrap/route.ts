import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const { idToken, name, email } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const role = decoded.role === "ADMIN" ? "ADMIN" : "USER";

    await adminDb.collection("users").doc(decoded.uid).set(
      {
        name: name || decoded.name || "VELES Customer",
        email: email || decoded.email || "",
        role,
        createdAt: FieldValue.serverTimestamp(),
        defaultAddressId: ""
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to bootstrap the user profile document.", error);
    return NextResponse.json({ error: "Unable to prepare the account." }, { status: 503 });
  }
}

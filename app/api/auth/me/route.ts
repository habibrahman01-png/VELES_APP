import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    uid: session.uid,
    email: session.email || "",
    role: session.role === "ADMIN" ? "ADMIN" : "USER"
  });
}

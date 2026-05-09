import { NextRequest, NextResponse } from "next/server";

import { FULFILLMENT_STATUSES } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminRequest } from "@/lib/request-auth";

interface Context {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fulfillmentStatus } = await request.json();

  if (!FULFILLMENT_STATUSES.includes(fulfillmentStatus)) {
    return NextResponse.json({ error: "Invalid fulfillment status" }, { status: 400 });
  }

  await getAdminDb().collection("orders").doc(params.id).set(
    {
      fulfillmentStatus
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}

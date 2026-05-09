import { NextRequest, NextResponse } from "next/server";

import { CATEGORIES, PRODUCT_TYPES } from "@/lib/constants";
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

  try {
    const payload = await request.json();

    if ("category" in payload && !CATEGORIES.includes(payload.category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    if ("productType" in payload && !PRODUCT_TYPES.includes(payload.productType)) {
      return NextResponse.json({ error: "Invalid product type." }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const productRef = adminDb.collection("products").doc(params.id);
    const updatePayload: Record<string, unknown> = {};

    for (const key of ["name", "slug", "description", "category", "productType", "price", "compareAtPrice", "images", "isActive"]) {
      if (key in payload) {
        updatePayload[key] = payload[key];
      }
    }

    await productRef.set(
      updatePayload,
      { merge: true }
    );

    await Promise.all(
      (payload.variants || []).map((variant: { size: string; stock: number }) =>
        productRef.collection("variants").doc(variant.size).set(
          {
            size: variant.size,
            stock: variant.stock
          },
          { merge: true }
        )
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to update the product document.", error);
    return NextResponse.json({ error: "Unable to update the product." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getAdminDb().collection("products").doc(params.id).set(
      {
        isDeleted: true
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to delete the product document.", error);
    return NextResponse.json({ error: "Unable to delete the product." }, { status: 500 });
  }
}

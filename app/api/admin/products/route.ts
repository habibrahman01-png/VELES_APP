import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { CATEGORIES, PRODUCT_TYPES } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminRequest } from "@/lib/request-auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();

    if (!CATEGORIES.includes(payload.category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    if (!PRODUCT_TYPES.includes(payload.productType)) {
      return NextResponse.json({ error: "Invalid product type." }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const productRef = adminDb.collection("products").doc(payload.id);

    await productRef.set({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      category: payload.category,
      productType: payload.productType,
      price: payload.price,
      compareAtPrice: payload.compareAtPrice,
      images: payload.images,
      isActive: payload.isActive,
      isDeleted: false,
      createdAt: FieldValue.serverTimestamp()
    });

    await Promise.all(
      (payload.variants || []).map((variant: { size: string; stock: number }) =>
        productRef.collection("variants").doc(variant.size).set({
          size: variant.size,
          stock: variant.stock
        })
      )
    );

    return NextResponse.json({ ok: true, id: productRef.id });
  } catch (error) {
    console.error("Unable to create the product document.", error);
    return NextResponse.json({ error: "Unable to create the product." }, { status: 500 });
  }
}

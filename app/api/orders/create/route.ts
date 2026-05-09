import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase-admin";
import { getRequestSession } from "@/lib/request-auth";
import { getStripe } from "@/lib/stripe";
import { CartItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = getAdminDb();

  const { items, addressSnapshot, paymentIntentId } = await request.json();

  if (!Array.isArray(items) || !items.length || !addressSnapshot || !paymentIntentId) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  const existing = await adminDb.collection("orders").where("stripePaymentIntentId", "==", paymentIntentId).limit(1).get();
  if (!existing.empty) {
    return NextResponse.json({ id: existing.docs[0].id, ok: true });
  }

  const userSnapshot = await adminDb.collection("users").doc(session.uid).get();
  const customerName = userSnapshot.data()?.name || session.name || "VELES Customer";
  const orderRef = adminDb.collection("orders").doc();
  const total = (items as CartItem[]).reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
  const paymentStatus = paymentIntent.status === "succeeded" ? "PAID" : paymentIntent.status === "canceled" ? "FAILED" : "PENDING";

  try {
    await adminDb.runTransaction(async (transaction) => {
      for (const item of items as CartItem[]) {
        const variantRef = adminDb.collection("products").doc(item.productId).collection("variants").doc(item.size);
        const variantSnapshot = await transaction.get(variantRef);

        if (!variantSnapshot.exists) {
          throw new Error(`Variant ${item.size} not found for product ${item.productId}`);
        }

        const currentStock = Number(variantSnapshot.data()?.stock || 0);
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName} in size ${item.size}`);
        }

        transaction.update(variantRef, {
          stock: currentStock - item.quantity
        });
      }

      transaction.set(orderRef, {
        userId: session.uid,
        customerName,
        addressSnapshot,
        stripePaymentIntentId: paymentIntentId,
        paymentStatus,
        fulfillmentStatus: "PENDING",
        total,
        createdAt: FieldValue.serverTimestamp(),
        items: items.map((item: CartItem) => ({
          productId: item.productId,
          productName: item.productName,
          imageUrl: item.imageUrl,
          size: item.size,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase
        }))
      });
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Order creation failed" }, { status: 409 });
  }

  return NextResponse.json({ ok: true, id: orderRef.id });
}

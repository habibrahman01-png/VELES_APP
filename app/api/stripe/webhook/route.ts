import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const adminDb = getAdminDb();
    const draftOrderId = paymentIntent.metadata.draftOrderId;

    if (!draftOrderId) {
      return NextResponse.json({ received: true });
    }

    const draftRef = adminDb.collection("checkoutDrafts").doc(draftOrderId);

    if (event.type === "payment_intent.payment_failed") {
      await draftRef.set(
        {
          paymentStatus: "FAILED",
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
      return NextResponse.json({ received: true });
    }

    const existingOrderSnapshot = await adminDb.collection("orders").where("stripePaymentIntentId", "==", paymentIntent.id).limit(1).get();
    if (!existingOrderSnapshot.empty) {
      return NextResponse.json({ received: true });
    }

    await adminDb.runTransaction(async (transaction) => {
      const draftSnapshot = await transaction.get(draftRef);
      if (!draftSnapshot.exists) {
        throw new Error("Checkout draft not found.");
      }

      const draftData = draftSnapshot.data() as {
        userId: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        shippingAddress: {
          fullName: string;
          email: string;
          phone: string;
          line1: string;
          line2?: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
        items: Array<{
          productId: string;
          productName: string;
          productType: string;
          category: string;
          imageUrl: string;
          size: string;
          quantity: number;
          priceAtPurchase: number;
        }>;
        subtotal: number;
        shippingCost: number;
        total: number;
      };

      for (const item of draftData.items) {
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

      const orderRef = adminDb.collection("orders").doc();

      transaction.set(orderRef, {
        orderId: orderRef.id,
        userId: draftData.userId || "guest",
        customerName: draftData.customerName,
        customerEmail: draftData.customerEmail,
        customerPhone: draftData.customerPhone,
        shippingAddress: draftData.shippingAddress,
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "PAID",
        fulfillmentStatus: "PENDING",
        items: draftData.items,
        subtotal: draftData.subtotal,
        shippingCost: draftData.shippingCost,
        total: draftData.total,
        createdAt: FieldValue.serverTimestamp()
      });

      transaction.set(
        draftRef,
        {
          paymentStatus: "PAID",
          orderId: orderRef.id,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    });
  }

  return NextResponse.json({ received: true });
}

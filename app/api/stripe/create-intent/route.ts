import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase-admin";
import { getRequestSession } from "@/lib/request-auth";
import { getStripe } from "@/lib/stripe";
import { CartItem } from "@/lib/types";

const shippingCost = 0;

interface ShippingAddressPayload {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CustomerDetailsPayload {
  fullName: string;
  email: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items, customerDetails, shippingAddress } = (await request.json()) as {
    items?: CartItem[];
    customerDetails?: CustomerDetailsPayload;
    shippingAddress?: ShippingAddressPayload;
  };

  if (!Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (
    !customerDetails?.fullName?.trim() ||
    !customerDetails.email?.trim() ||
    !customerDetails.phone?.trim() ||
    !shippingAddress?.line1?.trim() ||
    !shippingAddress.city?.trim() ||
    !shippingAddress.state?.trim() ||
    !shippingAddress.postalCode?.trim() ||
    !shippingAddress.country?.trim()
  ) {
    return NextResponse.json({ error: "Complete your shipping details before paying." }, { status: 400 });
  }

  const subtotal = Number(
    items.reduce((sum: number, item: CartItem) => sum + item.priceAtPurchase * item.quantity, 0).toFixed(2)
  );
  const total = Number((subtotal + shippingCost).toFixed(2));
  const adminDb = getAdminDb();
  const draftRef = adminDb.collection("checkoutDrafts").doc();

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      draftOrderId: draftRef.id,
      userId: session.uid
    }
  });

  await draftRef.set({
    userId: session.uid,
    customerName: customerDetails.fullName.trim(),
    customerEmail: customerDetails.email.trim(),
    customerPhone: customerDetails.phone.trim(),
    shippingAddress: {
      fullName: customerDetails.fullName.trim(),
      email: customerDetails.email.trim(),
      phone: customerDetails.phone.trim(),
      line1: shippingAddress.line1.trim(),
      line2: shippingAddress.line2?.trim() || "",
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      country: shippingAddress.country.trim()
    },
    stripePaymentIntentId: paymentIntent.id,
    paymentStatus: "PENDING",
    fulfillmentStatus: "PENDING",
    subtotal,
    shippingCost,
    total,
    items: items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productType: item.productType,
      category: item.category,
      imageUrl: item.imageUrl,
      size: item.size,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase
    })),
    createdAt: FieldValue.serverTimestamp()
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  });
}

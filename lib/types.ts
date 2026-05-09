import { Timestamp } from "firebase/firestore";

import { CATEGORIES, FULFILLMENT_STATUSES, MATERIAL_FILTERS, PAYMENT_STATUSES, PRODUCT_TYPES, SIZES } from "@/lib/constants";

export type Category = (typeof CATEGORIES)[number];
export type MaterialFilter = (typeof MATERIAL_FILTERS)[number];
export type ProductType = (typeof PRODUCT_TYPES)[number];
export type Size = (typeof SIZES)[number];
export type UserRole = "USER" | "ADMIN";
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp | Date | string;
  defaultAddressId?: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  size: Size;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: Category;
  productType: ProductType;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Timestamp | Date | string;
  variants?: ProductVariant[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productType: ProductType;
  category: Category;
  imageUrl: string;
  size: Size;
  quantity: number;
  priceAtPurchase: number;
}

export interface ShippingAddressSnapshot {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderId?: string;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: ShippingAddressSnapshot;
  addressSnapshot?: Omit<Address, "id" | "userId">;
  stripePaymentIntentId: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal?: number;
  shippingCost?: number;
  total: number;
  createdAt: Timestamp | Date | string;
  items: OrderItem[];
}

export interface CartItem extends OrderItem {
  slug: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
  addedAt?: Timestamp | Date | string | null;
}

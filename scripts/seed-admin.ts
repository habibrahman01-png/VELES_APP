import { FieldValue } from "firebase-admin/firestore";

import { SIZES } from "../lib/constants";
import { getAdminAuth, getAdminDb } from "../lib/firebase-admin";
import { slugify } from "../lib/utils";

const adminEmail = "admin@leatherstore.com";
const adminPassword = "Admin@123456";
const sentinelProductSlug = "classic-black-biker-jacket";

type Category = "Men" | "Women" | "Accessories";
type ProductType =
  | "Genuine Leather Jacket"
  | "Non-Leather Jacket"
  | "Plant-Based Leather Jacket"
  | "Leather Purse"
  | "Plant-Based Leather Purse";
type Size = (typeof SIZES)[number];
type PaymentStatus = "PENDING" | "PAID" | "FAILED";
type FulfillmentStatus = "PENDING" | "PROCESSING" | "DISPATCHED" | "DELIVERED";

interface SeedProduct {
  name: string;
  description: string;
  category: Category;
  productType: ProductType;
  price: number;
  compareAtPrice?: number;
  images: string[];
  stockBySize: Record<Size, number>;
}

interface SeededProductRecord {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: Category;
  productType: ProductType;
  imageUrl: string;
}

interface SeedOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingCost: number;
  items: Array<{
    productSlug: string;
    size: Size;
    quantity: number;
  }>;
}

function getPlaceholderImage(name: string, variant?: string) {
  const label = variant ? `${name} ${variant}` : name;
  return `https://placehold.co/800x1000/000000/ffffff?text=${encodeURIComponent(label)}`;
}

const demoProducts: SeedProduct[] = [
  {
    name: "Classic Black Biker Jacket",
    description:
      "A signature biker cut finished in rich genuine leather with a polished edge that feels sharp from the first wear. Built for layered city dressing, it balances structure, comfort, and a premium handfeel.",
    category: "Men",
    productType: "Genuine Leather Jacket",
    price: 28000,
    compareAtPrice: 35000,
    images: [getPlaceholderImage("Classic Black Biker Jacket"), getPlaceholderImage("Classic Black Biker Jacket", "Back")],
    stockBySize: { XS: 0, S: 4, M: 12, L: 9, XL: 5, XXL: 2 }
  },
  {
    name: "Midnight Moto Jacket",
    description:
      "Lightweight and cleanly cut, this moto silhouette offers an easy everyday layer with the same elevated VELES restraint. The finish is sleek, versatile, and designed to move effortlessly between weekday and weekend wear.",
    category: "Men",
    productType: "Non-Leather Jacket",
    price: 14500,
    images: [getPlaceholderImage("Midnight Moto Jacket"), getPlaceholderImage("Midnight Moto Jacket", "Detail")],
    stockBySize: { XS: 1, S: 7, M: 10, L: 8, XL: 4, XXL: 0 }
  },
  {
    name: "Desert Sage Racer",
    description:
      "A refined racer profile in plant-based leather with a matte finish and understated hardware. It brings a softer, modern attitude while maintaining the exacting line and polish of the collection.",
    category: "Men",
    productType: "Plant-Based Leather Jacket",
    price: 18000,
    compareAtPrice: 22000,
    images: [getPlaceholderImage("Desert Sage Racer"), getPlaceholderImage("Desert Sage Racer", "Side")],
    stockBySize: { XS: 0, S: 6, M: 11, L: 7, XL: 3, XXL: 1 }
  },
  {
    name: "Obsidian Slim Biker",
    description:
      "Cut close to the body with a streamlined front, this genuine leather biker is tailored for a leaner silhouette. The finish is smooth, confident, and intentionally minimal for long-term wear.",
    category: "Men",
    productType: "Genuine Leather Jacket",
    price: 32000,
    images: [getPlaceholderImage("Obsidian Slim Biker"), getPlaceholderImage("Obsidian Slim Biker", "Back")],
    stockBySize: { XS: 2, S: 5, M: 8, L: 6, XL: 0, XXL: 4 }
  },
  {
    name: "Storm Rider Jacket",
    description:
      "A casual outer layer with a crisp moto influence, softened through a supple non-leather construction. It is designed to look sharp without feeling heavy, making it a versatile staple across seasons.",
    category: "Men",
    productType: "Non-Leather Jacket",
    price: 12000,
    compareAtPrice: 16000,
    images: [getPlaceholderImage("Storm Rider Jacket"), getPlaceholderImage("Storm Rider Jacket", "Detail")],
    stockBySize: { XS: 0, S: 9, M: 14, L: 10, XL: 6, XXL: 2 }
  },
  {
    name: "Urban Harvest Jacket",
    description:
      "This plant-based leather jacket pairs a warm tonal finish with a clean, contemporary line. It offers a premium look with a lighter feel, shaped for daily wear and repeat styling.",
    category: "Men",
    productType: "Plant-Based Leather Jacket",
    price: 21000,
    images: [getPlaceholderImage("Urban Harvest Jacket"), getPlaceholderImage("Urban Harvest Jacket", "Back")],
    stockBySize: { XS: 3, S: 8, M: 13, L: 9, XL: 4, XXL: 0 }
  },
  {
    name: "Noir Belted Jacket",
    description:
      "A polished genuine leather statement piece with a waist-defining belt and a sharp, sculpted line. It is equal parts dramatic and wearable, designed to hold shape while remaining fluid in motion.",
    category: "Women",
    productType: "Genuine Leather Jacket",
    price: 26000,
    compareAtPrice: 31000,
    images: [getPlaceholderImage("Noir Belted Jacket"), getPlaceholderImage("Noir Belted Jacket", "Back")],
    stockBySize: { XS: 0, S: 5, M: 9, L: 8, XL: 3, XXL: 1 }
  },
  {
    name: "Pearl Moto Jacket",
    description:
      "A softly structured moto jacket with a clean silhouette and a lighter, non-leather finish. The look is crisp and modern, giving everyday dressing a polished monochrome edge.",
    category: "Women",
    productType: "Non-Leather Jacket",
    price: 13500,
    images: [getPlaceholderImage("Pearl Moto Jacket"), getPlaceholderImage("Pearl Moto Jacket", "Detail")],
    stockBySize: { XS: 2, S: 7, M: 12, L: 8, XL: 0, XXL: 2 }
  },
  {
    name: "Botanica Biker",
    description:
      "An elevated biker silhouette in plant-based leather, shaped with a slightly softer drape and a modern finish. It delivers the same editorial impact as the core leather styles with a lighter attitude.",
    category: "Women",
    productType: "Plant-Based Leather Jacket",
    price: 19500,
    images: [getPlaceholderImage("Botanica Biker"), getPlaceholderImage("Botanica Biker", "Back")],
    stockBySize: { XS: 0, S: 6, M: 10, L: 7, XL: 5, XXL: 2 }
  },
  {
    name: "Onyx Fitted Jacket",
    description:
      "This fitted genuine leather jacket is built with a precise cut that flatters without feeling restrictive. The silhouette is sleek, refined, and finished for a premium wardrobe foundation.",
    category: "Women",
    productType: "Genuine Leather Jacket",
    price: 29000,
    images: [getPlaceholderImage("Onyx Fitted Jacket"), getPlaceholderImage("Onyx Fitted Jacket", "Detail")],
    stockBySize: { XS: 1, S: 4, M: 8, L: 6, XL: 0, XXL: 3 }
  },
  {
    name: "Classic Leather Tote",
    description:
      "A clean-lined leather tote with generous structure, minimal hardware, and a premium finish that feels timeless. Designed to move from workdays to weekends, it carries essentials with quiet confidence.",
    category: "Accessories",
    productType: "Leather Purse",
    price: 9500,
    compareAtPrice: 12000,
    images: [getPlaceholderImage("Classic Leather Tote"), getPlaceholderImage("Classic Leather Tote", "Interior")],
    stockBySize: { XS: 0, S: 0, M: 18, L: 12, XL: 0, XXL: 0 }
  },
  {
    name: "Cactus Mini Crossbody",
    description:
      "A compact crossbody in plant-based leather with a streamlined profile and a crisp monochrome finish. It is designed for lighter carry days while keeping the same considered VELES polish.",
    category: "Accessories",
    productType: "Plant-Based Leather Purse",
    price: 7800,
    images: [getPlaceholderImage("Cactus Mini Crossbody"), getPlaceholderImage("Cactus Mini Crossbody", "Back")],
    stockBySize: { XS: 0, S: 0, M: 14, L: 9, XL: 0, XXL: 0 }
  }
];

const demoOrders: SeedOrder[] = [
  {
    id: "demo-order-001",
    customerName: "Aarav Mehta",
    customerEmail: "aarav.mehta@example.com",
    paymentStatus: "PAID",
    fulfillmentStatus: "DELIVERED",
    shippingCost: 0,
    items: [
      { productSlug: "classic-black-biker-jacket", size: "M", quantity: 1 },
      { productSlug: "classic-leather-tote", size: "M", quantity: 1 }
    ]
  },
  {
    id: "demo-order-002",
    customerName: "Nisha Kapoor",
    customerEmail: "nisha.kapoor@example.com",
    paymentStatus: "PAID",
    fulfillmentStatus: "PROCESSING",
    shippingCost: 0,
    items: [
      { productSlug: "noir-belted-jacket", size: "S", quantity: 1 },
      { productSlug: "cactus-mini-crossbody", size: "M", quantity: 1 }
    ]
  },
  {
    id: "demo-order-003",
    customerName: "Rohan Khanna",
    customerEmail: "rohan.khanna@example.com",
    paymentStatus: "PENDING",
    fulfillmentStatus: "PENDING",
    shippingCost: 0,
    items: [{ productSlug: "desert-sage-racer", size: "L", quantity: 1 }]
  },
  {
    id: "demo-order-004",
    customerName: "Mira Sethi",
    customerEmail: "mira.sethi@example.com",
    paymentStatus: "PAID",
    fulfillmentStatus: "DISPATCHED",
    shippingCost: 0,
    items: [
      { productSlug: "urban-harvest-jacket", size: "M", quantity: 1 },
      { productSlug: "pearl-moto-jacket", size: "XS", quantity: 1 }
    ]
  }
];

async function ensureAdminUser() {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  let userRecord;

  try {
    userRecord = await adminAuth.getUserByEmail(adminEmail);
    console.log("Demo admin already exists. Reusing the existing account.");
  } catch (error) {
    const authError = error as { code?: string };

    if (authError.code !== "auth/user-not-found") {
      throw error;
    }

    userRecord = await adminAuth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: "Store Admin"
    });

    console.log("Created the demo admin account.");
  }

  await adminAuth.updateUser(userRecord.uid, {
    password: adminPassword,
    displayName: "Store Admin"
  });

  await adminDb.collection("users").doc(userRecord.uid).set(
    {
      name: "Store Admin",
      email: adminEmail,
      role: "ADMIN",
      createdAt: FieldValue.serverTimestamp(),
      defaultAddressId: ""
    },
    { merge: true }
  );

  await adminAuth.setCustomUserClaims(userRecord.uid, { role: "ADMIN" });

  return userRecord;
}

async function seedDemoProducts() {
  const adminDb = getAdminDb();
  const existingProduct = await adminDb.collection("products").where("slug", "==", sentinelProductSlug).limit(1).get();

  if (!existingProduct.empty) {
    console.log("Demo products already exist. Skipping product seeding.");
    return;
  }

  for (const product of demoProducts) {
    const slug = slugify(product.name);
    const productRef = adminDb.collection("products").doc(slug);

    await productRef.set({
      name: product.name,
      slug,
      description: product.description,
      category: product.category,
      productType: product.productType,
      price: product.price,
      compareAtPrice: product.compareAtPrice || null,
      images: product.images,
      isActive: true,
      isDeleted: false,
      createdAt: FieldValue.serverTimestamp()
    });

    await Promise.all(
      SIZES.map((size) =>
        productRef.collection("variants").doc(size).set({
          size,
          stock: product.stockBySize[size]
        })
      )
    );

    console.log(`Seeded product: ${product.name}`);
  }
}

async function getSeededProductRecords() {
  const adminDb = getAdminDb();
  const records = new Map<string, SeededProductRecord>();

  for (const product of demoProducts) {
    const slug = slugify(product.name);
    const snapshot = await adminDb.collection("products").where("slug", "==", slug).limit(1).get();

    if (snapshot.empty) {
      throw new Error(`Unable to find seeded product with slug "${slug}".`);
    }

    const doc = snapshot.docs[0];
    records.set(slug, {
      id: doc.id,
      name: String(doc.data().name),
      slug,
      price: Number(doc.data().price),
      category: doc.data().category as Category,
      productType: doc.data().productType as ProductType,
      imageUrl: String((doc.data().images as string[] | undefined)?.[0] || "/placeholder.svg")
    });
  }

  return records;
}

async function seedDemoOrders(adminUid: string) {
  const adminDb = getAdminDb();
  const productRecords = await getSeededProductRecords();

  for (const order of demoOrders) {
    const items = order.items.map((item) => {
      const product = productRecords.get(item.productSlug);

      if (!product) {
        throw new Error(`Unable to build demo order item for product "${item.productSlug}".`);
      }

      return {
        productId: product.id,
        productName: product.name,
        productType: product.productType,
        category: product.category,
        imageUrl: product.imageUrl,
        size: item.size,
        quantity: item.quantity,
        priceAtPurchase: product.price
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    const total = subtotal + order.shippingCost;

    await adminDb.collection("orders").doc(order.id).set({
      orderId: order.id.toUpperCase(),
      userId: adminUid,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      stripePaymentIntentId: `seeded-${order.id}`,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal,
      shippingCost: order.shippingCost,
      total,
      createdAt: FieldValue.serverTimestamp(),
      items
    });
  }

  console.log(`Demo orders ready: ${demoOrders.length}`);
}

async function seedAdmin() {
  const userRecord = await ensureAdminUser();

  await seedDemoProducts();
  await seedDemoOrders(userRecord.uid);

  console.log("Admin user ready.");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`UID: ${userRecord.uid}`);
}

seedAdmin().catch((error) => {
  console.error("Unable to seed the admin user.", error);
  process.exit(1);
});

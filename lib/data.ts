import { FieldPath, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase-admin";
import { MaterialFilter, Order, Product, ProductType, ProductVariant, UserProfile } from "@/lib/types";

function withId<T>(id: string, data: FirebaseFirestore.DocumentData) {
  return { id, ...(data as T) };
}

function getSafeAdminDb() {
  try {
    return getAdminDb();
  } catch (error) {
    console.error("Firebase Admin Firestore is unavailable for server data access.", error);
    return null;
  }
}

function getSortConfig(sort?: "price-asc" | "price-desc" | "latest") {
  if (sort === "price-asc") {
    return { field: "price", direction: "asc" as const };
  }

  if (sort === "price-desc") {
    return { field: "price", direction: "desc" as const };
  }

  return { field: "createdAt", direction: "desc" as const };
}

function getMaterialProductTypes(material?: MaterialFilter, category?: string): ProductType[] {
  if (!material) {
    return [];
  }

  const isAccessories = category === "Accessories";

  if (material === "Genuine Leather") {
    return [isAccessories ? "Leather Purse" : "Genuine Leather Jacket"];
  }

  if (material === "Non-Leather") {
    return [isAccessories ? "Non-Leather Purse" : "Non-Leather Jacket"];
  }

  return [isAccessories ? "Plant-Based Leather Purse" : "Plant-Based Leather Jacket"];
}

async function hydrateProducts(snapshot: FirebaseFirestore.QuerySnapshot) {
  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const variantSnapshot = await doc.ref.collection("variants").orderBy(FieldPath.documentId()).get();
      return {
        ...withId<Product>(doc.id, doc.data()),
        variants: variantSnapshot.docs.map((variantDoc) => withId<ProductVariant>(variantDoc.id, variantDoc.data()))
      } satisfies Product;
    })
  );
}

function sortProducts(products: Product[], sort?: "price-asc" | "price-desc" | "latest") {
  return [...products].sort((left, right) => {
    if (sort === "price-asc") {
      return left.price - right.price;
    }

    if (sort === "price-desc") {
      return right.price - left.price;
    }

    return new Date(toDateValue(right.createdAt)).getTime() - new Date(toDateValue(left.createdAt)).getTime();
  });
}

function toDateValue(value: Product["createdAt"]) {
  if (typeof value === "string" || value instanceof Date) {
    return value;
  }

  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }

  return new Date(0);
}

export async function getActiveProducts(options?: {
  category?: string;
  material?: string;
  sort?: "price-asc" | "price-desc" | "latest";
}) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return [];
  }

  let query: FirebaseFirestore.Query = adminDb
    .collection("products")
    .where("isDeleted", "==", false)
    .where("isActive", "==", true);

  if (options?.category) {
    query = query.where("category", "==", options.category);
  }

  const sortConfig = getSortConfig(options?.sort);
  query = query.orderBy(sortConfig.field, sortConfig.direction);

  const snapshot = await query.get();
  const products = await hydrateProducts(snapshot);

  if (!options?.material) {
    return products;
  }

  const material = options.material;

  return products.filter((product) => {
    if (material === "Genuine Leather") {
      return product.productType === "Genuine Leather Jacket" || product.productType === "Leather Purse";
    }

    return product.productType.startsWith(material);
  });
}

export async function getStoreProducts(options?: {
  category?: string;
  productType?: MaterialFilter;
  sort?: "price-asc" | "price-desc" | "latest";
  search?: string;
}) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return [];
  }

  const sortConfig = getSortConfig(options?.sort);
  const selectedProductTypes = options?.category
    ? getMaterialProductTypes(options.productType, options.category)
    : options?.productType
      ? [
          ...getMaterialProductTypes(options.productType, "Men"),
          ...getMaterialProductTypes(options.productType, "Accessories")
        ]
      : [];

  const seen = new Set<string>();
  const hydratedProducts: Product[] = [];

  if (options?.category && selectedProductTypes.length === 1) {
    // Firestore requires a composite index on (category, productType, createdAt) for this chained filter query.
    const snapshot = await adminDb
      .collection("products")
      .where("isDeleted", "==", false)
      .where("isActive", "==", true)
      .where("category", "==", options.category)
      .where("productType", "==", selectedProductTypes[0])
      .orderBy(sortConfig.field, sortConfig.direction)
      .get();

    hydratedProducts.push(...(await hydrateProducts(snapshot)));
  } else if (options?.category) {
    const snapshot = await adminDb
      .collection("products")
      .where("isDeleted", "==", false)
      .where("isActive", "==", true)
      .where("category", "==", options.category)
      .orderBy(sortConfig.field, sortConfig.direction)
      .get();

    hydratedProducts.push(...(await hydrateProducts(snapshot)));
  } else if (selectedProductTypes.length) {
    const snapshots = await Promise.all(
      selectedProductTypes.map((productType) =>
        adminDb
          .collection("products")
          .where("isDeleted", "==", false)
          .where("isActive", "==", true)
          .where("productType", "==", productType)
          .orderBy(sortConfig.field, sortConfig.direction)
          .get()
      )
    );

    for (const snapshot of snapshots) {
      hydratedProducts.push(...(await hydrateProducts(snapshot)));
    }
  } else {
    const snapshot = await adminDb
      .collection("products")
      .where("isDeleted", "==", false)
      .where("isActive", "==", true)
      .orderBy(sortConfig.field, sortConfig.direction)
      .get();

    hydratedProducts.push(...(await hydrateProducts(snapshot)));
  }

  const uniqueProducts = hydratedProducts.filter((product) => {
    if (seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });

  const filteredByType =
    options?.category && selectedProductTypes.length === 1
      ? uniqueProducts
      : selectedProductTypes.length
        ? uniqueProducts.filter((product) => selectedProductTypes.includes(product.productType))
        : uniqueProducts;

  const searchTerm = options?.search?.trim().toLowerCase();
  const filteredBySearch = searchTerm
    ? filteredByType.filter((product) => {
        const haystack = [product.name, product.description, product.category, product.productType, product.slug].join(" ").toLowerCase();
        return haystack.includes(searchTerm);
      })
    : filteredByType;

  return sortProducts(filteredBySearch, options?.sort);
}

export async function searchActiveProducts(options?: {
  category?: string;
  material?: string;
  sort?: "price-asc" | "price-desc" | "latest";
  search?: string;
}) {
  const products = await getActiveProducts({
    category: options?.category,
    material: options?.material,
    sort: options?.sort
  });

  const searchTerm = options?.search?.trim().toLowerCase();
  if (!searchTerm) {
    return products;
  }

  return products.filter((product) => {
    const haystack = [product.name, product.description, product.category, product.productType, product.slug].join(" ").toLowerCase();
    return haystack.includes(searchTerm);
  });
}

export async function getLatestProducts(limit = 8) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return [];
  }

  const snapshot = await adminDb
    .collection("products")
    .where("isDeleted", "==", false)
    .where("isActive", "==", true)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => withId<Product>(doc.id, doc.data()));
}

export async function getProductBySlug(slug: string) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return null;
  }

  const snapshot = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .where("isDeleted", "==", false)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const productDoc = snapshot.docs[0];
  const variantSnapshot = await productDoc.ref.collection("variants").orderBy(FieldPath.documentId()).get();

  return {
    id: productDoc.id,
    ...(productDoc.data() as Omit<Product, "id">),
    variants: variantSnapshot.docs.map((doc) => withId<ProductVariant>(doc.id, doc.data()))
  } satisfies Product;
}

export async function getProductById(id: string) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return null;
  }

  const snapshot = await adminDb.collection("products").doc(id).get();
  if (!snapshot.exists) {
    return null;
  }

  const variantSnapshot = await snapshot.ref.collection("variants").orderBy(FieldPath.documentId()).get();
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Product, "id">),
    variants: variantSnapshot.docs.map((doc) => withId<ProductVariant>(doc.id, doc.data()))
  } satisfies Product;
}

export async function getAllProducts() {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return [];
  }

  const snapshot = await adminDb.collection("products").where("isDeleted", "==", false).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => withId<Product>(doc.id, doc.data()));
}

export async function getRecentOrders(limit = 10) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return [];
  }

  const snapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(limit).get();
  return snapshot.docs.map((doc) => withId<Order>(doc.id, doc.data()));
}

export async function getOrders(filters?: { paymentStatus?: string; fulfillmentStatus?: string; limit?: number }) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return [];
  }

  let query: FirebaseFirestore.Query = adminDb.collection("orders");

  if (filters?.paymentStatus) {
    query = query.where("paymentStatus", "==", filters.paymentStatus);
  }

  if (filters?.fulfillmentStatus) {
    query = query.where("fulfillmentStatus", "==", filters.fulfillmentStatus);
  }

  query = query.orderBy("createdAt", "desc");

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => withId<Order>(doc.id, doc.data()));
}

export async function getOrderById(id: string) {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return null;
  }

  const snapshot = await adminDb.collection("orders").doc(id).get();
  if (!snapshot.exists) {
    return null;
  }

  return withId<Order>(snapshot.id, snapshot.data()!);
}

export async function getDashboardMetrics() {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return {
      revenue: 0,
      orderCount: 0,
      productCount: 0,
      lowStockCount: 0,
      topProducts: []
    };
  }

  const [ordersSnapshot, productsSnapshot, lowStockSnapshot] = await Promise.all([
    adminDb.collection("orders").get(),
    adminDb.collection("products").where("isDeleted", "==", false).get(),
    adminDb.collectionGroup("variants").where("stock", "<", 5).get()
  ]);

  const orders = ordersSnapshot.docs.map((doc) => withId<Order>(doc.id, doc.data()));
  const revenue = orders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + order.total, 0);

  const productFrequency = new Map<string, { name: string; count: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = productFrequency.get(item.productId);
      productFrequency.set(item.productId, {
        name: item.productName,
        count: (existing?.count || 0) + item.quantity
      });
    }
  }

  const topProducts = [...productFrequency.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    revenue,
    orderCount: ordersSnapshot.size,
    productCount: productsSnapshot.size,
    lowStockCount: lowStockSnapshot.size,
    topProducts
  };
}

export async function getCustomerSummaries() {
  const adminDb = getSafeAdminDb();
  if (!adminDb) {
    return [];
  }

  const usersSnapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
  const users = usersSnapshot.docs.map((doc) => withId<UserProfile>(doc.id, doc.data()));

  return Promise.all(
    users.map(async (user) => {
      const countSnapshot = await adminDb.collection("orders").where("userId", "==", user.id).count().get();
      return {
        ...user,
        orderCount: countSnapshot.data().count
      };
    })
  );
}

export function nowTimestamp() {
  return Timestamp.now();
}

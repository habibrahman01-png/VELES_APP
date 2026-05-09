import admin from "firebase-admin";

const app =
  admin.apps[0] ||
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

const db = admin.firestore(app);

const products = [
  {
    id: "veles-001",
    name: "Apex Rider Jacket",
    slug: "apex-rider-jacket",
    description: "Premium genuine leather jacket for men with precise paneling and a sharp tailored finish.",
    category: "Men",
    productType: "Genuine Leather Jacket",
    price: 148,
    compareAtPrice: 180,
    images: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80"],
    isActive: true,
    isDeleted: false
  },
  {
    id: "veles-002",
    name: "Contour Moto Jacket",
    slug: "contour-moto-jacket",
    description: "Plant-based leather jacket for women with refined structure and a polished luxury feel.",
    category: "Women",
    productType: "Plant-Based Leather Jacket",
    price: 224,
    compareAtPrice: 260,
    images: ["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"],
    isActive: true,
    isDeleted: false
  },
  {
    id: "veles-003",
    name: "Atelier Zip Jacket",
    slug: "atelier-zip-jacket",
    description: "Non-leather jacket for women with clean lines, a lightweight build, and an elevated finish.",
    category: "Women",
    productType: "Non-Leather Jacket",
    price: 186,
    compareAtPrice: 214,
    images: ["https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80"],
    isActive: true,
    isDeleted: false
  },
  {
    id: "veles-004",
    name: "Verve Carry Purse",
    slug: "verve-carry-purse",
    description: "Leather purse with structured proportions and premium finishing for everyday luxury.",
    category: "Accessories",
    productType: "Leather Purse",
    price: 132,
    compareAtPrice: 160,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80"],
    isActive: true,
    isDeleted: false
  }
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

for (const product of products) {
  const ref = db.collection("products").doc(product.id);
  await ref.set({
    ...product,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  for (const size of sizes) {
    await ref.collection("variants").doc(size).set({
      size,
      stock: Math.max(0, 12 - sizes.indexOf(size) * 2)
    });
  }
}

console.log(`Seeded ${products.length} VELES products.`);

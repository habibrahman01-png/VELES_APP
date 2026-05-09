require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");

const adminEmail = "admin@leatherstore.com";
const adminPassword = "Admin@123456";
const sentinelProductSlug = "classic-black-biker-jacket";
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

function getPlaceholderImage(name, variant) {
  const label = variant ? `${name} ${variant}` : name;
  return `https://placehold.co/800x1000/000000/ffffff?text=${encodeURIComponent(label)}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const demoProducts = [
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

async function initializeAdminSdk() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env.local");
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    console.log("✅ Firebase Admin SDK initialized successfully");
    return {
      auth: admin.auth(),
      db: admin.firestore()
    };
  } catch (error) {
    console.error("Seed step failed: Firebase Admin SDK initialization", error);
    throw error;
  }
}

async function ensureAdminUser(auth, db) {
  let userRecord;

  try {
    userRecord = await auth.getUserByEmail(adminEmail);
    console.log("Admin user already exists, skipping creation");
  } catch (error) {
    if (error && error.code === "auth/user-not-found") {
      try {
        userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: "Store Admin"
        });
      } catch (createError) {
        console.error("Seed step failed: admin user creation", createError);
        throw createError;
      }
    } else {
      console.error("Seed step failed: admin user lookup", error);
      throw error;
    }
  }

  try {
    await auth.updateUser(userRecord.uid, {
      password: adminPassword,
      displayName: "Store Admin"
    });
    await db.collection("users").doc(userRecord.uid).set(
      {
        name: "Store Admin",
        email: adminEmail,
        role: "ADMIN",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        defaultAddressId: ""
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Seed step failed: admin user document sync", error);
    throw error;
  }

  return userRecord;
}

async function ensureAdminClaim(auth, uid) {
  try {
    await auth.setCustomUserClaims(uid, { role: "ADMIN" });
    console.log("✅ Custom claim set: { role: 'ADMIN' }");
  } catch (error) {
    console.error("Seed step failed: setting admin custom claim", error);
    throw error;
  }
}

async function seedProducts(db) {
  try {
    const existing = await db.collection("products").where("slug", "==", sentinelProductSlug).limit(1).get();

    if (!existing.empty) {
      console.log("Demo products already seeded, skipping");
      return false;
    }
  } catch (error) {
    console.error("Seed step failed: demo product existence check", error);
    throw error;
  }

  try {
    for (const product of demoProducts) {
      const slug = slugify(product.name);
      const productRef = db.collection("products").doc(slug);

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
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      for (const size of sizes) {
        await productRef.collection("variants").doc(size).set({
          size,
          stock: product.stockBySize[size]
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Seed step failed: writing demo products and variants", error);
    throw error;
  }
}

async function main() {
  const { auth, db } = await initializeAdminSdk();
  const userRecord = await ensureAdminUser(auth, db);
  console.log(`✅ Admin user ready: ${adminEmail}`);
  await ensureAdminClaim(auth, userRecord.uid);
  await seedProducts(db);

  console.log("✅ 12 demo products seeded with variants");
  console.log("─────────────────────────────────────────");
  console.log("🚀 Setup complete. Start the app with: npm run dev");
  console.log(`🔑 Admin login → ${adminEmail} / ${adminPassword}`);
  console.log("📦 Visit /admin to explore the dashboard");
}

main().catch((error) => {
  console.error("Unable to seed the admin setup.", error);
  process.exit(1);
});

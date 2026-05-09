# VELES

VELES is a Next.js App Router clothing e-commerce application with a Firebase-powered storefront, real-time user account experience, and a fully integrated admin dashboard.

## Stack

- Next.js 14 + App Router
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Admin SDK
- Stripe checkout + webhooks
- Zustand
- Tailwind CSS

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the Firebase client credentials.
3. Fill in the Firebase Admin SDK service account credentials.
4. Add your Stripe keys and webhook secret.
5. Install dependencies with `npm install`.
6. Run the app with `npm run dev`.

## Seed

Run:

```bash
npm run seed
```

## Admin Access

Run the seeded admin setup after `.env.local` is configured:

```bash
npm run seed:admin
```

Admin credentials:

- Email: `admin@leatherstore.com`
- Password: `Admin@123456`

After seeding, sign in at `/login` with those credentials and the account redirects to `/admin` because the `ADMIN` custom claim is applied immediately.

## Firebase Deploy Files

- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `firebase.json`

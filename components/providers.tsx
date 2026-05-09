"use client";

import { onIdTokenChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ReactNode, useEffect } from "react";

import { WishlistToast } from "@/components/store/wishlist-toast";
import { auth, db } from "@/lib/firebase";
import { WishlistItem } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  const clearWishlistItems = useWishlistStore((state) => state.clearItems);

  useEffect(() => {
    async function hydrateSession() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });

        if (!response.ok) {
          clearAuth();
          clearWishlistItems();
          return false;
        }

        const payload = (await response.json()) as { role?: "ADMIN" | "USER" | null };
        setRole(payload.role || null);
        return true;
      } catch {
        clearAuth();
        clearWishlistItems();
        return false;
      } finally {
        setLoading(false);
      }
    }

    void hydrateSession();

    if (!auth) {
      clearAuth();
      clearWishlistItems();
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user);

      if (!user) {
        clearWishlistItems();
        const hasServerSession = await hydrateSession();

        if (!hasServerSession) {
          clearAuth();
        }

        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims.role === "ADMIN" ? "ADMIN" : "USER";
        setRole(role);

        if (db) {
          const snapshot = await getDocs(query(collection(db, "users", user.uid, "wishlist"), orderBy("addedAt", "desc")));
          setWishlistItems(snapshot.docs.map((item) => item.data() as WishlistItem));
        }
      } catch {
        clearWishlistItems();
      }
    });

    return unsubscribe;
  }, [clearAuth, clearWishlistItems, setLoading, setRole, setUser, setWishlistItems]);

  return (
    <>
      {children}
      <WishlistToast />
    </>
  );
}

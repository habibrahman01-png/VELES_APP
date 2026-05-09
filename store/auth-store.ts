"use client";

import { User } from "firebase/auth";
import { create } from "zustand";

type SessionRole = "USER" | "ADMIN" | null;

interface AuthState {
  user: User | null;
  role: SessionRole;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: SessionRole) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () =>
    set({
      user: null,
      role: null,
      isLoading: false
    })
}));

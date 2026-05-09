"use client";

import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth, db, getFirebaseClientSetupError } from "@/lib/firebase";

interface AuthFormProps {
  mode: "login" | "signup";
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const demoAdminEmail = "admin@leatherstore.com";
const demoAdminPassword = "Admin@123456";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  async function persistSession(idToken: string) {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "Unable to start a secure session.");
    }

    const payload = (await response.json()) as { role?: "ADMIN" | "USER" };
    return payload.role === "ADMIN" ? "ADMIN" : "USER";
  }

  function validateFields(values: { name: string; email: string; password: string; confirmPassword: string }) {
    const nextErrors: FieldErrors = {};

    if (mode === "signup" && !values.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!values.password) {
      nextErrors.password = "Password is required.";
    } else if (values.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (mode === "signup") {
      if (!values.confirmPassword) {
        nextErrors.confirmPassword = "Please confirm your password.";
      } else if (values.password !== values.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    return nextErrors;
  }

  async function handleLogin(email: string, password: string, options?: { requireAdmin?: boolean; redirectTo?: string }) {
    if (!auth) {
      throw new Error(getFirebaseClientSetupError());
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    const tokenResult = await result.user.getIdTokenResult(true);
    const role = tokenResult.claims.role === "ADMIN" ? "ADMIN" : "USER";

    if (options?.requireAdmin && role !== "ADMIN") {
      await signOut(auth);
      throw new Error("Demo admin access is not available right now.");
    }

    const sessionRole = await persistSession(tokenResult.token);
    router.push(options?.redirectTo || (sessionRole === "ADMIN" ? "/admin" : "/account"));
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setFormError("");

    if (!auth) {
      setFormError(getFirebaseClientSetupError());
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const nextErrors = validateFields({ name, email, password, confirmPassword });
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        if (!db) {
          throw new Error(getFirebaseClientSetupError());
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name.trim() });

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            name: name.trim(),
            email: email.trim(),
            role: "USER",
            createdAt: serverTimestamp(),
            defaultAddressId: ""
          },
          { merge: true }
        );

        const sessionRole = await persistSession(await result.user.getIdToken(true));
        router.push(sessionRole === "ADMIN" ? "/admin" : "/account");
      } else {
        await handleLogin(email, password);
      }
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Authentication failed.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoAdminLogin() {
    setDemoLoading(true);
    setFieldErrors({});
    setFormError("");

    try {
      await handleLogin(demoAdminEmail, demoAdminPassword, {
        requireAdmin: true,
        redirectTo: "/admin"
      });
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Authentication failed.";
      setFormError(message);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg bg-pureWhite p-12 shadow-[rgba(0,0,0,0.12)_0_4px_16px]">
      <div className="mb-8 space-y-2">
        <h1 className="text-sub font-bold">{mode === "signup" ? "Create Account" : "Sign In"}</h1>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <div className="space-y-2">
            <Input name="name" placeholder="Full Name" required />
            {fieldErrors.name ? <p className="text-caption text-[#cc0000]">{fieldErrors.name}</p> : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <Input name="email" placeholder="Email" required type="email" />
          {fieldErrors.email ? <p className="text-caption text-[#cc0000]">{fieldErrors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <Input minLength={6} name="password" placeholder="Password" required type="password" />
          {fieldErrors.password ? <p className="text-caption text-[#cc0000]">{fieldErrors.password}</p> : null}
        </div>

        {mode === "signup" ? (
          <div className="space-y-2">
            <Input minLength={6} name="confirmPassword" placeholder="Confirm Password" required type="password" />
            {fieldErrors.confirmPassword ? <p className="text-caption text-[#cc0000]">{fieldErrors.confirmPassword}</p> : null}
          </div>
        ) : null}

        {formError ? <p className="text-caption text-[#cc0000]">{formError}</p> : null}

        <Button disabled={loading || demoLoading} fullWidth type="submit">
          {loading ? "Please wait" : mode === "signup" ? "Create Account" : "Sign In"}
        </Button>

        {mode === "login" ? (
          <div className="space-y-4">
            <p className="text-caption text-mutedGray">Want to explore the dashboard? Use the demo admin account.</p>
            <Button
              className="border-uberBlack font-normal"
              disabled={loading || demoLoading}
              fullWidth
              onClick={handleDemoAdminLogin}
              type="button"
              variant="secondary"
            >
              {demoLoading ? "Please wait" : "Demo Admin Login"}
            </Button>
            <div className="space-y-3 border border-chipGray bg-hoverLight p-4">
              <p className="text-caption text-mutedGray">Admin Credentials</p>
              <p className="text-caption text-bodyGray">
                <span className="font-bold">Email:</span>{" "}
                <code className="rounded-full bg-chipGray px-3 py-1 text-uberBlack">admin@leatherstore.com</code>
              </p>
              <p className="text-caption text-bodyGray">
                <span className="font-bold">Password:</span>{" "}
                <code className="rounded-full bg-chipGray px-3 py-1 text-uberBlack">Admin@123456</code>
              </p>
            </div>
            <p className="text-caption text-mutedGray">Click "Demo Admin Login" to sign in instantly, or enter these credentials manually.</p>
          </div>
        ) : null}

        <div className="border-t border-chipGray" />

        <p className="text-body">
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <Link className="text-linkBlue underline" href={mode === "signup" ? "/login" : "/signup"}>
            {mode === "signup" ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </form>
    </Card>
  );
}

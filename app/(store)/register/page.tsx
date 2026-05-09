import { AuthForm } from "@/components/store/auth-form";

export default function RegisterPage() {
  return (
    <div className="layout-shell py-12">
      <AuthForm mode="signup" />
    </div>
  );
}

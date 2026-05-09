import { AuthForm } from "@/components/store/auth-form";

export default function LoginPage() {
  return (
    <div className="layout-shell py-12">
      <AuthForm mode="login" />
    </div>
  );
}

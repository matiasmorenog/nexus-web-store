"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AuthProviderDivider,
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";
import { RememberMeCheckbox } from "@/components/auth/remember-me-checkbox";
import { setAuthIntentCookies } from "@/lib/auth-client";
import { isAdminRole } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  defaultEmail?: string;
  defaultPassword?: string;
  googleAuthEnabled?: boolean;
};

export function LoginForm({
  defaultEmail = "",
  defaultPassword = "",
  googleAuthEnabled = false,
}: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setAuthIntentCookies("admin", rememberMe);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    const session = await getSession();
    if (!session?.user?.role || !isAdminRole(session.user.role)) {
      await signOut({ redirect: false });
      setError("Esta cuenta no tiene acceso al panel admin.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton
            context="admin"
            rememberMe={rememberMe}
            callbackUrl="/admin"
            disabled={loading}
          />
          <AuthProviderDivider />
        </>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            defaultValue={defaultPassword}
          />
        </div>
        <RememberMeCheckbox
          id="admin-remember-me"
          checked={rememberMe}
          onChange={setRememberMe}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
        <p className="text-center text-sm text-neutral-600">
          <Link
            href="/admin/login/recuperar-contrasena"
            className="font-medium text-[var(--brand-primary)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>
    </div>
  );
}

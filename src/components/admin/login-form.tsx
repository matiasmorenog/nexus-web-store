"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AuthProviderDivider,
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";
import { RememberMeCheckbox } from "@/components/auth/remember-me-checkbox";
import { setAuthIntentCookies } from "@/lib/auth-client";
import { isAdminRole } from "@/lib/auth-session";
import type { AdminLocale, adminLogin } from "@/lib/admin-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  defaultEmail?: string;
  defaultPassword?: string;
  googleAuthEnabled?: boolean;
  copy?: (typeof adminLogin)[AdminLocale];
};

export function LoginForm({
  defaultEmail = "",
  defaultPassword = "",
  googleAuthEnabled = false,
  copy,
}: LoginFormProps) {
  const labels = copy ?? {
    wrongCredentials: "Email o contraseña incorrectos",
    noAdminAccess: "Esta cuenta no tiene acceso al panel admin.",
    password: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    rememberMe: "Recordarme",
    signingIn: "Ingresando...",
    signInAction: "Ingresar",
    forgot: "¿Olvidaste tu contraseña?",
    continueWithGoogle: "Continuar con Google",
    panel: "",
    panelLead: "",
    signIn: "",
    passwordUpdated: "",
    googleNotAdmin: "",
    googleLinkError: "",
    backToStore: "",
  };
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setError(labels.wrongCredentials);
      setLoading(false);
      return;
    }

    const session = await getSession();
    if (!session?.user?.role || !isAdminRole(session.user.role)) {
      await signOut({ redirect: false });
      setError(labels.noAdminAccess);
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
            label={labels.continueWithGoogle}
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
          <Label htmlFor="password">{labels.password}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              defaultValue={defaultPassword}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:text-neutral-800"
              aria-label={showPassword ? labels.hidePassword : labels.showPassword}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <RememberMeCheckbox
          id="admin-remember-me"
          checked={rememberMe}
          onChange={setRememberMe}
          label={labels.rememberMe}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? labels.signingIn : labels.signInAction}
        </Button>
        <p className="text-center text-sm text-neutral-600">
          <Link
            href="/admin/login/recuperar-contrasena"
            className="font-medium text-[var(--brand-primary)] hover:underline"
          >
            {labels.forgot}
          </Link>
        </p>
      </form>
    </div>
  );
}

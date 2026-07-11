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
import { resolveCustomerCallbackUrl } from "@/lib/customer-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CustomerLoginFormProps = {
  callbackUrl?: string;
  defaultEmail?: string;
  defaultPassword?: string;
  googleAuthEnabled?: boolean;
};

export function CustomerLoginForm({
  callbackUrl = "/",
  defaultEmail = "",
  defaultPassword = "",
  googleAuthEnabled = false,
}: CustomerLoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const redirectTo = resolveCustomerCallbackUrl(callbackUrl);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setAuthIntentCookies("customer", rememberMe);

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
    if (session?.user?.role !== "CUSTOMER") {
      await signOut({ redirect: false });
      setError("Esta cuenta es de administración. Usá el panel admin.");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton
            context="customer"
            rememberMe={rememberMe}
            callbackUrl={redirectTo}
            disabled={loading}
          />
          <AuthProviderDivider />
        </>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={defaultEmail}
          />
        </div>
        <div>
          <Label htmlFor="customer-password">Contraseña</Label>
          <Input
            id="customer-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue={defaultPassword}
          />
        </div>
        <RememberMeCheckbox
          id="customer-remember-me"
          checked={rememberMe}
          onChange={setRememberMe}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
        <p className="text-center text-sm text-neutral-600">
          <Link
            href="/cuenta/recuperar-contrasena"
            className="font-medium text-[var(--brand-primary)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-center text-sm text-neutral-600">
          ¿No tenés cuenta?{" "}
          <Link
            href="/cuenta/registrarse"
            className="font-medium text-[var(--brand-primary)] hover:underline"
          >
            Registrate
          </Link>
        </p>
      </form>
    </div>
  );
}

export function CustomerRegisterForm({
  googleAuthEnabled = false,
}: {
  googleAuthEnabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo crear la cuenta");
      }

      setAuthIntentCookies("customer", false);

      const signInResult = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/cuenta/ingresar");
        return;
      }

      router.push("/cuenta/pedidos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton
            context="customer_register"
            rememberMe={false}
            callbackUrl="/cuenta/pedidos"
            disabled={loading}
          />
          <AuthProviderDivider />
        </>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="register-name">Nombre completo</Label>
        <Input
          id="register-name"
          name="name"
          autoComplete="name"
          required
        />
      </div>
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="register-password">Contraseña</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <p className="mt-1 text-xs text-neutral-500">Mínimo 6 caracteres</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-neutral-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/cuenta/ingresar"
          className="font-medium text-[var(--brand-primary)] hover:underline"
        >
          Ingresá
        </Link>
      </p>
      </form>
    </div>
  );
}

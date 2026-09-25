"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { storefrontPath } from "@/lib/storefront-paths";

type ResetPasswordFormProps = {
  token: string;
  loginHref?: string;
};

export function ResetPasswordForm({
  token,
  loginHref = storefrontPath("signIn"),
}: ResetPasswordFormProps) {
  const router = useRouter();
  const copy = getLocaleCopy();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirmPassword") ?? "");

    if (password !== confirm) {
      setError(copy.passwordsMismatch);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? copy.couldNotReset);
      }

      const redirectTo =
        typeof data.redirectTo === "string"
          ? `${data.redirectTo}?reset=1`
          : `${loginHref}?reset=1`;

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.unexpectedError);
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">
          {copy.invalidResetLink}
        </p>
        <Link
          href={storefrontPath("forgotPassword")}
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          {copy.forgotTitle}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="reset-password">{copy.newPassword}</Label>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <div>
        <Label htmlFor="reset-confirm">{copy.confirmPassword}</Label>
        <Input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <p className="mt-1 text-xs text-neutral-500">{copy.minPassword}</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? copy.saving : copy.changePassword}
      </Button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { storefrontPath } from "@/lib/storefront-paths";

export function ForgotPasswordForm({
  loginHref = storefrontPath("signIn"),
}: {
  loginHref?: string;
}) {
  const copy = getLocaleCopy();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? copy.couldNotSendLink);
      }

      setSent(true);
      setMessage(data.message ?? copy.checkEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-700">{message}</p>
        <p className="text-sm text-neutral-500">{copy.devResetHint}</p>
        <Link
          href={loginHref}
          className="inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          {copy.backToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? copy.sending : copy.sendLink}
      </Button>
      <p className="text-center text-sm text-neutral-600">
        <Link
          href={loginHref}
          className="font-medium text-[var(--brand-primary)] hover:underline"
        >
          {copy.backToSignIn}
        </Link>
      </p>
    </form>
  );
}

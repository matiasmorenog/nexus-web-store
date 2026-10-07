"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { readAdminLocaleFromDocument } from "@/lib/admin-locale";
import type { StorePaymentSettingsAdminData } from "@/lib/payments";
import { getStripeAdminCopy } from "@/lib/payments/stripe-admin-copy";

type AdminStripePaymentFormProps = {
  initialSettings: Pick<
    StorePaymentSettingsAdminData,
    "stripeEnabled" | "stripeSecretKeyHint" | "stripeWebhookSecretConfigured"
  >;
  webhookUrl: string;
};

export function AdminStripePaymentForm({
  initialSettings,
  webhookUrl,
}: AdminStripePaymentFormProps) {
  const router = useRouter();
  const copy = getStripeAdminCopy(readAdminLocaleFromDocument());
  const [settings, setSettings] = useState(initialSettings);
  const [enabled, setEnabled] = useState(initialSettings.stripeEnabled);
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [clearKeys, setClearKeys] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hasStoredKeys = Boolean(
    settings.stripeSecretKeyHint || settings.stripeWebhookSecretConfigured,
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const willHaveKey = Boolean(secretKey.trim() || settings.stripeSecretKeyHint);
    const willHaveWebhook = Boolean(
      webhookSecret.trim() || settings.stripeWebhookSecretConfigured,
    );
    if (enabled && !clearKeys && (!willHaveKey || !willHaveWebhook)) {
      setError(copy.missingKeys);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          stripeEnabled: clearKeys ? false : enabled,
          stripeSecretKey: secretKey || undefined,
          stripeWebhookSecret: webhookSecret || undefined,
          clearStripeKeys: clearKeys,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        settings?: StorePaymentSettingsAdminData;
      };

      if (!response.ok) {
        throw new Error(data.error ?? copy.errorFallback);
      }

      if (data.settings) {
        setSettings(data.settings);
        setEnabled(data.settings.stripeEnabled);
      }
      setSecretKey("");
      setWebhookSecret("");
      setClearKeys(false);
      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : copy.errorFallback,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard title={copy.title} description={copy.description} className="max-w-lg">
      <AdminForm onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          <p>
            <strong className="text-neutral-900">
              {settings.stripeEnabled ? copy.statusActive : copy.statusInactive}
            </strong>
          </p>
          {settings.stripeSecretKeyHint ? (
            <p className="mt-1 text-neutral-600">
              {copy.currentKey}{" "}
              <code className="rounded bg-white px-1 text-xs">
                {settings.stripeSecretKeyHint}
              </code>
            </p>
          ) : null}
          {settings.stripeWebhookSecretConfigured ? (
            <p className="mt-1 text-neutral-600">{copy.webhookSecretSaved}</p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            disabled={clearKeys}
          />
          {copy.enableLabel}
        </label>

        <div>
          <Label htmlFor="stripeSecretKey">{copy.secretKeyLabel}</Label>
          <Input
            id="stripeSecretKey"
            name="stripeSecretKey"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={
              settings.stripeSecretKeyHint
                ? copy.secretKeyPlaceholderKeep
                : copy.secretKeyPlaceholderNew
            }
            value={secretKey}
            onChange={(event) => setSecretKey(event.target.value)}
            className="text-base sm:text-sm"
          />
        </div>

        <div>
          <Label htmlFor="stripeWebhookSecret">{copy.webhookSecretLabel}</Label>
          <Input
            id="stripeWebhookSecret"
            name="stripeWebhookSecret"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={
              settings.stripeWebhookSecretConfigured
                ? copy.webhookSecretPlaceholderKeep
                : copy.webhookSecretPlaceholderNew
            }
            value={webhookSecret}
            onChange={(event) => setWebhookSecret(event.target.value)}
            className="text-base sm:text-sm"
          />
          <p className="mt-1.5 text-xs text-neutral-500">{copy.secretsHint}</p>
        </div>

        <div>
          <Label htmlFor="stripeWebhookUrl">{copy.webhookUrlLabel}</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="stripeWebhookUrl"
              readOnly
              value={webhookUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="font-mono text-xs"
            />
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? copy.copied : copy.copy}
            </Button>
          </div>
        </div>

        {hasStoredKeys ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              checked={clearKeys}
              onChange={(event) => setClearKeys(event.target.checked)}
            />
            {copy.clearKeys}
          </label>
        ) : null}

        <details className="group rounded-lg border border-neutral-200 bg-white text-sm">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium text-neutral-900">
            {copy.guideToggle}
          </summary>
          <div className="space-y-3 border-t border-neutral-200 px-4 py-3 text-neutral-700">
            <p className="text-neutral-600">{copy.guideIntro}</p>
            <ol className="list-decimal space-y-3 pl-5">
              {copy.guideSteps.map((step) => (
                <li key={step.title}>
                  <p className="font-medium text-neutral-900">{step.title}</p>
                  <p className="mt-0.5 break-words text-neutral-600">{step.body}</p>
                  {"link" in step && step.link ? (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-[var(--brand-primary)] hover:underline"
                    >
                      {step.link.label} →
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </details>

        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? <AdminFormAlert variant="success">{copy.saved}</AdminFormAlert> : null}

        <AdminFormActions>
          <Button type="submit" disabled={loading}>
            {loading ? copy.saving : copy.save}
          </Button>
        </AdminFormActions>
      </AdminForm>
    </AdminCard>
  );
}

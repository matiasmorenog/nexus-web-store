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
import { getMercadoPagoAdminCopy } from "@/lib/payments/mercado-pago-admin-copy";

type AdminPaymentSettingsFormProps = {
  initialSettings: StorePaymentSettingsAdminData;
  webhookUrl: string;
  readOnly?: boolean;
};

export function AdminPaymentSettingsForm({
  initialSettings,
  webhookUrl,
  readOnly = false,
}: AdminPaymentSettingsFormProps) {
  const router = useRouter();
  const copy = getMercadoPagoAdminCopy(readAdminLocaleFromDocument());
  const [settings, setSettings] = useState(initialSettings);
  const [accessToken, setAccessToken] = useState("");
  const [clearToken, setClearToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const sourceLabel =
    settings.mercadopagoSource === "admin"
      ? copy.sourceAdmin
      : settings.mercadopagoSource === "env"
        ? copy.sourceEnv
        : null;

  const handleCopy = async () => {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          mercadopagoAccessToken: accessToken || undefined,
          clearMercadopagoToken: clearToken,
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
      }

      setAccessToken("");
      setClearToken(false);
      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : copy.errorFallback,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard
      title={copy.title}
      description={copy.description}
      className="max-w-lg"
    >
      <AdminForm onSubmit={handleSubmit} className="space-y-4">
        {sourceLabel ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            <p>
              Estado:{" "}
              <strong className="text-neutral-900">{sourceLabel}</strong>
            </p>
            {settings.mercadopagoTokenHint ? (
              <p className="mt-1 text-neutral-600">
                {copy.currentToken}{" "}
                <code className="rounded bg-white px-1 text-xs">
                  {settings.mercadopagoTokenHint}
                </code>
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <Label htmlFor="mercadopagoAccessToken">{copy.accessTokenLabel}</Label>
          <Input
            id="mercadopagoAccessToken"
            name="mercadopagoAccessToken"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={
              settings.mercadopagoConfigured
                ? copy.accessTokenPlaceholderKeep
                : copy.accessTokenPlaceholderNew
            }
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            className="text-base sm:text-sm"
            disabled={readOnly}
          />
          <p className="mt-1.5 text-xs text-neutral-500">{copy.secretsHint}</p>
        </div>

        {webhookUrl ? (
          <div>
            <Label htmlFor="mercadopagoWebhookUrl">{copy.webhookUrlLabel}</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="mercadopagoWebhookUrl"
                readOnly
                value={webhookUrl}
                className="text-base sm:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleCopy()}
                disabled={readOnly}
              >
                {copied ? copy.copied : copy.copy}
              </Button>
            </div>
          </div>
        ) : null}

        {settings.mercadopagoSource === "admin" ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              checked={clearToken}
              onChange={(event) => setClearToken(event.target.checked)}
              disabled={readOnly}
            />
            {copy.clearToken}
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
                  <p className="mt-0.5 break-words text-neutral-600">
                    {step.body}
                  </p>
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
        {saved ? (
          <AdminFormAlert variant="success">{copy.saved}</AdminFormAlert>
        ) : null}

        {readOnly ? (
          <p className="text-sm text-neutral-500">{copy.readOnly}</p>
        ) : (
          <AdminFormActions>
            <Button type="submit" disabled={loading}>
              {loading ? copy.saving : copy.save}
            </Button>
          </AdminFormActions>
        )}
      </AdminForm>
    </AdminCard>
  );
}

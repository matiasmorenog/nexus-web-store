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
import type {
  CreatedApiKey,
  StoreApiKeySummary,
  StoreWebhookSettingsData,
} from "@/lib/store-api";

type AdminApiSettingsPanelProps = {
  apiKeys: StoreApiKeySummary[];
  webhookSettings: StoreWebhookSettingsData;
};

export function AdminApiSettingsPanel({
  apiKeys: initialApiKeys,
  webhookSettings: initialWebhookSettings,
}: AdminApiSettingsPanelProps) {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [webhookSettings, setWebhookSettings] = useState(initialWebhookSettings);
  const [keyName, setKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [loadingKey, setLoadingKey] = useState(false);
  const [loadingWebhook, setLoadingWebhook] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webhookSaved, setWebhookSaved] = useState(false);

  const handleCreateKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingKey(true);
    setError(null);
    setCreatedKey(null);

    try {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: keyName }),
      });
      const data = (await response.json()) as {
        error?: string;
        apiKey?: CreatedApiKey;
      };

      if (!response.ok || !data.apiKey) {
        throw new Error(data.error ?? "No se pudo crear la clave.");
      }

      setCreatedKey(data.apiKey);
      setKeyName("");
      setApiKeys((current) => [
        {
          id: data.apiKey!.id,
          name: data.apiKey!.name,
          keyPrefix: data.apiKey!.keyPrefix,
          createdAt: data.apiKey!.createdAt,
          lastUsedAt: null,
        },
        ...current,
      ]);
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear la clave.",
      );
    } finally {
      setLoadingKey(false);
    }
  };

  const handleRevokeKey = async (apiKeyId: string) => {
    if (!window.confirm("¿Revocar esta clave de API? No se puede deshacer.")) {
      return;
    }

    setRevokingId(apiKeyId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/api-keys/${apiKeyId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo revocar la clave.");
      }

      setApiKeys((current) => current.filter((key) => key.id !== apiKeyId));
      router.refresh();
    } catch (revokeError) {
      setError(
        revokeError instanceof Error
          ? revokeError.message
          : "No se pudo revocar la clave.",
      );
    } finally {
      setRevokingId(null);
    }
  };

  const handleSaveWebhook = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingWebhook(true);
    setError(null);
    setWebhookSaved(false);

    try {
      const response = await fetch("/api/admin/webhook-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(webhookSettings),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar el webhook.");
      }

      setWebhookSaved(true);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el webhook.",
      );
    } finally {
      setLoadingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminCard
        title="Claves de API"
        description="Usá Bearer auth en /api/v1/*. La clave completa solo se muestra al crearla."
      >
        {apiKeys.length === 0 ? (
          <p className="mb-4 text-sm text-neutral-600">
            Todavía no hay claves activas.
          </p>
        ) : (
          <ul className="mb-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {apiKeys.map((key) => (
              <li
                key={key.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-neutral-900">{key.name}</p>
                  <p className="font-mono text-xs text-neutral-600">
                    {key.keyPrefix}…
                  </p>
                  <p className="text-xs text-neutral-500">
                    Creada {new Date(key.createdAt).toLocaleString("es-AR")}
                    {key.lastUsedAt
                      ? ` · Último uso ${new Date(key.lastUsedAt).toLocaleString("es-AR")}`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={revokingId === key.id}
                  onClick={() => handleRevokeKey(key.id)}
                >
                  {revokingId === key.id ? "Revocando…" : "Revocar"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <AdminForm onSubmit={handleCreateKey} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key-name">Nombre de la clave</Label>
            <Input
              id="api-key-name"
              value={keyName}
              onChange={(event) => setKeyName(event.target.value)}
              placeholder="Integración ERP"
              required
            />
          </div>
          <AdminFormActions>
            <Button type="submit" disabled={loadingKey}>
              {loadingKey ? "Creando…" : "Generar clave"}
            </Button>
          </AdminFormActions>
        </AdminForm>

        {createdKey ? (
          <AdminFormAlert variant="success">
            <p className="font-medium">Copiá la clave ahora — no se volverá a mostrar:</p>
            <code className="mt-2 block break-all rounded bg-neutral-100 px-2 py-1 text-xs">
              {createdKey.key}
            </code>
          </AdminFormAlert>
        ) : null}
      </AdminCard>

      <AdminCard
        title="Webhooks"
        description="Recibí eventos POST firmados con HMAC (header X-Nexus-Signature)."
      >
        <AdminForm onSubmit={handleSaveWebhook} className="space-y-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              checked={webhookSettings.enabled}
              onChange={(event) =>
                setWebhookSettings((current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
            />
            Activar webhook
          </label>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL</Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookSettings.url ?? ""}
              onChange={(event) =>
                setWebhookSettings((current) => ({
                  ...current,
                  url: event.target.value,
                }))
              }
              placeholder="https://tu-servidor.com/webhooks/nexus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Secret (mín. 8 caracteres)</Label>
            <Input
              id="webhook-secret"
              type="password"
              value={webhookSettings.secret ?? ""}
              onChange={(event) =>
                setWebhookSettings((current) => ({
                  ...current,
                  secret: event.target.value,
                }))
              }
            />
          </div>
          <p className="text-xs text-neutral-500">
            Eventos disponibles: <code>order.paid</code>
          </p>

          {webhookSaved ? (
            <AdminFormAlert variant="success">
              Configuración de webhook guardada.
            </AdminFormAlert>
          ) : null}

          <AdminFormActions>
            <Button type="submit" disabled={loadingWebhook}>
              {loadingWebhook ? "Guardando…" : "Guardar webhook"}
            </Button>
          </AdminFormActions>
        </AdminForm>
      </AdminCard>

      {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
    </div>
  );
}

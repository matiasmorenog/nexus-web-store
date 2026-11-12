"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
} from "@/components/admin/admin-form";
import { AdminSetupGuide } from "@/components/admin/admin-setup-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { readAdminLocaleFromDocument } from "@/lib/admin-locale";
import { cn } from "@/lib/utils";
import {
  getShippingAdminCopy,
  SHIPPING_CARRIER_OPTIONS,
  type ShippingCarrierId,
  type StoreShippingSettingsAdminData,
  type StoreShippingSettingsSaveInput,
} from "@/lib/shipping-carriers";

type AdminShippingSettingsFormProps = {
  initialSettings: StoreShippingSettingsAdminData;
  readOnly?: boolean;
};

export function AdminShippingSettingsForm({
  initialSettings,
  readOnly = false,
}: AdminShippingSettingsFormProps) {
  const router = useRouter();
  const copy = getShippingAdminCopy(readAdminLocaleFromDocument());
  const meCopy = copy.mercadoEnvios;
  const correoCopy = copy.correo;
  const andreaniCopy = copy.andreani;

  const [settings, setSettings] = useState(initialSettings);
  const [accessToken, setAccessToken] = useState("");
  const [clearToken, setClearToken] = useState(false);
  const [correoUser, setCorreoUser] = useState("");
  const [correoPassword, setCorreoPassword] = useState("");
  const [clearCorreo, setClearCorreo] = useState(false);
  const [andreaniClientId, setAndreaniClientId] = useState("");
  const [andreaniClientSecret, setAndreaniClientSecret] = useState("");
  const [clearAndreani, setClearAndreani] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const meSourceLabels = {
    admin: meCopy.sourceAdmin,
    mp: meCopy.sourceMp,
    env: meCopy.sourceEnv,
    none: meCopy.sourceNone,
  } as const;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    const payload: StoreShippingSettingsSaveInput = {
      ...settings,
      mercadoEnviosAccessToken: accessToken || undefined,
      clearMercadoEnviosToken: clearToken,
      correoUser: correoUser || undefined,
      correoPassword: correoPassword || undefined,
      clearCorreoCredentials: clearCorreo,
      andreaniClientId: andreaniClientId || undefined,
      andreaniClientSecret: andreaniClientSecret || undefined,
      clearAndreaniCredentials: clearAndreani,
    };

    try {
      const response = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        settings?: StoreShippingSettingsAdminData;
      };

      if (!response.ok) {
        throw new Error(data.error ?? copy.errorFallback);
      }

      if (data.settings) {
        setSettings(data.settings);
      }

      setAccessToken("");
      setClearToken(false);
      setCorreoUser("");
      setCorreoPassword("");
      setClearCorreo(false);
      setAndreaniClientId("");
      setAndreaniClientSecret("");
      setClearAndreani(false);
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

  const toggleCarrier = (carrierId: ShippingCarrierId, on: boolean) => {
    setSettings((current) => {
      const nextIds = on
        ? ([...current.enabledCarrierIds, carrierId] as ShippingCarrierId[])
        : current.enabledCarrierIds.filter((id) => id !== carrierId);
      return {
        ...current,
        enabledCarrierIds: nextIds,
        preferredCarrierId: nextIds[0] ?? current.preferredCarrierId,
      };
    });
  };

  return (
    <AdminForm onSubmit={handleSubmit} className="space-y-6">
      <AdminCard
        title={meCopy.title}
        description={meCopy.description}
        className="max-w-lg"
      >
        <div className="space-y-3">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            <p>
              Token:{" "}
              <strong className="text-neutral-900">
                {meSourceLabels[settings.mercadoEnviosSource]}
              </strong>
            </p>
            {settings.mercadoEnviosTokenHint ? (
              <p className="mt-1 text-neutral-600">
                Guardado:{" "}
                <code className="rounded bg-white px-1 text-xs">
                  {settings.mercadoEnviosTokenHint}
                </code>
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="mercadoEnviosAccessToken">
              {meCopy.accessTokenLabel}
            </Label>
            <Input
              id="mercadoEnviosAccessToken"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={
                settings.mercadoEnviosSource === "admin"
                  ? meCopy.accessTokenPlaceholderKeep
                  : meCopy.accessTokenPlaceholderNew
              }
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              disabled={readOnly}
              className="text-base sm:text-sm"
            />
          </div>

          <div>
            <Label htmlFor="mercadoLibreQuoteItemId">{meCopy.mlaItemLabel}</Label>
            <Input
              id="mercadoLibreQuoteItemId"
              placeholder="MLA1234567890"
              disabled={readOnly}
              value={settings.mercadoLibreQuoteItemId}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  mercadoLibreQuoteItemId: event.target.value.trim(),
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">{meCopy.mlaItemHint}</p>
          </div>

          {settings.mercadoEnviosSource === "admin" ? (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
              <Switch
                checked={clearToken}
                onChange={(event) => setClearToken(event.target.checked)}
                disabled={readOnly}
              />
              {meCopy.clearToken}
            </label>
          ) : null}

          <AdminSetupGuide
            toggleLabel={meCopy.guideToggle}
            intro={meCopy.guideIntro}
            steps={meCopy.guideSteps}
          />
        </div>
      </AdminCard>

      <AdminCard
        title={correoCopy.title}
        description={correoCopy.description}
        className="max-w-lg"
      >
        <div className="space-y-3">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            <p>
              <strong className="text-neutral-900">
                {settings.correoConfigured
                  ? correoCopy.configured
                  : correoCopy.notConfigured}
              </strong>
              {settings.correoTokenHint ? (
                <>
                  {" · "}
                  <code className="rounded bg-white px-1 text-xs">
                    {settings.correoTokenHint}
                  </code>
                </>
              ) : null}
            </p>
          </div>

          <div>
            <Label htmlFor="correoUser">{correoCopy.userLabel}</Label>
            <Input
              id="correoUser"
              autoComplete="off"
              disabled={readOnly}
              value={correoUser}
              onChange={(event) => setCorreoUser(event.target.value)}
              className="text-base sm:text-sm"
            />
          </div>
          <div>
            <Label htmlFor="correoPassword">{correoCopy.passwordLabel}</Label>
            <Input
              id="correoPassword"
              type="password"
              autoComplete="off"
              disabled={readOnly}
              placeholder={
                settings.correoConfigured
                  ? correoCopy.passwordPlaceholderKeep
                  : undefined
              }
              value={correoPassword}
              onChange={(event) => setCorreoPassword(event.target.value)}
              className="text-base sm:text-sm"
            />
          </div>
          <div>
            <Label htmlFor="correoCustomerId">{correoCopy.customerIdLabel}</Label>
            <Input
              id="correoCustomerId"
              disabled={readOnly}
              value={settings.correoCustomerId}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  correoCustomerId: event.target.value.trim(),
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {correoCopy.customerIdHint}
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              checked={settings.correoSandbox}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  correoSandbox: event.target.checked,
                }))
              }
              disabled={readOnly}
            />
            {correoCopy.sandboxLabel}
          </label>
          {settings.correoConfigured ? (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
              <Switch
                checked={clearCorreo}
                onChange={(event) => setClearCorreo(event.target.checked)}
                disabled={readOnly}
              />
              {correoCopy.clearCredentials}
            </label>
          ) : null}

          <AdminSetupGuide
            toggleLabel={correoCopy.guideToggle}
            intro={correoCopy.guideIntro}
            steps={correoCopy.guideSteps}
          />
        </div>
      </AdminCard>

      <AdminCard
        title={andreaniCopy.title}
        description={andreaniCopy.description}
        className="max-w-lg"
      >
        <div className="space-y-3">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            <p>
              <strong className="text-neutral-900">
                {settings.andreaniConfigured
                  ? andreaniCopy.configured
                  : andreaniCopy.notConfigured}
              </strong>
              {settings.andreaniTokenHint ? (
                <>
                  {" · "}
                  <code className="rounded bg-white px-1 text-xs">
                    {settings.andreaniTokenHint}
                  </code>
                </>
              ) : null}
            </p>
          </div>

          <div>
            <Label htmlFor="andreaniClientId">{andreaniCopy.clientIdLabel}</Label>
            <Input
              id="andreaniClientId"
              autoComplete="off"
              disabled={readOnly}
              value={andreaniClientId}
              onChange={(event) => setAndreaniClientId(event.target.value)}
              className="text-base sm:text-sm"
            />
          </div>
          <div>
            <Label htmlFor="andreaniClientSecret">
              {andreaniCopy.clientSecretLabel}
            </Label>
            <Input
              id="andreaniClientSecret"
              type="password"
              autoComplete="off"
              disabled={readOnly}
              placeholder={
                settings.andreaniConfigured
                  ? andreaniCopy.clientSecretPlaceholderKeep
                  : undefined
              }
              value={andreaniClientSecret}
              onChange={(event) => setAndreaniClientSecret(event.target.value)}
              className="text-base sm:text-sm"
            />
          </div>
          <div>
            <Label htmlFor="andreaniContrato">{andreaniCopy.contratoLabel}</Label>
            <Input
              id="andreaniContrato"
              disabled={readOnly}
              value={settings.andreaniContrato}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  andreaniContrato: event.target.value.trim(),
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {andreaniCopy.contratoHint}
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              checked={settings.andreaniSandbox}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  andreaniSandbox: event.target.checked,
                }))
              }
              disabled={readOnly}
            />
            {andreaniCopy.sandboxLabel}
          </label>
          {settings.andreaniConfigured ? (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
              <Switch
                checked={clearAndreani}
                onChange={(event) => setClearAndreani(event.target.checked)}
                disabled={readOnly}
              />
              {andreaniCopy.clearCredentials}
            </label>
          ) : null}

          <AdminSetupGuide
            toggleLabel={andreaniCopy.guideToggle}
            intro={andreaniCopy.guideIntro}
            steps={andreaniCopy.guideSteps}
          />
        </div>
      </AdminCard>

      <AdminCard
        title={copy.globalTitle}
        description={copy.globalDescription}
        className="max-w-lg"
      >
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            disabled={readOnly}
            checked={settings.carriersEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                carriersEnabled: event.target.checked,
              }))
            }
          />
          {copy.carriersEnabled}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="originZip">{copy.originZipLabel}</Label>
            <Input
              id="originZip"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="1425"
              disabled={readOnly || !settings.carriersEnabled}
              value={settings.originZip}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  originZip: event.target.value.replace(/\D/g, "").slice(0, 8),
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-neutral-500">{copy.originZipHint}</p>
          </div>

          <div>
            <Label htmlFor="defaultWeightGrams">{copy.weightLabel}</Label>
            <Input
              id="defaultWeightGrams"
              type="number"
              min="100"
              step="50"
              inputMode="numeric"
              disabled={readOnly || !settings.carriersEnabled}
              value={String(settings.defaultWeightGrams)}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  defaultWeightGrams:
                    parseInt(event.target.value, 10) >= 100
                      ? parseInt(event.target.value, 10)
                      : 100,
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-neutral-500">{copy.weightHint}</p>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label>{copy.operatorsLabel}</Label>
            <p className="text-xs text-neutral-500">{copy.operatorsHint}</p>
            <div className="space-y-2 rounded-md border border-neutral-200 p-3">
              {SHIPPING_CARRIER_OPTIONS.map((carrier) => {
                const checked = settings.enabledCarrierIds.includes(carrier.id);
                const configured =
                  settings.carrierConfigured?.[carrier.id] ?? false;
                return (
                  <label
                    key={carrier.id}
                    className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"
                  >
                    <Switch
                      disabled={readOnly || !settings.carriersEnabled}
                      checked={checked}
                      onChange={(event) =>
                        toggleCarrier(carrier.id, event.target.checked)
                      }
                    />
                    <span className="flex flex-wrap items-center gap-2">
                      {carrier.label}
                      {!configured ? (
                        <span
                          className={cn(
                            "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800",
                          )}
                        >
                          {copy.missingConfigBadge}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title={copy.pickupTitle}
        description={copy.pickupDescription}
        className="max-w-lg"
      >
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            disabled={readOnly}
            checked={settings.allowPickup}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                allowPickup: event.target.checked,
              }))
            }
          />
          {copy.allowPickup}
        </label>
      </AdminCard>

      {error ? (
        <div className="max-w-lg">
          <AdminFormAlert variant="error">{error}</AdminFormAlert>
        </div>
      ) : null}
      {saved ? (
        <div className="max-w-lg">
          <AdminFormAlert variant="success">{copy.saved}</AdminFormAlert>
        </div>
      ) : null}

      <AdminFormActions className="max-w-lg">
        <Button type="submit" disabled={readOnly || loading}>
          {loading ? copy.saving : copy.save}
        </Button>
      </AdminFormActions>
    </AdminForm>
  );
}

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { readAdminLocaleFromDocument } from "@/lib/admin-locale";
import { transferPaymentDiscountLabel } from "@/lib/payments";
import {
  getBankingRegion,
  getTransferAdminCopy,
} from "@/lib/payments/transfer-copy";
import type { StorePaymentSettingsAdminData } from "@/lib/payments";

type AdminTransferPaymentFormProps = {
  initialSettings: Pick<
    StorePaymentSettingsAdminData,
    "transferEnabled" | "transferInstructions"
  >;
};

export function AdminTransferPaymentForm({
  initialSettings,
}: AdminTransferPaymentFormProps) {
  const router = useRouter();
  const copy = getTransferAdminCopy(
    getBankingRegion(),
    readAdminLocaleFromDocument(),
  );
  const [transferEnabled, setTransferEnabled] = useState(
    initialSettings.transferEnabled,
  );
  const [transferInstructions, setTransferInstructions] = useState(
    initialSettings.transferInstructions,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
          transferEnabled,
          transferInstructions,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? copy.errorFallback);
      }

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
      description={copy.description(transferPaymentDiscountLabel())}
      className="max-w-lg"
    >
      <AdminForm onSubmit={handleSubmit} className="space-y-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            checked={transferEnabled}
            onChange={(event) => setTransferEnabled(event.target.checked)}
          />
          {copy.enableLabel}
        </label>

        <div>
          <Label htmlFor="transfer-instructions">{copy.instructionsLabel}</Label>
          <textarea
            id="transfer-instructions"
            name="transferInstructions"
            rows={5}
            value={transferInstructions}
            disabled={!transferEnabled}
            onChange={(event) => setTransferInstructions(event.target.value)}
            placeholder={copy.instructionsPlaceholder}
            className="mt-1.5 flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 disabled:bg-neutral-50 disabled:text-neutral-500"
          />
          <p className="mt-1.5 text-xs text-neutral-500">{copy.instructionsHint}</p>
        </div>

        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? (
          <AdminFormAlert variant="success">{copy.savedMessage}</AdminFormAlert>
        ) : null}

        <AdminFormActions>
          <Button type="submit" disabled={loading}>
            {loading ? copy.savingLabel : copy.saveLabel}
          </Button>
        </AdminFormActions>
      </AdminForm>
    </AdminCard>
  );
}

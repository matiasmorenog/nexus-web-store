"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminForm, AdminFormAlert } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { cn } from "@/lib/utils";

type ChangePasswordFormProps = {
  variant?: "storefront" | "account" | "admin";
};

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
  hint,
  className,
  showLabel,
  hideLabel,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
  hint?: string;
  className?: string;
  showLabel: string;
  hideLabel: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className={cn("pr-10", className)}
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:text-neutral-800"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export function ChangePasswordForm({
  variant = "storefront",
}: ChangePasswordFormProps) {
  const copy = variant === "admin" ? null : getLocaleCopy();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError(copy?.passwordsMismatch ?? "Las contraseñas nuevas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo cambiar la contraseña");
      }

      setSuccess(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : (copy?.unexpectedError ?? "Error inesperado"));
    } finally {
      setLoading(false);
    }
  };

  const showLabel = copy?.showPassword ?? "Mostrar contraseña";
  const hideLabel = copy?.hidePassword ?? "Ocultar contraseña";
  const fieldClass = variant === "admin" ? "text-base sm:text-sm" : undefined;

  const fields = (
    <>
      <PasswordField
        id="current-password"
        name="currentPassword"
        label={copy?.currentPassword ?? "Contraseña actual"}
        autoComplete="current-password"
        className={fieldClass}
        showLabel={showLabel}
        hideLabel={hideLabel}
      />
      <PasswordField
        id="new-password"
        name="newPassword"
        label={copy?.newPassword ?? "Nueva contraseña"}
        autoComplete="new-password"
        minLength={6}
        className={fieldClass}
        showLabel={showLabel}
        hideLabel={hideLabel}
      />
      <PasswordField
        id="confirm-new-password"
        name="confirmPassword"
        label={copy?.confirmPassword ?? "Confirmar nueva contraseña"}
        autoComplete="new-password"
        minLength={6}
        hint={copy?.minPassword ?? "Mínimo 6 caracteres"}
        className={fieldClass}
        showLabel={showLabel}
        hideLabel={hideLabel}
      />
    </>
  );

  if (variant === "admin") {
    return (
      <AdminCard
        title="Seguridad"
        description="Cambiá la contraseña de tu cuenta de administración."
        className="max-w-lg"
      >
        <AdminForm onSubmit={handleSubmit}>
          {fields}
          {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
          {success ? (
            <AdminFormAlert variant="success">
              Contraseña actualizada correctamente.
            </AdminFormAlert>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </AdminForm>
      </AdminCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="space-y-4">
        {fields}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? (
          <p className="text-sm text-green-700">
            {copy?.passwordSaved ?? "Contraseña actualizada correctamente."}
          </p>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? (copy?.saving ?? "Guardando...") : (copy?.changePassword ?? "Cambiar contraseña")}
        </Button>
      </div>
    </form>
  );
}

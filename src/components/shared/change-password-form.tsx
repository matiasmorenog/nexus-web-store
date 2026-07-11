"use client";

import { useState } from "react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminForm, AdminFormAlert } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChangePasswordFormProps = {
  variant?: "storefront" | "account" | "admin";
};

export function ChangePasswordForm({
  variant = "storefront",
}: ChangePasswordFormProps) {
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
      setError("Las contraseñas nuevas no coinciden");
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
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const fields = (
    <>
      <div>
        <Label htmlFor="current-password">Contraseña actual</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={variant === "admin" ? "text-base sm:text-sm" : undefined}
        />
      </div>
      <div>
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={variant === "admin" ? "text-base sm:text-sm" : undefined}
        />
      </div>
      <div>
        <Label htmlFor="confirm-new-password">Confirmar nueva contraseña</Label>
        <Input
          id="confirm-new-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={variant === "admin" ? "text-base sm:text-sm" : undefined}
        />
        <p className="mt-1 text-xs text-neutral-500">Mínimo 6 caracteres</p>
      </div>
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
            Contraseña actualizada correctamente.
          </p>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}

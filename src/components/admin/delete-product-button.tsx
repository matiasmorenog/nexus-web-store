"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminTableIconAction } from "@/components/admin/admin-table";
import { deleteProduct } from "@/lib/admin-actions";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteProduct(productId);
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminTableIconAction
        label={`Eliminar ${productName}`}
        icon={Trash2}
        onClick={() => setConfirmOpen(true)}
        loading={loading}
        disabled={loading}
      />
      <AdminConfirmDialog
        open={confirmOpen}
        title="Eliminar producto"
        description={`¿Eliminar "${productName}"? Se borrarán también sus variantes. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={() => void handleConfirm()}
        onCancel={() => {
          if (!loading) setConfirmOpen(false);
        }}
      />
    </>
  );
}

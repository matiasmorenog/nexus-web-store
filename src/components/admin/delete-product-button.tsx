"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminTableIconAction } from "@/components/admin/admin-table";
import { deleteProduct } from "@/lib/admin-actions";
import {
  getAdminProductsCopy,
  readAdminLocaleFromDocument,
} from "@/lib/admin-locale";

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
  const copy = getAdminProductsCopy(readAdminLocaleFromDocument());

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
        label={copy.deleteProductAria(productName)}
        icon={Trash2}
        onClick={() => setConfirmOpen(true)}
        loading={loading}
        disabled={loading}
      />
      <AdminConfirmDialog
        open={confirmOpen}
        title={copy.deleteTitle}
        description={copy.deleteDescription(productName)}
        confirmLabel={copy.deleteConfirm}
        cancelLabel={copy.deleteCancel}
        loading={loading}
        onConfirm={() => void handleConfirm()}
        onCancel={() => {
          if (!loading) setConfirmOpen(false);
        }}
      />
    </>
  );
}

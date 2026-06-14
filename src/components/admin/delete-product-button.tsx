"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminTableIconAction } from "@/components/admin/admin-table";
import { deleteProduct } from "@/lib/admin-actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este producto?")) return;
    setLoading(true);
    await deleteProduct(productId);
    setLoading(false);
  };

  return (
    <AdminTableIconAction
      label="Eliminar producto"
      icon={Trash2}
      onClick={handleDelete}
      loading={loading}
      disabled={loading}
    />
  );
}

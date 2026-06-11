"use client";

import { useState } from "react";
import { deleteProduct } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este producto?")) return;
    setLoading(true);
    await deleteProduct(productId);
    setLoading(false);
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "..." : "Eliminar"}
    </Button>
  );
}

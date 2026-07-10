"use client";

import { useState } from "react";
import { AdminSearchField } from "@/components/admin/admin-filters";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { cn } from "@/lib/utils";

type AdminCrmSearchToolbarProps = {
  className?: string;
  query?: string;
};

function readSearchParams() {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function AdminCrmSearchToolbar({
  className,
  query: queryProp = "",
}: AdminCrmSearchToolbarProps) {
  const navigate = useAdminListNavigation();
  const [query, setQuery] = useState(queryProp);
  const [prevQueryProp, setPrevQueryProp] = useState(queryProp);

  if (queryProp !== prevQueryProp) {
    setPrevQueryProp(queryProp);
    setQuery(queryProp);
  }

  const applyQuery = (value: string) => {
    const params = readSearchParams();
    const trimmed = value.trim();

    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    const search = params.toString();
    navigate(search ? `/admin/modulos/crm?${search}` : "/admin/modulos/crm");
  };

  return (
    <div className={cn(className)}>
      <AdminSearchField
        value={query}
        onChange={setQuery}
        onClear={() => {
          setQuery("");
          applyQuery("");
        }}
        onSubmit={() => applyQuery(query)}
        placeholder="Nombre, email o teléfono"
        ariaLabel="Buscar cliente"
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";

type AdminOrdersUrlDefaultsProps = {
  desde: string;
  hasta: string;
};

/** Sincroniza la URL con el rango por defecto sin disparar otra navegación. */
export function AdminOrdersUrlDefaults({
  desde,
  hasta,
}: AdminOrdersUrlDefaultsProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("todos") === "1") return;
    if (params.has("desde") || params.has("hasta")) return;

    params.set("desde", desde);
    params.set("hasta", hasta);

    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `/admin/pedidos?${qs}` : "/admin/pedidos",
    );
  }, [desde, hasta]);

  return null;
}

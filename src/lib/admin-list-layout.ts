export const adminListLayoutRowClass =
  "flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8";

export const adminListMainColumnClass =
  "min-w-0 flex-1 space-y-4";

/** Columna principal de pedidos: ancho acotado para lectura en desktop. */
export const adminOrdersMainColumnClass =
  "min-w-0 flex-1 space-y-4 lg:max-w-3xl";

export const adminFiltersAsideClass =
  "hidden w-72 shrink-0 self-start lg:block";

/** Outer wrap — no overflow (overflow here clips AdminCard box-shadow). */
export const adminFiltersPanelShellClass = "h-fit w-full";

/** Scroll the filter body inside the card so the card shadow stays visible. */
export const adminFiltersPanelScrollClass =
  "lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto lg:overscroll-contain";

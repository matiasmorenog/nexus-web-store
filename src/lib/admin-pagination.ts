export const ADMIN_PRODUCTS_PAGE_SIZE = 20;

/** Cards con ítems anidados: payload más chico por request. */
export const ADMIN_ORDERS_PAGE_SIZE = 10;

/** @deprecated Usar ADMIN_PRODUCTS_PAGE_SIZE o ADMIN_ORDERS_PAGE_SIZE. */
export const ADMIN_LIST_PAGE_SIZE = ADMIN_PRODUCTS_PAGE_SIZE;

export function adminListSkip(
  page: number,
  pageSize: number = ADMIN_PRODUCTS_PAGE_SIZE,
) {
  return (page - 1) * pageSize;
}

export function adminOrdersListSkip(page: number) {
  return adminListSkip(page, ADMIN_ORDERS_PAGE_SIZE);
}

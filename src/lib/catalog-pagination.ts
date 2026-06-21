export const CATALOG_PAGE_SIZE = 12;

export function catalogListSkip(page: number) {
  return (page - 1) * CATALOG_PAGE_SIZE;
}

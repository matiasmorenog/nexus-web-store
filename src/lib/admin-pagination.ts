export const ADMIN_LIST_PAGE_SIZE = 20;

export function adminListSkip(page: number) {
  return (page - 1) * ADMIN_LIST_PAGE_SIZE;
}

/** Server actions return validation messages; thrown errors are masked in production builds. */
export type AdminActionResult = { error: string } | undefined;

export function throwIfAdminActionError(result: AdminActionResult): void {
  if (result?.error) throw new Error(result.error);
}

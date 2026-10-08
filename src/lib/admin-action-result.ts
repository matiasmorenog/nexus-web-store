/** Server actions return validation messages; thrown errors are masked in production builds. */
export type AdminActionResult = { error: string } | undefined;

/** Message already written for the admin user (returned by the server action). */
export class AdminActionError extends Error {}

export function throwIfAdminActionError(result: AdminActionResult): void {
  if (result?.error) throw new AdminActionError(result.error);
}

/** User-facing text for any failure around an admin server action call. */
export function adminActionErrorMessage(
  error: unknown,
  copy: { network: string; unexpected: string },
): string {
  if (error instanceof AdminActionError) return error.message;
  if (error instanceof TypeError) return copy.network;
  return copy.unexpected;
}

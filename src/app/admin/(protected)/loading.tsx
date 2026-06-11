export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[var(--brand-primary)]"
        role="status"
        aria-label="Cargando"
      />
    </div>
  );
}

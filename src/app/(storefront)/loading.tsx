export default function StorefrontLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200/80 bg-white px-8 py-10 shadow-sm">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[var(--brand-primary)]"
          role="status"
          aria-label="Cargando"
        />
        <p className="text-sm text-neutral-500">Cargando…</p>
      </div>
    </div>
  );
}

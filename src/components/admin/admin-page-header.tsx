type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-bold tracking-tight text-neutral-900">
          <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-0.5">
            {title}
          </span>
        </h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-neutral-500">{description}</p>
      ) : null}
    </div>
  );
}

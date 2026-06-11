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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-0.5">
            {title}
          </span>
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

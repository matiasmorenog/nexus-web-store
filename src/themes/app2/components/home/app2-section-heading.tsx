type App2SectionHeadingProps = {
  eyebrow: string;
  title: string;
  className?: string;
};

export function App2SectionHeading({ eyebrow, title, className = "" }: App2SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
        {eyebrow}
      </p>
      <h2 className="font-app2-display text-3xl font-bold tracking-tight text-[var(--brand-primary-light,#f0f0f5)] sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

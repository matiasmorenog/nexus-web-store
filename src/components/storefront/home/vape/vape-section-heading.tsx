type VapeSectionHeadingProps = {
  eyebrow: string;
  title: string;
  className?: string;
};

export function VapeSectionHeading({ eyebrow, title, className = "" }: VapeSectionHeadingProps) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
        {eyebrow}
      </p>
      <h2 className="font-vape-display text-3xl font-bold tracking-tight text-[var(--brand-primary-light,#f0f0f5)] sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

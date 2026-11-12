export type AdminSetupGuideStep = {
  title: string;
  body: string;
  link?: { label: string; href: string };
};

type AdminSetupGuideProps = {
  toggleLabel: string;
  intro: string;
  steps: readonly AdminSetupGuideStep[];
};

/** Collapsible setup guide — same pattern as Cobros (MP / Stripe). */
export function AdminSetupGuide({
  toggleLabel,
  intro,
  steps,
}: AdminSetupGuideProps) {
  return (
    <details className="group rounded-lg border border-neutral-200 bg-white text-sm">
      <summary className="cursor-pointer select-none px-4 py-3 font-medium text-neutral-900">
        {toggleLabel}
      </summary>
      <div className="space-y-3 border-t border-neutral-200 px-4 py-3 text-neutral-700">
        <p className="text-neutral-600">{intro}</p>
        <ol className="list-decimal space-y-3 pl-5">
          {steps.map((step) => (
            <li key={step.title}>
              <p className="font-medium text-neutral-900">{step.title}</p>
              <p className="mt-0.5 break-words text-neutral-600">{step.body}</p>
              {step.link ? (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-[var(--brand-primary)] hover:underline"
                >
                  {step.link.label} →
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}

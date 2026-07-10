import { cn } from "@/lib/utils";

function NightSky({ subtle = false }: { subtle?: boolean }) {
  return (
    <>
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--jungle-night-blue)] via-[var(--brand-primary-darker)] to-[var(--jungle-night-sky)]"
        aria-hidden
      />
      {!subtle && (
        <>
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_78%_8%,color-mix(in_srgb,var(--jungle-moon-glow)_22%,transparent),transparent_62%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_72%_12%,color-mix(in_srgb,var(--jungle-moon)_8%,transparent),transparent_50%)]"
            aria-hidden
          />
        </>
      )}
      {subtle && (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_75%_5%,color-mix(in_srgb,var(--jungle-moon-glow)_10%,transparent),transparent_55%)]"
          aria-hidden
        />
      )}
    </>
  );
}

function JungleMist({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 bottom-0", className)} aria-hidden>
      <div className="h-32 bg-gradient-to-t from-[color-mix(in_srgb,var(--brand-primary-dark)_55%,transparent)] via-[color-mix(in_srgb,var(--jungle-night-blue)_25%,transparent)] to-transparent sm:h-44" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/[0.04] via-[color-mix(in_srgb,var(--jungle-moon)_5%,transparent)] to-transparent blur-sm sm:h-32" />
      <div className="absolute bottom-4 left-[8%] h-16 w-[35%] rounded-full bg-[color-mix(in_srgb,var(--jungle-moon)_4%,transparent)] blur-2xl sm:h-24" />
      <div className="absolute bottom-2 right-[12%] h-20 w-[40%] rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] blur-3xl sm:h-28" />
    </div>
  );
}

type BackdropProps = {
  className?: string;
  subtle?: boolean;
};

/** Cielo nocturno, luz lunar difusa y niebla — solo gradientes CSS. */
export function App2JungleNightBackdrop({ className, subtle = false }: BackdropProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <NightSky subtle={subtle} />
      <JungleMist className={subtle ? "opacity-60" : undefined} />
    </div>
  );
}

/** Fondo atmosférico del hero. */
export function App2HeroNatureDecor() {
  return <App2JungleNightBackdrop />;
}

/** Fondo fijo para toda la home app2. */
export function App2JunglePageAtmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <App2JungleNightBackdrop subtle />
    </div>
  );
}

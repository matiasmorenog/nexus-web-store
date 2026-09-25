import Link from "next/link";
import { ManovivaMark } from "@/themes/app3/components/manoviva-mark";

type ManovivaLogoProps = {
  onClick?: () => void;
  compact?: boolean;
};

export function ManovivaLogo({ onClick, compact = false }: ManovivaLogoProps) {
  return (
    <Link href="/" onClick={onClick} className="group flex items-center gap-2.5">
      <ManovivaMark className={compact ? "h-9 w-9" : "h-10 w-10"} />
      <span className="flex flex-col leading-none">
        <strong className="font-manoviva text-xl font-semibold tracking-[-0.04em] text-[#202523] sm:text-2xl">
          Manoviva
        </strong>
        {!compact ? (
          <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#59605d] sm:text-[9px]">
            atelier fatto a mano
          </span>
        ) : null}
      </span>
    </Link>
  );
}

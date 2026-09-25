import { ImageResponse } from "next/og";
import { getOgBrandVisual, type OgBrandVisual } from "@/lib/seo/og-brand";

export type StoreIconSize = {
  width: number;
  height: number;
};

function App1Icon({ size }: { size: number }) {
  const fontSize = Math.round(size * 0.62);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#f13489",
        fontSize,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        lineHeight: 1,
      }}
    >
      G
    </div>
  );
}

function App2Icon({ size }: { size: number }) {
  const inset = Math.max(2, Math.round(size * 0.12));
  const radius = Math.max(4, Math.round(size * 0.18));
  const border = Math.max(2, Math.round(size * 0.06));
  const fontSize = Math.round(size * 0.38);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080e",
      }}
    >
      <div
        style={{
          display: "flex",
          width: size - inset * 2,
          height: size - inset * 2,
          borderRadius: radius,
          border: `${border}px solid #00e5ff`,
          alignItems: "center",
          justifyContent: "center",
          color: "#00e5ff",
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.06em",
          lineHeight: 1,
        }}
      >
        VX
      </div>
    </div>
  );
}

function App3Icon({ size }: { size: number }) {
  const mark = Math.round(size * 0.78);
  const stroke = Math.max(3, Math.round(size * 0.055));
  const dot = Math.max(2, Math.round(size * 0.045));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f5f2",
      }}
    >
      <svg width={mark} height={mark} viewBox="0 0 88 88">
        <path
          d="M17 65V23l27 31 27-31v42"
          fill="none"
          stroke="#202523"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={stroke}
        />
        <path
          d="M31 65c9-9 18-9 27 0"
          fill="none"
          stroke="#c86243"
          strokeLinecap="round"
          strokeWidth={stroke}
        />
        <circle cx="44" cy="18" r={dot} fill="#c86243" />
      </svg>
    </div>
  );
}

function IconForBrand({ brand, size }: { brand: OgBrandVisual; size: number }) {
  if (brand.kind === "app1") return <App1Icon size={size} />;
  if (brand.kind === "app2") return <App2Icon size={size} />;
  return <App3Icon size={size} />;
}

/** Tab / PWA icon from the same per-store brand tokens as Open Graph. */
export function createStoreIconImage(size: StoreIconSize): ImageResponse {
  const brand = getOgBrandVisual();
  const side = Math.min(size.width, size.height);

  return new ImageResponse(<IconForBrand brand={brand} size={side} />, {
    ...size,
  });
}

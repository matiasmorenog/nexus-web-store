import { ImageResponse } from "next/og";
import { getOgBrandVisual, OG_IMAGE_SIZE } from "@/lib/seo/og-brand";

const brand = getOgBrandVisual();

export const alt = brand.alt;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

function App1Brand() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 140,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "#f13489",
          lineHeight: 1,
        }}
      >
        GOAT
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: "0.28em",
          color: "#737373",
        }}
      >
        INDUMENTARIA
      </div>
    </div>
  );
}

function App2Brand() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          width: 120,
          height: 120,
          borderRadius: 24,
          border: "3px solid #00e5ff",
          alignItems: "center",
          justifyContent: "center",
          color: "#00e5ff",
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        VX
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "#f0f0f5",
        }}
      >
        <span>VAPOR</span>
        <span style={{ color: "#00e5ff" }}>X</span>
      </div>
    </div>
  );
}

function App3Brand() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <svg width="120" height="120" viewBox="0 0 88 88">
        <path
          d="M17 65V23l27 31 27-31v42"
          fill="none"
          stroke="#202523"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
        <path
          d="M31 65c9-9 18-9 27 0"
          fill="none"
          stroke="#c86243"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <circle cx="44" cy="18" r="4" fill="#c86243" />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "#202523",
            lineHeight: 1,
          }}
        >
          Manoviva
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.24em",
            color: "#59605d",
          }}
        >
          ATELIER FATTO A MANO
        </div>
      </div>
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.background,
        }}
      >
        {brand.kind === "app1" ? (
          <App1Brand />
        ) : brand.kind === "app2" ? (
          <App2Brand />
        ) : (
          <App3Brand />
        )}
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
    },
  );
}

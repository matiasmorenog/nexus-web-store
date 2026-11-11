export type AdminQrColorId = "black" | "brand" | "navy" | "forest" | "wine";

export type AdminQrModuleStyle = "square" | "rounded" | "dots";

export type AdminQrFrameStyle = "none" | "border" | "banner";

export type AdminQrStyle = {
  colorId: AdminQrColorId;
  showLogo: boolean;
  moduleStyle: AdminQrModuleStyle;
  frameStyle: AdminQrFrameStyle;
  framePhrase: string;
};

export const DEFAULT_ADMIN_QR_STYLE: AdminQrStyle = {
  colorId: "black",
  showLogo: false,
  moduleStyle: "square",
  frameStyle: "none",
  framePhrase: "SCAN ME",
};

export const ADMIN_QR_COLOR_PRESETS: Array<{
  id: AdminQrColorId;
  label: string;
  hex: string | "brand";
  swatch: string;
}> = [
  { id: "black", label: "Negro", hex: "#171717", swatch: "#171717" },
  {
    id: "brand",
    label: "Marca",
    hex: "brand",
    swatch: "var(--brand-primary)",
  },
  { id: "navy", label: "Azul", hex: "#1e40af", swatch: "#1e40af" },
  { id: "forest", label: "Verde", hex: "#166534", swatch: "#166534" },
  { id: "wine", label: "Bordo", hex: "#9f1239", swatch: "#9f1239" },
];

export const ADMIN_QR_MODULE_PRESETS: Array<{
  id: AdminQrModuleStyle;
  label: string;
}> = [
  { id: "square", label: "Cuadrado" },
  { id: "rounded", label: "Redondeado" },
  { id: "dots", label: "Puntos" },
];

export const ADMIN_QR_FRAME_PRESETS: Array<{
  id: AdminQrFrameStyle;
  label: string;
}> = [
  { id: "none", label: "Sin marco" },
  { id: "border", label: "Borde" },
  { id: "banner", label: "Con frase" },
];

/** 1–2 letter monogram from brand prefix (e.g. "Goat" → "G"). */
export function getQrMonogram(brandPrefix: string): string {
  const parts = brandPrefix
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean);
  if (parts.length === 0) return "N";
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

/**
 * Resolve fill color for QR modules.
 * Brand color must come from `brandColor` (server hex) — admin theme vars live on
 * `[data-admin-ui]` with `display: contents`, so `documentElement` has no `--brand-primary`.
 */
export function resolveAdminQrDarkColor(
  colorId: AdminQrColorId,
  brandColor?: string,
): string {
  const preset = ADMIN_QR_COLOR_PRESETS.find((item) => item.id === colorId);
  if (!preset) return "#171717";
  if (preset.hex !== "brand") return preset.hex;

  const explicit = brandColor?.trim();
  if (explicit) return explicit;

  if (typeof window === "undefined") return "#171717";
  const host =
    document.querySelector<HTMLElement>("[data-admin-ui]") ??
    document.body;
  const fromDom = getComputedStyle(host).getPropertyValue("--brand-primary").trim();
  return fromDom || "#171717";
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: AdminQrModuleStyle,
) {
  if (style === "dots") {
    const radius = size * 0.42;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (style === "rounded") {
    const radius = size * 0.28;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fill();
    return;
  }

  ctx.fillRect(x, y, size, size);
}

function drawMonogramLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  darkColor: string,
  monogram: string,
) {
  const logoBox = size * 0.22;
  const pad = logoBox * 0.18;
  const outer = logoBox + pad * 2;
  const cx = size / 2;
  const cy = size / 2;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(cx - outer / 2, cy - outer / 2, outer, outer, outer * 0.22);
  ctx.fill();

  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.roundRect(
    cx - logoBox / 2,
    cy - logoBox / 2,
    logoBox,
    logoBox,
    logoBox * 0.22,
  );
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${Math.round(logoBox * 0.42)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(monogram.slice(0, 2), cx, cy + 1);
}

type QrCodeApi = {
  create: (
    text: string,
    options?: { errorCorrectionLevel?: "L" | "M" | "Q" | "H" },
  ) => {
    modules: {
      size: number;
      get: (row: number, col: number) => boolean;
    };
  };
};

function drawQrMatrix(options: {
  text: string;
  size: number;
  darkColor: string;
  moduleStyle: AdminQrModuleStyle;
  showLogo: boolean;
  monogram: string;
  QRCode: QrCodeApi;
}): HTMLCanvasElement {
  const qr = options.QRCode.create(options.text, {
    errorCorrectionLevel: options.showLogo ? "H" : "M",
  });
  const count = qr.modules.size;
  const marginModules = 2;
  const totalModules = count + marginModules * 2;
  const cell = options.size / totalModules;

  const canvas = document.createElement("canvas");
  canvas.width = options.size;
  canvas.height = options.size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, options.size, options.size);
  ctx.fillStyle = options.darkColor;

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.modules.get(row, col)) continue;
      const x = (col + marginModules) * cell;
      const y = (row + marginModules) * cell;
      drawModule(ctx, x, y, cell, options.moduleStyle);
    }
  }

  if (options.showLogo) {
    drawMonogramLogo(ctx, options.size, options.darkColor, options.monogram);
  }

  return canvas;
}

function composeWithFrame(options: {
  qrCanvas: HTMLCanvasElement;
  darkColor: string;
  frameStyle: AdminQrFrameStyle;
  framePhrase: string;
}): HTMLCanvasElement {
  if (options.frameStyle === "none") return options.qrCanvas;

  const qrSize = options.qrCanvas.width;
  const pad = Math.round(qrSize * 0.08);
  const bannerH =
    options.frameStyle === "banner" ? Math.round(qrSize * 0.16) : 0;
  const width = qrSize + pad * 2;
  const height = qrSize + pad * 2 + bannerH;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return options.qrCanvas;

  ctx.fillStyle = options.darkColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, Math.round(width * 0.08));
  ctx.fill();

  const innerPad = Math.round(pad * 0.45);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(
    innerPad,
    innerPad,
    width - innerPad * 2,
    qrSize + pad * 2 - innerPad * 2,
    Math.round(width * 0.055),
  );
  ctx.fill();

  ctx.drawImage(options.qrCanvas, pad, pad);

  if (options.frameStyle === "banner") {
    const phrase = options.framePhrase.trim() || "SCAN ME";
    const pillW = Math.min(width * 0.72, width - pad * 2);
    const pillH = bannerH * 0.62;
    const pillX = (width - pillW) / 2;
    const pillY = qrSize + pad + (bannerH - pillH) / 2 - pad * 0.1;

    ctx.fillStyle = options.darkColor;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(pillH * 0.42)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(phrase.toUpperCase().slice(0, 18), width / 2, pillY + pillH / 2);
  }

  return canvas;
}

export async function renderStyledQrDataUrl(options: {
  text: string;
  size: number;
  darkColor: string;
  showLogo: boolean;
  monogram: string;
  moduleStyle: AdminQrModuleStyle;
  frameStyle: AdminQrFrameStyle;
  framePhrase: string;
}): Promise<string> {
  const QRCode = (await import("qrcode")).default as unknown as QrCodeApi;
  const qrCanvas = drawQrMatrix({
    text: options.text,
    size: options.size,
    darkColor: options.darkColor,
    moduleStyle: options.moduleStyle,
    showLogo: options.showLogo,
    monogram: options.monogram,
    QRCode,
  });

  const framed = composeWithFrame({
    qrCanvas,
    darkColor: options.darkColor,
    frameStyle: options.frameStyle,
    framePhrase: options.framePhrase,
  });

  return framed.toDataURL("image/png");
}

import type { Metadata } from "next";
import { DM_Sans, Inter, Oswald, Rajdhani, Sora } from "next/font/google";
import { Providers } from "@/components/providers";
import { getStoreSiteUrl } from "@/lib/seo/site-url";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";
import "./globals.css";

// Variable Google fonts: do not pass weight[]. Arrays are only valid for
// static fonts; wrong config breaks Turbopack builds with
// "next/font/google queries have exactly one entry".
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const config = getStorefrontConfig();
  const displayName = formatStoreName(store.name);

  return {
    metadataBase: new URL(getStoreSiteUrl()),
    title: displayName,
    description: config.metadata.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getStorefrontConfig().locale.split("-")[0];

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${oswald.variable} ${rajdhani.variable} ${dmSans.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PULSE - Real-Time Public Opinion Intelligence",
  description:
    "UK public data intelligence platform with 10 interactive data visualizations. Data from ONS, Bank of England, Electoral Commission, YouGov, Ipsos, and more.",
  openGraph: {
    title: "PULSE - Public Opinion Intelligence",
    description:
      "Real-time UK public data metrics and analysis from verified public sources",
    type: "website",
    siteName: "PULSE",
  },
  twitter: {
    card: "summary",
    title: "PULSE - UK Public Data Intelligence",
    description:
      "Real-time UK public data metrics from ONS, Bank of England, Electoral Commission, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${monoFont.variable} ${bodyFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

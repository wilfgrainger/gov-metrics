import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PULSE — Real-Time Public Opinion Intelligence",
  description:
    "UK public data intelligence platform with 10 interactive data visualizations. Data from ONS, Bank of England, Electoral Commission, YouGov, Ipsos, and more.",
  openGraph: {
    title: "PULSE — Public Opinion Intelligence",
    description: "Real-time UK public data metrics and analysis from verified public sources",
    type: "website",
    siteName: "PULSE",
  },
  twitter: {
    card: "summary",
    title: "PULSE — UK Public Data Intelligence",
    description: "Real-time UK public data metrics from ONS, Bank of England, Electoral Commission, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts loaded via link for runtime (falls back to system fonts at build time) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

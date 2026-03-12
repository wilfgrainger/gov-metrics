import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PULSE — Real-Time Public Opinion Intelligence",
  description:
    "YouGov-inspired public opinion metrics dashboard with 10 interactive data visualizations.",
  openGraph: {
    title: "PULSE — Public Opinion Intelligence",
    description: "Real-time UK public opinion metrics and analysis",
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

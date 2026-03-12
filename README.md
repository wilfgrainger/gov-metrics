# PULSE — Public Opinion Intelligence Dashboard

A YouGov-inspired public opinion metrics dashboard built with Next.js 16, TypeScript, Tailwind CSS v4, and Recharts.

## Design Language

**Editorial Brutalism** — stark white/black palette, `#FF3B00` accent, Bebas Neue display font, IBM Plex Mono for data labels, hard offset shadows, no rounded corners, thick borders.

**Fonts:** [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue), [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono), [Inter](https://fonts.google.com/specimen/Inter) — loaded via `<link>` tags in `app/layout.tsx` (Google Fonts CDN at runtime).

## 10 Interactive Metrics

| # | Component | Feature |
|---|-----------|---------|
| 01 | RadarChart | "Where Do I Stand?" — radar vs national average |
| 02 | SankeyDiagram | Demographic flow on voting age 16 |
| 03 | PolarizationMeter | UBI support distribution + Polarization Index |
| 04 | TrendLines | Trust in Government 2020–2025 with event pins |
| 05 | SentimentPulse | Live auto-updating ECG sentiment tracker |
| 06 | GeographicHeatmap | UK regional heatmap (Poll / Income / Age) |
| 07 | EchoChamberMap | Opinion correlation matrix |
| 08 | PredictionMarket | EU rejoining % prediction game |
| 09 | SentimentClusters | AI-clustered response bubble chart |
| 10 | ScenarioSliders | Turnout "what if" election scenario |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Stack

- **Next.js 16** · App Router
- **React 19** · TypeScript
- **Tailwind CSS v4**
- **Recharts 3** — charts and visualizations
- **Framer Motion** — available for animations

## Build

```bash
npm run build
```


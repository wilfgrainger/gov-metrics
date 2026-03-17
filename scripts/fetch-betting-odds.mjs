import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

const ODDSCHECKER_NEXT_PM_URL =
  "https://www.oddschecker.com/politics/british-politics/next-prime-minister-after-keir-starmer";
const ODDSCHECKER_MOST_SEATS_URL =
  "https://www.oddschecker.com/politics/british-politics/next-uk-general-election/most-seats";
const ODDSCHECKER_ELECTION_YEAR_URL =
  "https://www.oddschecker.com/politics/british-politics/next-uk-general-election/year-of-next-general-election";

const PARTY_COLOR_MAP = {
  Labour: "#E4003B",
  "Reform UK": "#12B6CF",
  Conservative: "#0087DC",
  Green: "#6AB023",
  "Liberal Democrats": "#FAA61A",
  "Workers Party": "#8B1E3F",
  Various: "#999999",
};

const NEXT_PM_PROFILE_MAP = {
  "Angela Rayner": { party: "Labour", role: "Deputy PM" },
  "Wes Streeting": { party: "Labour", role: "Health Secretary" },
  "Nigel Farage": { party: "Reform UK", role: "Reform UK Leader" },
  "Ed Miliband": { party: "Labour", role: "Energy Secretary" },
  "Keir Starmer": { party: "Labour", role: "Current PM" },
  "Shabana Mahmood": { party: "Labour", role: "Justice Secretary" },
  "Andy Burnham": { party: "Labour", role: "Greater Manchester Mayor" },
  "Rupert Lowe": { party: "Various", role: "Independent MP" },
  "Yvette Cooper": { party: "Labour", role: "Home Secretary" },
  "Kemi Badenoch": { party: "Conservative", role: "Conservative Leader" },
  "Robert Jenrick": { party: "Conservative", role: "Shadow Justice Secretary" },
  "Boris Johnson": { party: "Conservative", role: "Former PM" },
  "Rachel Reeves": { party: "Labour", role: "Chancellor" },
};

function safeParseFloat(value) {
  if (value == null) {
    return null;
  }

  const parsed = Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function stripHtml(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)))
    .trim();
}

function parseHtmlAttributes(fragment) {
  return Object.fromEntries(
    [...fragment.matchAll(/([a-zA-Z0-9:-]+)="([^"]*)"/g)].map((match) => [
      match[1],
      stripHtml(match[2]),
    ])
  );
}

function normalizeProbabilities(entries) {
  const weighted = entries
    .map((entry) => ({
      ...entry,
      probability: entry.decimalOdds > 1 ? 1 / entry.decimalOdds : 0,
    }))
    .filter((entry) => entry.probability > 0);

  const total = weighted.reduce((sum, entry) => sum + entry.probability, 0);
  if (total <= 0) {
    return [];
  }

  return weighted.map((entry) => ({
    ...entry,
    probability: (entry.probability / total) * 100,
  }));
}

function roundProbabilities(entries) {
  const floors = entries.map((entry) => Math.floor(entry.probability));
  let remaining = 100 - floors.reduce((sum, value) => sum + value, 0);
  const rankedFractions = entries
    .map((entry, index) => ({ index, fraction: entry.probability - floors[index] }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; index < rankedFractions.length && remaining > 0; index += 1) {
    floors[rankedFractions[index].index] += 1;
    remaining -= 1;
  }

  return entries.map((entry, index) => ({
    ...entry,
    probability: floors[index],
  }));
}

function collapseProbabilities(entries, limit, decorateOther) {
  const sorted = [...entries].sort((left, right) => right.probability - left.probability);
  if (sorted.length <= limit) {
    return roundProbabilities(sorted);
  }

  const primary = sorted.slice(0, limit);
  const remainderProbability = sorted
    .slice(limit)
    .reduce((sum, entry) => sum + entry.probability, 0);

  return roundProbabilities([
    ...primary,
    {
      ...decorateOther(),
      probability: remainderProbability,
    },
  ]);
}

function parseOddscheckerMarketRows(html) {
  const tableMatch = html.match(/<table[^>]*class="eventTable[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    throw new Error("Oddschecker market table not found");
  }

  const rowMatches = [...tableMatch[1].matchAll(/<tr class="diff-row evTabRow bc"([^>]*)>/gi)];
  if (rowMatches.length === 0) {
    throw new Error("Oddschecker market rows not found");
  }

  return rowMatches
    .map((match) => parseHtmlAttributes(match[1]))
    .map((attributes) => {
      const sportsbookBest = safeParseFloat(attributes["data-best-dig"]);
      const exchangeBest = safeParseFloat(attributes["data-best-dig-wo"]);
      const decimalOdds = Math.max(sportsbookBest ?? 0, exchangeBest ?? 0);
      return {
        name: attributes["data-bname"] ?? "",
        decimalOdds,
      };
    })
    .filter((entry) => entry.name && entry.decimalOdds > 1);
}

function normalizeMostSeatsName(name) {
  if (name === "Reform") {
    return "Reform UK";
  }
  if (name === "Conservatives") {
    return "Conservative";
  }
  if (name === "Workers Party of Britain") {
    return "Workers Party";
  }
  return name;
}

function bettingColor(name, fallback = "#666666") {
  return PARTY_COLOR_MAP[name] ?? fallback;
}

function buildNextPmOdds(rows) {
  const normalized = normalizeProbabilities(rows);
  const collapsed = collapseProbabilities(normalized, 5, () => ({
    name: "Other",
    party: "Various",
    color: bettingColor("Various", "#999999"),
    role: "Market remainder",
  }));

  return collapsed.map((entry) => {
    if (entry.name === "Other") {
      return entry;
    }

    const profile = NEXT_PM_PROFILE_MAP[entry.name] ?? { party: "Various", role: undefined };
    return {
      name: entry.name,
      party: profile.party,
      probability: entry.probability,
      color: bettingColor(profile.party, "#999999"),
      role: profile.role,
    };
  });
}

function buildMostSeatsOdds(rows) {
  const normalized = normalizeProbabilities(
    rows.map((entry) => ({ ...entry, name: normalizeMostSeatsName(entry.name) }))
  );
  const collapsed = collapseProbabilities(normalized, 4, () => ({
    party: "Other",
    color: "#666666",
  }));

  return collapsed.map((entry) => ({
    party: entry.party ?? entry.name,
    probability: entry.probability,
    color: entry.color ?? bettingColor(entry.name, "#666666"),
  }));
}

function buildYearOdds(rows) {
  const normalized = normalizeProbabilities(rows)
    .map((entry) => ({
      year: entry.name === "2029 or later" ? "2029+" : entry.name,
      probability: entry.probability,
      sortKey: entry.name === "2029 or later" ? 2029 : Number.parseInt(entry.name, 10),
    }))
    .sort((left, right) => left.sortKey - right.sortKey);

  return roundProbabilities(normalized).map(({ year, probability }) => ({
    year,
    probability,
  }));
}

async function fetchMarketHtml(page, url) {
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });

  if (!response || !response.ok()) {
    throw new Error(`Oddschecker returned ${response ? response.status() : "no response"} for ${url}`);
  }

  try {
    await page.waitForFunction(() => document.documentElement.innerHTML.includes("data-bname="), {
      timeout: 20_000,
    });
  } catch {
    await page.waitForTimeout(5_000);
  }

  return page.content();
}

function parseArgs(argv) {
  const outIndex = argv.indexOf("--out");
  return {
    outPath: outIndex >= 0 ? argv[outIndex + 1] : null,
  };
}

async function main() {
  const { outPath } = parseArgs(process.argv.slice(2));
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const context = await browser.newContext({
      userAgent: BROWSER_USER_AGENT,
      locale: "en-GB",
      timezoneId: "Europe/London",
      viewport: { width: 1440, height: 1200 },
      extraHTTPHeaders: {
        "accept-language": "en-GB,en;q=0.9",
      },
    });

    const urls = [
      ODDSCHECKER_NEXT_PM_URL,
      ODDSCHECKER_MOST_SEATS_URL,
      ODDSCHECKER_ELECTION_YEAR_URL,
    ];

    const pages = await Promise.all(urls.map(() => context.newPage()));
    const htmlPages = await Promise.all(
      pages.map((page, index) => fetchMarketHtml(page, urls[index]))
    );
    await Promise.all(pages.map((page) => page.close()));
    await context.close();

    const nextPmOdds = buildNextPmOdds(parseOddscheckerMarketRows(htmlPages[0]));
    const mostSeats = buildMostSeatsOdds(parseOddscheckerMarketRows(htmlPages[1]));
    const yearOdds = buildYearOdds(parseOddscheckerMarketRows(htmlPages[2]));

    if (nextPmOdds.length === 0 || mostSeats.length === 0 || yearOdds.length === 0) {
      throw new Error("Parsed betting snapshot is incomplete");
    }

    const payload = {
      section: "bettingOdds",
      fetchedAt: new Date().toISOString(),
      backend: "github-actions-playwright",
      sourceLabel: "Oddschecker politics markets via scheduled browser snapshot",
      data: {
        nextPmOdds,
        mostSeats,
        yearOdds,
      },
    };

    const serialized = `${JSON.stringify(payload, null, 2)}\n`;
    if (outPath) {
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, serialized, "utf8");
    } else {
      process.stdout.write(serialized);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

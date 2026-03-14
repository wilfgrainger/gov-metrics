#!/usr/bin/env python3
"""
fetch_intel.py — UK Public Data Intelligence Aggregator

Fetches REAL data from official UK public API endpoints and writes
a consolidated JSON file consumed by the dashboard.

ALL data in this script comes from external HTTP requests.
There are ZERO hardcoded mock values.

Sources:
  • ONS Website CSV Generator — GDP, CPI, unemployment, employment, public finances
  • Bank of England           — Official Bank Rate
  • Wikipedia                 — Election polling averages
  • NHS England               — Waiting list statistics

Run manually:
    python fetch_intel.py

Automated via GitHub Actions every 4 hours (see .github/workflows/fetch-data.yml).
"""

import csv
import html
import io
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

# ── Configuration ────────────────────────────────────────────────────────────

# ONS CSV Generator — the legacy api.ons.gov.uk was retired Nov 2024.
# The website CSV generator at www.ons.gov.uk/generator still works.
ONS_CSV_BASE = "https://www.ons.gov.uk/generator?format=csv&uri="

BOE_CSV = (
    "https://www.bankofengland.co.uk/boeapps/database/"
    "_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes={code}"
    "&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N"
)

OUTPUT_PATH = Path(os.environ.get(
    "OUTPUT_PATH",
    os.path.join(os.path.dirname(__file__), "public", "daily_threat_data.json"),
))

TIMEOUT = 20  # seconds per request
USER_AGENT = (
    "gov-metrics-fetcher/2.0 "
    "(GitHub Actions; +https://github.com/wilfgrainger/gov-metrics)"
)

# ONS time-series identifiers: (seriesId, datasetId, topicPath)
# topicPath is the ONS website path prefix for the CSV generator.
ONS_SERIES = {
    "cpi": (
        "D7G7", "MM23",
        "/economy/inflationandpriceindices/timeseries/d7g7/mm23",
    ),
    "unemployment": (
        "MGSX", "LMS",
        "/employmentandlabourmarket/peoplenotinwork/unemployment/timeseries/mgsx/lms",
    ),
    "employment": (
        "LF24", "LMS",
        "/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/timeseries/lf24/lms",
    ),
    "gdp_growth": (
        "IHYQ", "PN2",
        "/economy/grossdomesticproductgdp/timeseries/ihyq/pn2",
    ),
    "gdp_level": (
        "ABMI", "PN2",
        "/economy/grossdomesticproductgdp/timeseries/abmi/pn2",
    ),
    "psnd": (
        "HF6X", "PSF",
        "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/hf6x/psf",
    ),
    "psnb": (
        "J5II", "PSF",
        "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/j5ii/psf",
    ),
    "debt_gdp": (
        "HF6W", "PSF",
        "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/hf6w/psf",
    ),
    "tax_receipts": (
        "MF6U", "PSF",
        "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/mf6u/psf",
    ),
    "net_migration": (
        "CIMU", "MIG",
        "/peoplepopulationandcommunity/populationandmigration/internationalmigration/timeseries/cimu/mig",
    ),
    "immigration": (
        "CIML", "MIG",
        "/peoplepopulationandcommunity/populationandmigration/internationalmigration/timeseries/ciml/mig",
    ),
    "emigration": (
        "CIMM", "MIG",
        "/peoplepopulationandcommunity/populationandmigration/internationalmigration/timeseries/cimm/mig",
    ),
}


# ── HTTP helper ──────────────────────────────────────────────────────────────

def _get(url: str) -> str:
    """Fetch a URL and return the body as text."""
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read().decode("utf-8")


def _safe(fn, label: str):
    """Run *fn*; on failure log a warning and return None."""
    try:
        return fn()
    except Exception as exc:
        print(f"  ⚠  {label}: {exc}", file=sys.stderr)
        return None


# ── ONS CSV Generator Fetcher ────────────────────────────────────────────────

def fetch_ons_csv(topic_path: str, limit: int = 36) -> list[dict]:
    """
    Fetch a time series via the ONS website CSV generator.
    Returns [{"date": "2025 JAN", "value": 3.0}, …], most-recent last.

    The CSV generator output has metadata rows at the top, followed by
    data rows with date and value columns.
    """
    url = f"{ONS_CSV_BASE}{topic_path}"
    text = _get(url)
    lines = text.strip().splitlines()

    result = []
    for line in lines:
        # Skip metadata/header rows — data rows start with a year (4 digits)
        stripped = line.strip().strip('"')
        if not stripped or not stripped[:1].isdigit():
            continue
        # Parse CSV row: "2025 JAN","3.5" or 2025 JAN,3.5
        reader = csv.reader(io.StringIO(line))
        for row in reader:
            if len(row) < 2:
                continue
            date_str = row[0].strip().strip('"')
            val_str = row[1].strip().strip('"')
            if val_str in ("", ".."):
                continue
            try:
                result.append({
                    "date": date_str,
                    "value": round(float(val_str), 2),
                })
            except ValueError:
                continue

    return result[-limit:]


def fetch_ons_series(
    series_id: str,
    dataset_id: str,
    topic_path: str,
    period: str = "months",
    limit: int = 36,
) -> list[dict]:
    """
    Fetch an ONS time series. Uses the CSV generator (primary).
    Returns [{"date": "2025 JAN", "value": 3.0}, …], most-recent last.
    """
    return fetch_ons_csv(topic_path, limit)


def fetch_ons_latest(series_key: str) -> dict | None:
    """Convenience: fetch a series and return only the most-recent data point."""
    sid, did, path = ONS_SERIES[series_key]
    pts = fetch_ons_series(sid, did, path, limit=1)
    return pts[0] if pts else None


# ── Bank of England Fetcher ──────────────────────────────────────────────────

def fetch_boe_rate(series_code: str = "IUDBEDR", limit: int = 60) -> list[dict]:
    """
    Fetch a series from the Bank of England Statistical Database (CSV).
    Returns [{"date": "01/Feb/2025", "value": 4.50}, …].
    """
    url = BOE_CSV.format(code=series_code)
    text = _get(url)
    lines = text.strip().splitlines()[1:]  # skip header

    result = []
    for line in lines:
        parts = line.split(",")
        if len(parts) < 2:
            continue
        date_str = parts[0].strip()
        val_str = parts[1].strip()
        try:
            result.append({"date": date_str, "value": round(float(val_str), 4)})
        except ValueError:
            continue

    return result[-limit:]


# ── Wikipedia Polling Scraper ────────────────────────────────────────────────

WIKI_POLLING_URL = (
    "https://en.wikipedia.org/wiki/"
    "Opinion_polling_for_the_next_United_Kingdom_general_election"
)


def _extract_number(text: str) -> float | None:
    """Extract a number from text like '28%', '28', or '1,234'."""
    m = re.search(r"(\d+(?:[,\d]*)?(?:\.\d+)?)", text)
    if not m:
        return None
    return float(m.group(1).replace(",", ""))


def _strip_html(text: str) -> str:
    """Remove HTML tags and decode entities."""
    clean = re.sub(r"<[^>]+>", "", text)
    return html.unescape(clean).strip()


def fetch_wikipedia_polling() -> dict | None:
    """
    Scrape the Wikipedia UK general election opinion polling page
    to get recent polling data. Returns data matching ElectionPolling.tsx shape.
    """
    text = _get(WIKI_POLLING_URL)

    # Find polling tables — look for rows with polling data
    # Wikipedia tables have <tr> rows with <td> cells containing percentages
    table_pattern = re.compile(
        r'<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>(.*?)</table>',
        re.DOTALL,
    )
    tables = table_pattern.findall(text)
    if not tables:
        return None

    # Parse the first significant polling table
    recent_polls: list[dict] = []
    for table_html in tables[:3]:  # check first 3 tables
        rows = re.findall(r"<tr[^>]*>(.*?)</tr>", table_html, re.DOTALL)
        if len(rows) < 3:
            continue

        # Try to find header row with party names
        header_cells = re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", rows[0], re.DOTALL)
        header_texts = [_strip_html(c).lower() for c in header_cells]

        # Look for columns: find indices for Con, Lab, Lib Dem, Reform
        col_map: dict[str, int] = {}
        for i, h in enumerate(header_texts):
            if "con" in h:
                col_map["con"] = i
            elif "lab" in h and "lib" not in h:
                col_map["lab"] = i
            elif "lib" in h or "ld" in h:
                col_map["ld"] = i
            elif "reform" in h or "ref" in h:
                col_map["ref"] = i

        if len(col_map) < 3:
            continue

        # Parse data rows
        for row_html in rows[1:]:
            cells = re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", row_html, re.DOTALL)
            if len(cells) < max(col_map.values()) + 1:
                continue

            cell_texts = [_strip_html(c) for c in cells]

            # First cell often contains pollster name, second the date
            pollster = cell_texts[0] if len(cell_texts) > 0 else ""
            date_str = cell_texts[1] if len(cell_texts) > 1 else ""

            poll: dict = {"pollster": pollster, "date": date_str}
            valid = True
            for party, idx in col_map.items():
                val = _extract_number(cell_texts[idx]) if idx < len(cell_texts) else None
                if val is None or val > 70:  # no single UK party polls above ~70%
                    valid = False
                    break
                poll[party] = val

            if valid and poll.get("con") and poll.get("lab"):
                recent_polls.append(poll)
                if len(recent_polls) >= 8:
                    break

        if recent_polls:
            break

    if not recent_polls:
        return None

    # Calculate averages from recent polls for pollingData
    parties = {
        "REF": {"name": "Reform UK", "color": "#12B6CF", "key": "ref", "ge2024": 14},
        "LAB": {"name": "Labour", "color": "#E4003B", "key": "lab", "ge2024": 34},
        "CON": {"name": "Conservative", "color": "#0087DC", "key": "con", "ge2024": 24},
        "LD": {"name": "Liberal Democrats", "color": "#FAA61A", "key": "ld", "ge2024": 12},
    }

    polling_data = []
    for code, info in parties.items():
        values = [p.get(info["key"]) for p in recent_polls if p.get(info["key"]) is not None]
        if values:
            avg = round(sum(values) / len(values))
            change = avg - info["ge2024"]
            polling_data.append({
                "party": code,
                "name": info["name"],
                "pct": avg,
                "color": info["color"],
                "change": change,
            })

    # Sort by pct descending
    polling_data.sort(key=lambda x: x["pct"], reverse=True)

    # Format recent polls for component
    formatted_polls = []
    for p in recent_polls[:5]:
        formatted_polls.append({
            "pollster": p.get("pollster", "Unknown"),
            "date": p.get("date", ""),
            "lab": p.get("lab", 0),
            "con": p.get("con", 0),
            "ref": p.get("ref", 0),
            "ld": p.get("ld", 0),
        })

    return {
        "pollingData": polling_data,
        "recentPolls": formatted_polls,
    }


# ── NHS England Fetcher ──────────────────────────────────────────────────────

NHS_RTT_URL = (
    "https://www.england.nhs.uk/statistics/statistical-work-areas/"
    "rtt-waiting-times/rtt-data-2024-25/"
)


def fetch_nhs_waiting_list() -> dict | None:
    """
    Scrape the NHS England RTT page for headline waiting list figures.
    Returns data matching NHSStats.tsx FALLBACK shape keys.
    """
    text = _get(NHS_RTT_URL)

    # Extract waiting list numbers from the page text
    # NHS England pages typically mention total waiting list in millions
    numbers = re.findall(
        r"(\d+(?:\.\d+)?)\s*million\s*(?:patient|people|waiting)",
        text, re.IGNORECASE,
    )
    waiting_list = float(numbers[0]) if numbers else None

    if waiting_list is None:
        # Try broader pattern
        numbers = re.findall(r"waiting list.*?(\d+(?:\.\d+)?)\s*million", text, re.IGNORECASE)
        if numbers:
            waiting_list = float(numbers[0])

    if waiting_list is None:
        return None

    return {
        "headline": {
            "waitingList": waiting_list,
        },
    }


# ── Date helpers ─────────────────────────────────────────────────────────────

_MONTH_MAP = {
    "JAN": "01", "FEB": "02", "MAR": "03", "APR": "04",
    "MAY": "05", "JUN": "06", "JUL": "07", "AUG": "08",
    "SEP": "09", "OCT": "10", "NOV": "11", "DEC": "12",
}


def ons_date_to_epoch_ms(date_str: str) -> int | None:
    """Convert an ONS date like '2025 MAR' to epoch milliseconds (UTC)."""
    parts = date_str.strip().split()
    if len(parts) < 2:
        return None
    year = parts[0]
    month = _MONTH_MAP.get(parts[1].upper()[:3])
    if not month:
        return None
    dt = datetime(int(year), int(month), 1, tzinfo=timezone.utc)
    return int(dt.timestamp() * 1000)


def ons_date_short(date_str: str) -> str:
    """Convert '2025 JAN' → 'Jan 25' for display compatibility."""
    parts = date_str.strip().split()
    if len(parts) < 2:
        return date_str
    month = parts[1].capitalize()[:3]
    year = parts[0][-2:]
    return f"{month} {year}"


# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION BUILDERS — every value returned is fetched from an external API.
#  If an API call fails the builder returns None (NO mock fallback).
# ═══════════════════════════════════════════════════════════════════════════════

def build_sentiment_pulse() -> dict | None:
    """
    CPI inflation + Bank Rate + Unemployment → economicData array.
    Keys match SentimentPulse.tsx FALLBACK shape.
    """
    cpi = fetch_ons_series(*ONS_SERIES["cpi"], "months", 24)
    if not cpi:
        return None  # primary series unavailable

    boe = _safe(lambda: fetch_boe_rate("IUDBEDR", 120), "BoE Bank Rate")
    unemp = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["unemployment"], "months", 24),
        "Unemployment",
    )

    # Build a lookup for bank-rate by month
    boe_by_month: dict[str, float] = {}
    if boe:
        for p in boe:
            # BoE date format: "01/Jan/2025" → extract "Jan/2025"
            parts = p["date"].split("/")
            if len(parts) == 3:
                key = f"{parts[1][:3]}/{parts[2]}"
                boe_by_month[key] = p["value"]

    unemp_by_ons_date: dict[str, float] = {}
    if unemp:
        for p in unemp:
            unemp_by_ons_date[p["date"]] = p["value"]

    merged = []
    last_bank_rate = boe[-1]["value"] if boe else None
    for point in cpi:
        # Match unemployment by exact ONS date key (e.g. "2025 JAN")
        u_val = unemp_by_ons_date.get(point["date"])

        # Match bank rate: ONS "2025 JAN" → BoE "Jan/2025"
        parts = point["date"].split()
        boe_key = f"{parts[1].capitalize()[:3]}/{parts[0]}" if len(parts) >= 2 else ""
        b_val = boe_by_month.get(boe_key, last_bank_rate)

        merged.append({
            "date": ons_date_short(point["date"]),
            "inflation": point["value"],
            "bankRate": b_val,
            "unemployment": u_val,
        })

    return {"economicData": merged}


def build_gdp_tracker() -> dict | None:
    """
    GDP quarter-on-quarter growth + level from ONS.
    Keys match GDPTracker.tsx FALLBACK shape (gdpHistory).
    """
    growth = fetch_ons_series(*ONS_SERIES["gdp_growth"], "quarters", 40)
    if not growth:
        return None

    level = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["gdp_level"], "quarters", 40),
        "GDP level",
    )

    # Build a lookup {date → level in £trillion}
    level_map: dict[str, float] = {}
    if level:
        for p in level:
            level_map[p["date"]] = round(p["value"] / 1_000_000, 3)  # £m → £T

    # Assemble gdpHistory in the format GDPTracker.tsx expects
    gdp_history = []
    for p in growth:
        entry: dict = {
            "year": p["date"],      # e.g. "2024 Q3"
            "growth": p["value"],
        }
        total = level_map.get(p["date"])
        if total is not None:
            entry["total"] = total
        gdp_history.append(entry)

    return {"gdpHistory": gdp_history}


def build_employment_stats() -> dict | None:
    """
    Employment rate + Unemployment rate from ONS.
    Keys match EmploymentStats.tsx FALLBACK shape (employmentRate, unemploymentRate).
    """
    emp = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["employment"], "months", 24),
        "Employment rate",
    )
    unemp = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["unemployment"], "months", 24),
        "Unemployment rate",
    )

    if not emp and not unemp:
        return None

    result: dict = {}
    if emp:
        result["employmentRate"] = [{"date": p["date"], "value": p["value"]} for p in emp]
    if unemp:
        result["unemploymentRate"] = [{"date": p["date"], "value": p["value"]} for p in unemp]
    return result


def build_national_debt() -> dict | None:
    """
    Public sector net debt + net borrowing from ONS.
    ALL values fetched from the ONS Public Sector Finances dataset.
    Keys match NationalDebtCounter.tsx FALLBACK shape.
    """
    # Fetch actual net debt (£ million, monthly)
    debt_series = fetch_ons_series(*ONS_SERIES["psnd"], "months", 36)
    if not debt_series:
        return None  # Cannot proceed without debt figures

    borrowing_series = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["psnb"], "months", 36),
        "Net borrowing",
    )
    debt_gdp_series = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["debt_gdp"], "months", 12),
        "Debt-to-GDP",
    )

    # Latest debt figure
    latest = debt_series[-1]
    base_debt = round(latest["value"] * 1_000_000)  # £m → £
    base_date = ons_date_to_epoch_ms(latest["date"])
    if base_date is None:
        return None

    # Compute debt-per-second from latest 12-month net borrowing
    debt_per_second = 0
    if borrowing_series and len(borrowing_series) >= 12:
        annual_borrow = sum(p["value"] for p in borrowing_series[-12:]) * 1_000_000
        debt_per_second = round(annual_borrow / (365.25 * 24 * 3600))
    elif borrowing_series:
        n = len(borrowing_series)
        annual_borrow = sum(p["value"] for p in borrowing_series) * 1_000_000 * (12 / n)
        debt_per_second = round(annual_borrow / (365.25 * 24 * 3600))

    result: dict = {
        "baseDebt": base_debt,
        "baseDate": base_date,
        "debtPerSecond": debt_per_second,
    }

    # Debt-to-GDP ratio (latest)
    if debt_gdp_series:
        result["debtToGdp"] = debt_gdp_series[-1]["value"]

    return result


def build_tax_revenue() -> dict | None:
    """
    Tax receipts from ONS Public Sector Finances.
    Keys match TaxRevenue.tsx FALLBACK shape.
    """
    receipts = fetch_ons_series(*ONS_SERIES["tax_receipts"], "months", 36)
    if not receipts:
        return None

    # Build a tax burden history from available data
    # Group monthly receipts by financial year
    yearly: dict[str, list[float]] = {}
    for p in receipts:
        parts = p["date"].split()
        if len(parts) >= 1:
            year = parts[0]
            yearly.setdefault(year, []).append(p["value"])

    tax_burden_history = []
    for year, values in sorted(yearly.items()):
        total = sum(values)
        tax_burden_history.append({
            "year": year,
            "pct": round(total / len(values), 1),  # monthly average
        })

    # Latest month total receipts (annualised)
    if len(receipts) >= 12:
        total_annual = sum(p["value"] for p in receipts[-12:])
    else:
        total_annual = sum(p["value"] for p in receipts) * (12 / len(receipts))

    return {
        "totalReceipts": round(total_annual / 1000, 0),  # £m → £bn
        "taxBurdenHistory": tax_burden_history,
    }


def build_migration_stats() -> dict | None:
    """
    International migration estimates from ONS.
    Keys match MigrationStats.tsx FALLBACK shape.
    """
    net = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["net_migration"], "years", 20),
        "Net migration",
    )
    imm = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["immigration"], "years", 20),
        "Immigration",
    )
    emi = _safe(
        lambda: fetch_ons_series(*ONS_SERIES["emigration"], "years", 20),
        "Emigration",
    )

    if not net and not imm:
        return None

    # Build migration history
    migration_history = []
    net_by_year = {p["date"].strip(): p["value"] for p in (net or [])}
    imm_by_year = {p["date"].strip(): p["value"] for p in (imm or [])}
    emi_by_year = {p["date"].strip(): p["value"] for p in (emi or [])}

    all_years = sorted(set(list(net_by_year.keys()) + list(imm_by_year.keys())))
    for year in all_years[-10:]:
        entry: dict = {"year": year}
        if year in net_by_year:
            entry["net"] = round(net_by_year[year])
        if year in imm_by_year:
            entry["immigration"] = round(imm_by_year[year])
        if year in emi_by_year:
            entry["emigration"] = round(emi_by_year[year])
        migration_history.append(entry)

    return {"migrationHistory": migration_history}


def build_election_polling() -> dict | None:
    """
    UK election polling averages from Wikipedia.
    Keys match ElectionPolling.tsx FALLBACK shape.
    """
    return fetch_wikipedia_polling()


def build_nhs_stats() -> dict | None:
    """
    NHS waiting list headline figures from NHS England.
    Keys match NHSStats.tsx FALLBACK shape.
    """
    return fetch_nhs_waiting_list()


# ── Main ─────────────────────────────────────────────────────────────────────

SECTIONS: dict[str, tuple[str, object]] = {
    "sentimentPulse": (
        "ONS CPI (D7G7) + BoE Bank Rate + ONS Unemployment (MGSX)",
        build_sentiment_pulse,
    ),
    "gdpTracker": (
        "ONS GDP Growth (IHYQ) + Level (ABMI)",
        build_gdp_tracker,
    ),
    "employmentStats": (
        "ONS Employment (LF24) + Unemployment (MGSX)",
        build_employment_stats,
    ),
    "nationalDebt": (
        "ONS Net Debt (HF6X) + Net Borrowing (J5II)",
        build_national_debt,
    ),
    "taxRevenue": (
        "ONS Tax Receipts (MF6U)",
        build_tax_revenue,
    ),
    "migrationStats": (
        "ONS Migration Estimates (CIMU/CIML/CIMM)",
        build_migration_stats,
    ),
    "electionPolling": (
        "Wikipedia UK Opinion Polling",
        build_election_polling,
    ),
    "nhsStats": (
        "NHS England RTT Waiting Times",
        build_nhs_stats,
    ),
}


def main() -> None:
    now = datetime.now(timezone.utc)
    print(f"🔄  fetch_intel.py — {now.isoformat()}")
    print(f"    Output: {OUTPUT_PATH}")
    print()

    data: dict = {
        "meta": {
            "generatedAt": now.isoformat(),
            "generator": "fetch_intel.py",
            "version": "3.0",
            "note": (
                "ONS data fetched via CSV generator (www.ons.gov.uk/generator). "
                "The legacy api.ons.gov.uk was retired Nov 2024."
            ),
            "sources": {},
        }
    }

    ok_count = 0
    fail_count = 0

    for key, (source_label, builder) in SECTIONS.items():
        print(f"  → {key}")
        print(f"    API: {source_label}")
        result = _safe(builder, key)
        if result is not None:
            data[key] = result
            data["meta"]["sources"][key] = {
                "status": "ok",
                "source": source_label,
                "fetchedAt": now.isoformat(),
            }
            ok_count += 1
            print(f"    ✓  fetched ({len(json.dumps(result)):,} bytes)")
        else:
            data["meta"]["sources"][key] = {
                "status": "error",
                "source": source_label,
                "fetchedAt": now.isoformat(),
            }
            fail_count += 1
            print(f"    ✗  FAILED — section omitted (no mock data)")

    # Write output
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    print()
    print(f"{'✅' if fail_count == 0 else '⚠️ '}  Done: {ok_count} OK, {fail_count} failed")
    print(f"    Wrote {OUTPUT_PATH}  ({OUTPUT_PATH.stat().st_size:,} bytes)")

    # Exit with error code if ALL fetches failed
    if ok_count == 0 and fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()

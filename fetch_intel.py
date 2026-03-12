#!/usr/bin/env python3
"""
fetch_intel.py — UK Public Data Intelligence Aggregator

Fetches REAL data from official UK public API endpoints and writes
a consolidated JSON file consumed by the dashboard.

ALL data in this script comes from external HTTP requests.
There are ZERO hardcoded mock values.

Sources:
  • ONS Time Series API  — GDP, CPI, unemployment, employment, public finances
  • Bank of England      — Official Bank Rate

Run manually:
    python fetch_intel.py

Automated via GitHub Actions every 4 hours (see .github/workflows/fetch-data.yml).
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

# ── Configuration ────────────────────────────────────────────────────────────

ONS_API = "https://api.ons.gov.uk"
BOE_CSV = (
    "https://www.bankofengland.co.uk/boeapps/database/"
    "_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes={code}"
    "&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N"
)

OUTPUT_PATH = Path(os.environ.get(
    "OUTPUT_PATH",
    os.path.join(os.path.dirname(__file__), "public", "daily_threat_data.json"),
))

TIMEOUT = 15  # seconds per request
USER_AGENT = (
    "gov-metrics-fetcher/1.0 "
    "(GitHub Actions; +https://github.com/wilfgrainger/gov-metrics)"
)

# ONS time-series identifiers: (seriesId, datasetId)
ONS_SERIES = {
    "cpi":          ("D7G7", "MM23"),   # CPI annual rate %
    "unemployment": ("MGSX", "LMS"),    # ILO unemployment rate %
    "employment":   ("LF24", "LMS"),    # Employment rate (16-64) %
    "gdp_growth":   ("IHYQ", "PN2"),    # GDP quarter-on-quarter growth %
    "gdp_level":    ("ABMI", "PN2"),    # GDP at market prices £m (SA)
    "psnd":         ("HF6X", "PSF"),    # Public sector net debt £m
    "psnb":         ("J5II", "PSF"),    # Public sector net borrowing £m
    "debt_gdp":     ("HF6W", "PSF"),    # Public sector net debt as % of GDP
    "population":   ("EBAQ", "POP"),    # UK total population (thousands)
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


# ── ONS Fetcher ──────────────────────────────────────────────────────────────

def fetch_ons_series(
    series_id: str,
    dataset_id: str,
    period: str = "months",
    limit: int = 36,
) -> list[dict]:
    """
    Fetch a time series from the ONS API.
    Returns [{"date": "2025 JAN", "value": 3.0}, …], most-recent last.
    Raises on network / parse failure (caller decides how to handle).
    """
    url = f"{ONS_API}/timeseries/{series_id}/dataset/{dataset_id}/data"
    raw = json.loads(_get(url))
    points = raw.get(period, [])

    result = []
    for p in points:
        val = (p.get("value") or "").strip()
        if val == "" or val == "..":
            continue
        try:
            result.append({
                "date": (p.get("date") or "").strip(),
                "value": round(float(val), 2),
            })
        except ValueError:
            continue

    return result[-limit:]


def fetch_ons_latest(series_id: str, dataset_id: str, period: str = "months") -> dict | None:
    """Convenience: fetch a series and return only the most-recent data point."""
    pts = fetch_ons_series(series_id, dataset_id, period, limit=1)
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
    unemp = _safe(lambda: fetch_ons_series(*ONS_SERIES["unemployment"], "months", 24), "Unemployment")

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
    emp = _safe(lambda: fetch_ons_series(*ONS_SERIES["employment"], "months", 24), "Employment rate")
    unemp = _safe(lambda: fetch_ons_series(*ONS_SERIES["unemployment"], "months", 24), "Unemployment rate")

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


# ── Main ─────────────────────────────────────────────────────────────────────

SECTIONS: dict[str, tuple[str, object]] = {
    "sentimentPulse":  ("ONS CPI (D7G7) + BoE Bank Rate + ONS Unemployment (MGSX)", build_sentiment_pulse),
    "gdpTracker":      ("ONS GDP Growth (IHYQ) + Level (ABMI)",                     build_gdp_tracker),
    "employmentStats": ("ONS Employment (LF24) + Unemployment (MGSX)",               build_employment_stats),
    "nationalDebt":    ("ONS Net Debt (HF6X) + Net Borrowing (J5II)",                build_national_debt),
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
            "version": "2.0",
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

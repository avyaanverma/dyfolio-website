import type { FundamentalData } from "./types.js";

type CachedFundamental = {
  data: FundamentalData;
  expiresAt: number;
};

const fundamentalsCache = new Map<string, CachedFundamental>();

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function parseFinancialValue(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim();

  const match = cleaned.match(/^(-?\d+(?:\.\d+)?)([KMBT])?$/i);

  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2]?.toUpperCase();

  const multiplier =
    unit === "K"
      ? 1e3
      : unit === "M"
        ? 1e6
        : unit === "B"
          ? 1e9
          : unit === "T"
            ? 1e12
            : 1;

  return amount * multiplier;
}

export async function getGoogleFundamentals(
  symbol: string,
): Promise<FundamentalData | null> {
  const cached = fundamentalsCache.get(symbol);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const url = `https://www.google.com/finance/quote/${symbol}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      console.warn(`Google Finance failed for ${symbol}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    const peMatch = html.match(/P\/E ratio[\s\S]*?>([\d.]+)</i);

    const peRatio = peMatch ? Number(peMatch[1]) : null;

    const netIncomeRowMatch = html.match(
      /<tr[^>]*>[\s\S]*?<div[^>]*>Net income<\/div>[\s\S]*?<\/tr>/i,
    );

    let latestEarnings: number | null = null;

    if (netIncomeRowMatch) {
      const values = [
        ...netIncomeRowMatch[0].matchAll(
          /<div[^>]*class="CNzF7d"[^>]*>([^<]+)<\/div>/g,
        ),
      ].map((match) => match[1]);

      const latestValue = values.at(-1);

      if (latestValue && latestValue !== "-") {
        latestEarnings = parseFinancialValue(latestValue);
      }
    }
    const data = {
      symbol,
      peRatio,
      latestEarnings,
    };

    fundamentalsCache.set(symbol, {
      data,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return data;
  } catch (error) {
    console.warn(`Google Finance failed for ${symbol}:`, error);
    return null;
  }
}

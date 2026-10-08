"use client";

import { useEffect, useState } from "react";

import { getPortfolio } from "@/lib/api";
import type { Portfolio } from "@/lib/api";

import PortfolioHeader from "./PortfolioHeader";
import PortfolioStats from "./PortfolioStats";
import SectorSummary from "./SectorSummary";
import HoldingsTable from "./HoldingsTable";

const REQUEST_TIMEOUT_MS = 30_000;

export default function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      const controller = new AbortController();
      const timeout = window.setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      try {
        const data = await getPortfolio(controller.signal);

        if (cancelled) {
          return;
        }

        setPortfolio(data);
        setError(null);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof DOMException && error.name === "AbortError"
            ? "The server is taking too long. Please try again."
            : error instanceof Error
              ? error.message
              : "Unable to load the portfolio. Please try again.";

        setError(message);
        setLoading(false);
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void loadPortfolio();

    const interval = window.setInterval(() => {
      void loadPortfolio();
    }, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [retryKey]);

  if (loading || !portfolio) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          {error ? (
            <div className="max-w-md rounded border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{error}</p>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-white underline underline-offset-4"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setRetryKey((key) => key + 1);
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Loading portfolio market data… this can take up to 30 seconds.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <PortfolioHeader />

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <span>{error}</span>
            <button
              type="button"
              className="shrink-0 font-medium underline underline-offset-4"
              onClick={() => setRetryKey((key) => key + 1)}
            >
              Retry
            </button>
          </div>
        )}

        <PortfolioStats
          summary={portfolio.summary}
        />

        <SectorSummary
          sectors={portfolio.sectors}
        />

        <HoldingsTable
          holdings={portfolio.holdings}
        />
      </div>
    </main>
  );
}

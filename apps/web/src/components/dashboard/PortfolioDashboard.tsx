"use client";

import { useEffect, useState } from "react";

import { getPortfolio } from "@/lib/api";
import type { Portfolio } from "@/lib/api";

import PortfolioHeader from "./PortfolioHeader";
import PortfolioStats from "./PortfolioStats";
import SectorSummary from "./SectorSummary";
import HoldingsTable from "./HoldingsTable";

type PriceHistory = Record<number, number[]>;

export default function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const [priceHistory, setPriceHistory] =
    useState<PriceHistory>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      try {
        const data = await getPortfolio();

        if (cancelled) {
          return;
        }

        setPortfolio(data);

        setPriceHistory((previous) => {
          const next = { ...previous };

          for (const holding of data.holdings) {
            if (holding.cmp === null) {
              continue;
            }

            const existing = next[holding.id] ?? [];

            next[holding.id] = [
              ...existing,
              holding.cmp,
            ].slice(-30);
          }

          return next;
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to load portfolio:", error);

        if (!cancelled) {
          setLoading(false);
        }
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
  }, []);

  if (loading || !portfolio) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <p className="text-sm text-neutral-500">
            Loading portfolio...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <PortfolioHeader />

        <PortfolioStats
          summary={portfolio.summary}
        />

        <SectorSummary
          sectors={portfolio.sectors}
        />

        <HoldingsTable
          holdings={portfolio.holdings}
          priceHistory={priceHistory}
        />
      </div>
    </main>
  );
}
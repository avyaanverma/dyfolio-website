export type Holding = {
  id: number;
  stock: {
    name: string;
    exchangeCode: string;
    sector: string;
  };
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
};

export type Sector = {
  name: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
};

export type Portfolio = {
  summary: {
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
  };
  sectors: Sector[];
  holdings: Holding[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function getPortfolio(): Promise<Portfolio> {
  const response = await fetch(`${API_URL}/api/v1/portfolio`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio");
  }

  return response.json();
}

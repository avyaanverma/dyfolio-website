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
  priceHistory: PricePoint[];
  peRatio: number | null;
  latestEarnings: number | null;
};

export type PricePoint = {
  timestamp: number;
  price: number;
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

export async function getPortfolio(signal?: AbortSignal): Promise<Portfolio> {
  const response = await fetch(`${API_URL}/api/v1/portfolio`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(result?.message ?? "Failed to fetch portfolio");
  }

  const result : {
    success: boolean;
    statusCode: number;
    data: Portfolio;
    message: string;
  } = await response.json();

  return result.data;
}

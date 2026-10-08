import type { Portfolio } from "@/lib/api";

type PortfolioStatsProps = {
  summary: Portfolio["summary"];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PortfolioStats({ summary }: PortfolioStatsProps) {
  const { totalInvestment, totalPresentValue, totalGainLoss } = summary;

  const returnPercentage =
    totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100;

  const isProfit = totalGainLoss >= 0;

  return (
    <section className="border-b border-white/10 py-8 md:py-10">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Portfolio value
          </p>

          <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
            {formatCurrency(totalPresentValue)}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={
                isProfit
                  ? "text-sm font-medium text-green-500"
                  : "text-sm font-medium text-red-500"
              }
            >
              {isProfit ? "+" : "−"}
              {formatCurrency(Math.abs(totalGainLoss))}
            </span>

            <span className="text-neutral-600">/</span>

            <span
              className={
                isProfit ? "text-sm text-green-500" : "text-sm text-red-500"
              }
            >
              {isProfit ? "+" : "−"}
              {Math.abs(returnPercentage).toFixed(2)}%
            </span>
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">
          Live portfolio
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 border-t border-white/10 sm:grid-cols-3">
        <div className="border-b border-white/10 py-5 sm:border-b-0 sm:border-r sm:pr-6">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Investment
          </p>

          <p className="mt-2 text-lg font-medium">
            {formatCurrency(totalInvestment)}
          </p>
        </div>

        <div className="border-b border-white/10 py-5 sm:border-b-0 sm:px-6 sm:border-r">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Present value
          </p>

          <p className="mt-2 text-lg font-medium">
            {formatCurrency(totalPresentValue)}
          </p>
        </div>

        <div className="py-5 sm:pl-6">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Total P&L
          </p>

          <p
            className={`mt-2 text-lg font-medium ${
              isProfit ? "text-green-500" : "text-red-500"
            }`}
          >
            {isProfit ? "+" : "−"}
            {formatCurrency(Math.abs(totalGainLoss))}
          </p>
        </div>
      </div>
    </section>
  );
}

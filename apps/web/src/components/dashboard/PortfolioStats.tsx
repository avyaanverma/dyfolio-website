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
    <section className="border-b py-10">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
        Current portfolio value
      </p>

      <div className="mt-3 text-5xl font-medium tracking-tight">
        {formatCurrency(totalPresentValue)}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          className={
            isProfit
              ? "text-sm font-medium text-green-600"
              : "text-sm font-medium text-red-600"
          }
        >
          {isProfit ? "+" : "−"}
          {formatCurrency(Math.abs(totalGainLoss))}
        </span>

        <span
          className={
            isProfit ? "text-sm text-green-600" : "text-sm text-red-600"
          }
        >
          {isProfit ? "+" : "−"}
          {Math.abs(returnPercentage).toFixed(2)}%
        </span>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Investment
          </p>

          <p className="mt-2 text-lg font-medium">
            {formatCurrency(totalInvestment)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Present value
          </p>

          <p className="mt-2 text-lg font-medium">
            {formatCurrency(totalPresentValue)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Total P&L
          </p>

          <p
            className={`mt-2 text-lg font-medium ${
              isProfit ? "text-green-600" : "text-red-600"
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

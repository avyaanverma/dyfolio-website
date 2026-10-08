import type { Sector } from "@/lib/api";

type SectorSummaryProps = {
  sectors: Sector[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SectorSummary({ sectors }: SectorSummaryProps) {
  const totalInvestment = sectors.reduce(
    (total, sector) => total + sector.totalInvestment,
    0,
  );

  return (
    <section className="border-b border-white/10 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Allocation
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight">By sector</h2>
        </div>

        <p className="text-xs text-neutral-500">Based on invested capital</p>
      </div>

      <div className="space-y-6">
        {sectors.map((sector) => {
          const percentage =
            totalInvestment === 0
              ? 0
              : (sector.totalInvestment / totalInvestment) * 100;

          const isProfit = sector.totalGainLoss >= 0;

          return (
            <div key={sector.name}>
              <div className="flex items-end justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{sector.name}</span>

                    <span className="text-xs text-neutral-500">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-neutral-500">
                    {formatCurrency(sector.totalInvestment)} invested
                    <span className="mx-2 text-neutral-700">·</span>
                    {formatCurrency(sector.totalPresentValue)} current
                  </div>
                </div>

                <div
                  className={`shrink-0 text-sm font-medium tabular-nums ${
                    isProfit ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isProfit ? "+" : "−"}
                  {formatCurrency(Math.abs(sector.totalGainLoss))}
                </div>
              </div>

              <div className="mt-3 h-1 w-full bg-white/10">
                <div
                  className="h-full bg-white transition-all duration-700 ease-out"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

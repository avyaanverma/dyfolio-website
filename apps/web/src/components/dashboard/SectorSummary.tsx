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
    <section className="border-b py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Allocation
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight">By sector</h2>
        </div>

        <p className="text-xs text-neutral-500">Based on invested capital</p>
      </div>

      <div className="space-y-5">
        {sectors.map((sector) => {
          const percentage =
            totalInvestment === 0
              ? 0
              : (sector.totalInvestment / totalInvestment) * 100;

          return (
            <div key={sector.name}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{sector.name}</span>

                <span className="text-neutral-500">
                  {formatCurrency(sector.totalInvestment)} ·{" "}
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="h-1.5 w-full bg-neutral-200">
                <div
                  className="h-full bg-neutral-900 transition-all duration-700 ease-out"
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

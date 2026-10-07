const sectors = [
  {
    name: "Financial Sector",
    investment: 288450,
    percentage: 17.19,
  },
  {
    name: "Tech Sector",
    investment: 298420,
    percentage: 17.78,
  },
  {
    name: "Consumer",
    investment: 263565,
    percentage: 15.7,
  },
  {
    name: "Power",
    investment: 159060,
    percentage: 9.48,
  },
  {
    name: "Pipe Sector",
    investment: 198656,
    percentage: 11.84,
  },
  {
    name: "Others",
    investment: 470476,
    percentage: 28.03,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SectorSummary() {
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
        {sectors.map((sector) => (
          <div key={sector.name}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{sector.name}</span>

              <span className="text-neutral-500">
                {formatCurrency(sector.investment)} ·{" "}
                {sector.percentage.toFixed(1)}%
              </span>
            </div>

            <div className="h-1.5 w-full bg-neutral-200">
              <div
                className="h-full bg-neutral-900"
                style={{ width: `${sector.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

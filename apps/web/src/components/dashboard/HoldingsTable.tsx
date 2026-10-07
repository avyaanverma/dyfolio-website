const holdings = [
  {
    name: "HDFC Bank",
    code: "HDFCBANK",
    quantity: 50,
    purchasePrice: 1490,
    cmp: 702.75,
    presentValue: 35137.5,
    gainLoss: -39362.5,
    peRatio: 13.77,
  },
  {
    name: "Bajaj Finance",
    code: "BAJFINANCE",
    quantity: 15,
    purchasePrice: 6466,
    cmp: 963.85,
    presentValue: 14457.75,
    gainLoss: -82532.25,
    peRatio: 29.76,
  },
  {
    name: "ICICI Bank",
    code: "532174",
    quantity: 84,
    purchasePrice: 780,
    cmp: 1357,
    presentValue: 113988,
    gainLoss: 48468,
    peRatio: 17.54,
  },
  {
    name: "Affle India",
    code: "AFFLE",
    quantity: 50,
    purchasePrice: 1151,
    cmp: 1436,
    presentValue: 71800,
    gainLoss: 14250,
    peRatio: 42.45,
  },
  {
    name: "Tata Power",
    code: "500400",
    quantity: 225,
    purchasePrice: 224,
    cmp: 345,
    presentValue: 77625,
    gainLoss: 27225,
    peRatio: 28.58,
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return `₹${formatNumber(value)}`;
}

export default function HoldingsTable() {
  return (
    <section className="py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Portfolio
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight">Holdings</h2>
        </div>

        <p className="text-xs text-neutral-500">29 positions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-neutral-500">
              <th className="pb-4 font-medium">Stock</th>
              <th className="pb-4 text-right font-medium">Qty</th>
              <th className="pb-4 text-right font-medium">Buy Price</th>
              <th className="pb-4 text-right font-medium">CMP</th>
              <th className="pb-4 text-right font-medium">Value</th>
              <th className="pb-4 text-right font-medium">P&L</th>
              <th className="pb-4 text-right font-medium">P/E</th>
            </tr>
          </thead>

          <tbody>
            {holdings.map((holding) => {
              const isProfit = holding.gainLoss >= 0;

              return (
                <tr
                  key={holding.code}
                  className="border-b border-neutral-200 last:border-0"
                >
                  <td className="py-5">
                    <div className="font-medium">{holding.name}</div>

                    <div className="mt-1 text-xs text-neutral-500">
                      {holding.code}
                    </div>
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.quantity}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {formatCurrency(holding.purchasePrice)}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {formatCurrency(holding.cmp)}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {formatCurrency(holding.presentValue)}
                  </td>

                  <td
                    className={`py-5 text-right font-medium tabular-nums ${
                      isProfit ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isProfit ? "+" : "−"}
                    {formatCurrency(Math.abs(holding.gainLoss))}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.peRatio}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

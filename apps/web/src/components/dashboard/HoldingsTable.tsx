import Sparkline from "./Sparkline";
import type { Holding } from "@/lib/api";

type HoldingsTableProps = {
  holdings: Holding[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return `₹${formatNumber(value)}`;
}

export default function HoldingsTable({
  holdings,
}: HoldingsTableProps) {
  return (
    <section className="py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Portfolio
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight">Holdings</h2>
        </div>

        <p className="text-xs text-neutral-500">{holdings.length} positions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              <th className="pb-4 font-medium">Stock</th>
              <th className="pb-4 text-right font-medium">Qty</th>
              <th className="pb-4 text-right font-medium">Buy Price</th>
              <th className="pb-4 text-right font-medium">CMP</th>
              <th className="pb-4 text-right font-medium">Value</th>
              <th className="pb-4 text-right font-medium">P&L</th>
              <th className="pb-4 text-right font-medium">P/E</th>
              <th className="pb-4 text-right font-medium">Trend</th>
            </tr>
          </thead>

          <tbody>
            {holdings.map((holding) => {
              const isProfit = (holding.gainLoss ?? 0) >= 0;

              return (
                <tr
                  key={holding.id}
                  className="group border-b border-white/10 transition-colors duration-200 hover:bg-white/[0.025] last:border-0"
                >
                  <td className="py-5">
                    <div className="font-medium transition-transform duration-200 group-hover:translate-x-1">
                      {holding.stock.name}
                    </div>

                    <div className="mt-1 text-xs text-neutral-500">
                      {holding.stock.exchangeCode}
                      <span className="mx-1.5 text-neutral-700">·</span>
                      {holding.stock.sector}
                    </div>
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.quantity}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {formatCurrency(holding.purchasePrice)}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.cmp === null ? "—" : formatCurrency(holding.cmp)}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.presentValue === null
                      ? "—"
                      : formatCurrency(holding.presentValue)}
                  </td>

                  <td
                    className={`py-5 text-right font-medium tabular-nums ${
                      holding.gainLoss === null
                        ? "text-neutral-500"
                        : isProfit
                          ? "text-green-500"
                          : "text-red-500"
                    }`}
                  >
                    {holding.gainLoss === null
                      ? "—"
                      : `${isProfit ? "+" : "−"}${formatCurrency(
                          Math.abs(holding.gainLoss),
                        )}`}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.peRatio === null
                      ? "—"
                      : holding.peRatio.toFixed(2)}
                  </td>

                  <td className="py-5">
                    <div className="flex justify-end">
                      <Sparkline
                        data={holding.priceHistory}
                      />
                    </div>
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

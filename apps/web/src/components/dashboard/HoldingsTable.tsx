import Sparkline from "./Sparkline";
import type { Holding } from "@/lib/api";

type HoldingsTableProps = {
  holdings: Holding[];
  priceHistory: Record<number, number[]>;
};
// function formatNumber(value: number) {
//   return new Intl.NumberFormat("en-IN", {
//     maximumFractionDigits: 2,
//   }).format(value);
// }
// function formatCurrency(value: number) {
//   return `₹${formatNumber(value)}`;
// }

export default function HoldingsTable({
  holdings,
  priceHistory,
}: HoldingsTableProps) {
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
        <table className="w-full min-w-225 border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-neutral-500">
              <th className="pb-4 font-medium">Stock</th>
              <th className="pb-4 text-right font-medium">Qty</th>
              <th className="pb-4 text-right font-medium">Buy Price</th>
              <th className="pb-4 text-right font-medium">CMP</th>
              <th className="pb-4 text-right font-medium">Value</th>
              <th className="pb-4 text-right font-medium">P&L</th>
              <th className="pb-4 text-right font-medium">P/E</th>
              <th className="pb-4 font-medium">Stock</th>
              <th className="pb-4 font-medium">Trend</th>
            </tr>
          </thead>

          <tbody>
            {holdings.map((holding) => {
              const isProfit = (holding.gainLoss ?? 0) >= 0;

              return (
                <tr
                  key={holding.id}
                  className="group border-b border-white/10 transition-all duration-300 hover:bg-white/2.5 last:border-0"
                >
                  <td className="py-5">
                    <div className="font-medium">{holding.stock.name}</div>

                    <div className="mt-1 text-xs text-neutral-500">
                      {holding.stock.exchangeCode}
                    </div>
                  </td>

                  <td className="py-5">
                    <Sparkline
                      data={priceHistory[holding.id] ?? []}
                      positive={isProfit}
                    />
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.quantity}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    ₹{holding.purchasePrice.toLocaleString("en-IN")}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.cmp === null
                      ? "—"
                      : `₹${holding.cmp.toLocaleString("en-IN")}`}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.presentValue === null
                      ? "—"
                      : `₹${holding.presentValue.toLocaleString("en-IN")}`}
                  </td>

                  <td
                    className={`py-5 text-right font-medium tabular-nums ${
                      isProfit ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {holding.gainLoss === null
                      ? "—"
                      : `${isProfit ? "+" : "−"}₹${Math.abs(
                          holding.gainLoss,
                        ).toLocaleString("en-IN")}`}
                  </td>

                  <td className="py-5 text-right tabular-nums">
                    {holding.peRatio ?? "—"}
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

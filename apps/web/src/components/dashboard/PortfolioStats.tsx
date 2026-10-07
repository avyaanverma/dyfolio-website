export default function PortfolioStats() {
  return (
    <section className="border-b py-10">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
        Current portfolio value
      </p>

      <div className="mt-3 text-5xl font-medium tracking-tight">
        ₹13,98,694.81
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm font-medium text-red-600">−₹2,79,932.19</span>

        <span className="text-sm text-red-600">−16.68%</span>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Investment
          </p>

          <p className="mt-2 text-lg font-medium">₹16,78,627</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Present value
          </p>

          <p className="mt-2 text-lg font-medium">₹13,98,694.81</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Total P&L
          </p>

          <p className="mt-2 text-lg font-medium text-red-600">−₹2,79,932.19</p>
        </div>
      </div>
    </section>
  );
}

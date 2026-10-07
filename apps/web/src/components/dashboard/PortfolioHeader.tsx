export default function PortfolioHeader() {
  return (
    <header className="flex items-center justify-between border-b pb-6">
      <div>
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
          DYFOLIO
        </p>

        <h1 className="mt-3 text-2xl font-medium tracking-tight">Portfolio</h1>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium">LIVE</span>
        </div>

        <p className="mt-1 text-xs text-neutral-500">Updated just now</p>
      </div>
    </header>
  );
}

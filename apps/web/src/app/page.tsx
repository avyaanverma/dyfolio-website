
import SectorSummary from "@/components/dashboard/SectorSummary";
import HoldingsTable from "@/components/dashboard/HoldingsTable";
import PortfolioHeader from "@/components/dashboard/PortfolioHeader";
import PortfolioStats from "@/components/dashboard/PortfolioStats";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-350 px-6 py-8">
        <PortfolioHeader />
        <PortfolioStats />
        <SectorSummary />
        <HoldingsTable />
      </div>
    </main>
  );
}

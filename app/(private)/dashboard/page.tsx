import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import { SectionCards } from "./_components/section-cards";
import { ActionButtons } from "./_components/action-buttons";
import { getChartData, getTransactions } from "@/app/(data)/finance";
import { getCategories } from "@/app/(data)/categories/get-categories";

export default async function Page() {
  const chartData = await getChartData(90);
  const transactions = await getTransactions();
  const categoriesResult = await getCategories();
  const categories =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : [];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <ActionButtons categories={categories} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={chartData} />
      </div>
      <div className="px-4 lg:px-6">
        <DataTable data={transactions} />
      </div>
    </div>
  );
}

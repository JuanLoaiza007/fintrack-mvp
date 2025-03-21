import { Skeleton } from "@/components/ui/skeleton";
/**
 * @component ReportesDashboard
 * @description Renders a placeholder dashboard for reports, indicating it's under construction with skeleton loaders.
 * @returns {JSX.Element} A div containing a heading and skeleton loaders to represent loading content.
 * @example
 * <ReportesDashboard />
 * @dependencies
 * - Skeleton: A component from "@/components/ui/skeleton" used for placeholder loading indicators.
 */
export default function ReportesDashboard() {
  return (
    <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Reportes (En Construcción)
      </h2>
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/4 mx-auto bg-gray-300 rounded" />
        <Skeleton className="h-10 w-1/2 mx-auto bg-gray-300 rounded" />
        <Skeleton className="h-10 w-3/4 mx-auto bg-gray-300 rounded" />
      </div>
    </div>
  );
}

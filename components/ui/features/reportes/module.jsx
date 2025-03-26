"use client";
import React from "react";
import ReportesExport from "./export";
import ReportesImport from "./import";
import ReportesDashboard from "./dashboard";
/**
 * @component ReportesModule
 * @description Renders a module for managing reports, including dashboard, export, and import functionalities.
 * @returns {JSX.Element} A div containing the report management header and the dashboard, export, and import components.
 * @example
 * <ReportesModule />
 * @dependencies
 * - ReportesDashboard: Component for displaying report dashboards.
 * - ReportesExport: Component for exporting reports.
 * - ReportesImport: Component for importing reports.
 */
export default function ReportesModule() {
  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mt-4">
        Gestión de Reportes
      </h2>
      <div className="p-6 bg-[#bfefac] rounded-lg shadow-md w-full flex flex-col items-center gap-6">
        <ReportesDashboard />
        <ReportesExport />
        <ReportesImport />
      </div>
    </div>
  );
}

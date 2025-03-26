"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
} from "@/components/ui/select";
import { calculateStatistics } from "@/utils/statistics";
import { generateCSV, generatePDF } from "@/utils/export";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/db/db";

/**
 * @component ReportesExport
 * @description Renders a component for exporting reports based on selected time periods.
 * @returns {JSX.Element} A div containing a selection for time period and a button to generate reports.
 * @example
 * <ReportesExport />
 * @dependencies
 * - Select: A component from "@/components/ui/select" for period selection.
 * - SelectTrigger: Subcomponent for triggering the select dropdown.
 * - SelectValue: Subcomponent for displaying selected value.
 * - SelectContent: Subcomponent for containing select items.
 * - SelectItem: Subcomponent for individual select items.
 * - SelectSeparator: Subcomponent for separating select items.
 * - Button: A component from "@/components/ui/button" to trigger report generation.
 * - calculateStatistics: A function from "@/utils/statistics" to calculate statistics.
 * - generateCSV: A function from "@/utils/export" to generate CSV files.
 * - generatePDF: A function from "@/utils/export" to generate PDF files.
 * - getTransactions: A function from "@/db/db" to fetch transaction data.
 * @state {string} period - The selected time period for report generation.
 * @state {Array<Object>} transactions - An array of transaction objects fetched from the database.
 * @remarks
 * This component fetches transactions from the database using getTransactions() inside a useEffect hook.
 * The handleGenerateReports function processes and filters transactions based on the selected period before exporting them as a CSV file.
 * Displays an alert if no transactions are available for export.
 */
export default function ReportesExport() {
  const [period, setPeriod] = useState("todo");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    /**
     * Loads transactions from the database asynchronously and updates the component state.
     *
     * @async
     * @function loadTransactions
     * @returns {Promise<void>} A promise that resolves after the transactions are loaded and the state is updated.
     * @throws {Error} Logs an error to the console if there is a problem loading transactions.
     *
     * @example
     * await loadTransactions();
     */
    async function loadTransactions() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    }
    loadTransactions();
  }, []);

  /**
   * Generates and downloads a CSV file or a PDF file based on the filtered transactions and selected period.
   *
   * This function filters transactions according to the selected period and  can generate a CSV or PDF file.
   *
   * @function handleGenerateReports
   * @param {Array<Object>} transactions - The array of transaction objects to be filtered and exported.
   * @param {string} period - The selected time period for filtering transactions ('todo', 'semana', 'mes', 'año').
   * @returns {void} This function does not return a value.
   * @throws {Error} Throws an alert if there are no transactions to generate a report.
   *
   * @example
   * handleGenerateReports(transactions, 'mes');
   */
  const handleGenerateReports = (format) => {
    if (!transactions || transactions.length === 0) {
      alert("⚠️ No tienes ninguna transacción para generar un reporte");
      return;
    }

    let filteredTransactions = transactions.map((t) => ({
      ...t,
      essential: t.essential !== undefined ? t.essential : false,
    }));

    const actualDate = new Date();

    switch (period) {
      case "todo":
        break;
      case "semana":
        const startOfWeek = new Date(actualDate);
        startOfWeek.setDate(actualDate.getDate() - actualDate.getDay()); // Primer día (domingo)

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Último día (sábado)

        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
        });
        break;
      case "mes":
        filteredTransactions = filteredTransactions.filter(
          (t) => new Date(t.date).getMonth() === actualDate.getMonth(),
        );
        break;
      case "año":
        filteredTransactions = filteredTransactions.filter(
          (t) => new Date(t.date).getFullYear() === actualDate.getFullYear(),
        );
        break;
    }

    const statistics = calculateStatistics(filteredTransactions);

    if (format === "pdf") {
      generatePDF(filteredTransactions, statistics);
    } else if (format === "csv") {
      generateCSV(filteredTransactions);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Generar Reportes (Exportar)
      </h3>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <Select value={period} onValueChange={(value) => setPeriod(value)}>
          <SelectTrigger className="w-full md:w-48 border border-gray-300 rounded px-3 py-2">
            <SelectValue placeholder="Selecciona un periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectSeparator />
            <SelectItem value="semana">Última semana</SelectItem>
            <SelectSeparator />
            <SelectItem value="mes">Último mes</SelectItem>
            <SelectSeparator />
            <SelectItem value="año">Último año</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          onClick={() => handleGenerateReports("csv")}
        >
          Generar Reportes
        </Button>
        <Button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          onClick={() => handleGenerateReports("pdf")}
        >
          Generar Estadisticas
        </Button>
      </div>
    </div>
  );
}

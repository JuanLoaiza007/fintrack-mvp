"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { clearTransactions, importTransactions } from "@/db/db";
import { useTransactionContext } from "@/context/TransactionContext";

/**
 * @component ReportesImport
 * @description Renders a component for importing reports from a CSV file.
 * @returns {JSX.Element} A div containing file selection and import functionality.
 * @example
 * <ReportesImport />
 * @dependencies
 * - Button: A component from "@/components/ui/button" for triggering import.
 * - Papa: A library for parsing CSV files.
 * - clearTransactions: A function from "@/db/db" to clear existing transactions.
 * - importTransactions: A function from "@/db/db" to import new transactions.
 * - useTransactionContext: A custom hook from "@/context/TransactionContext" to access transaction context.
 * @state {File|null} file - The selected CSV file for import.
 * @sideEffects
 * - Uses the useTransactionContext hook to access and trigger transaction updates.
 * - Parses the selected CSV file using Papa.parse and imports transactions into the database.
 * - Clears existing transactions before importing new ones.
 * - Displays alerts for file selection, confirmation, and import status.
 */
export default function ReportesImport() {
  const [file, setFile] = useState(null);
  const { notifyTransactionUpdate } = useTransactionContext();

  /**
   * Handles the file input change event and updates the component state with the selected file.
   *
   * @function handleFileChange
   * @param {Event} event - The change event triggered by the file input.
   * @returns {void} This function does not return a value.
   *
   * @example
   * const inputElement = document.getElementById('file-upload');
   * inputElement.addEventListener('change', handleFileChange);
   */
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  /**
   * Parses and imports transaction data from a CSV file.
   *
   * This function clears existing transactions, updates the context, and resets the file input.
   * It also validates the CSV format before processing the data.
   *
   * @async
   * @function handleImportReports
   * @returns {Promise<void>} A promise that resolves after the transactions are imported, the context is updated, and the file input is reset.
   * @throws {Error} Throws an alert if no file is selected or if the CSV file has an incorrect format.
   *
   * @example
   * handleImportReports()
   *   .then(() => console.log("Report imported successfully"))
   *   .catch((error) => console.error("Error importing report:", error));
   */
  const handleImportReports = () => {
    if (!file) {
      alert("Por favor, seleccione un archivo CSV");
      return;
    }

    const confirmImport = window.confirm(
      "⚠️ Esto borrará todos los registros existentes. ¿Desea continuar?",
    );
    if (!confirmImport) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        let data = results.data;
        const expectedHeaders = [
          "id",
          "description",
          "amount",
          "type",
          "category",
          "essential",
          "date",
        ];
        const actualHeaders = Object.keys(data[0]);

        if (JSON.stringify(expectedHeaders) !== JSON.stringify(actualHeaders)) {
          alert("El archivo CSV no tiene el formato correcto");
          return;
        }

        data = data.map((item) => ({
          ...item,
          id: parseInt(item.id),
          amount: parseFloat(item.amount),
          essential: item.essential.toLowerCase() === "true",
        }));
        await clearTransactions();
        await importTransactions(data);
        notifyTransactionUpdate();
        alert("Reporte importado correctamente");
        setFile(null);
      },
      error: (err) => {
        alert("Error al importar el archivo CSV");
        console.error(err);
      },
    });
  };

  return (
    <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-md flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Importar Reportes (CSV)
      </h3>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-col items-center">
          <label
            htmlFor="file-upload"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Seleccionar archivo CSV:
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Elegir archivo
            </label>
            {file && (
              <span className="text-sm text-gray-600 truncate">
                {file.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Button
            onClick={handleImportReports}
            disabled={!file}
            className={`px-4 py-2 rounded ${
              file
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Importar Reportes
          </Button>
        </div>
      </div>
    </div>
  );
}

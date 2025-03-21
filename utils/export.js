/**
 * Generates and downloads a CSV file from an array of objects.
 *
 * @param {Array<Object>} data - The array of objects to be converted into a CSV file. Each object must have the same keys (required).
 * @returns {void} This function does not return a value; it triggers a file download in the browser.
 * @throws {TypeError} Throws if the input data is not an array or if the array is empty.
 *
 * @example
 * const data = [
 *   { id: 1, description: 'Compras', amount: 100, type: 'income', category: 'gastos', date: '2023-01-01' },
 *   { id: 2, description: 'Gastos', amount: 50, type: 'expense', category: 'gastos', date: '2023-01-01' },
 *   { id: 3, description: 'Ingresos', amount: 50, type: 'income', category: 'ingresos', date: '2023-01-01' },
 * ];
 */
export const generateCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("⚠️ No tienes ninguna transacción para generar un reporte");
    return;
  }
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ("" + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", "registros.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

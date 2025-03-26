import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

/**
 * Generates a financial report in PDF format based on transactions and statistics.
 *
 * @param {Array<Object>} transactions - An array of transaction objects (required).
 * @param {string} transactions[].date - The date of the transaction in ISO format.
 * @param {string} transactions[].category - The category of the transaction.
 * @param {number} transactions[].amount - The amount of the transaction.
 * @param {"income"|"expense"} transactions[].type - The type of transaction, either "income" or "expense".
 * @param {Object} statistics - An object containing financial statistics (required).
 * @param {number} statistics.balance - The total balance.
 * @param {number} statistics.meanIncome - The mean income.
 * @param {number} statistics.meanExpense - The mean expense.
 * @param {number} statistics.medianIncome - The median income.
 * @param {number} statistics.medianExpense - The median expense.
 * @param {number} statistics.standardDeviationExpense - The standard deviation of expenses.
 * @param {number} statistics.incomeExpensePercentage - The percentage of income spent.
 * @param {Object} statistics.expenseDistribution - An object mapping expense categories to their percentage of total expenses.
 *
 * @returns {void} The function does not return a value; it generates and saves a PDF file.
 *
 * @throws {Error} Throws an error if transactions or statistics are missing or improperly formatted.
 *
 * @example
 * const transactions = [
 *   { date: "2025-03-20", category: "Comida", amount: 15000, type: "gasto" },
 *   { date: "2025-03-21", category: "Trabajo", amount: 2000000, type: "ingreso" }
 * ];
 *
 * const statistics = {
 *   balance: 1985000,
 *   meanIncome: 2000000,
 *   meanExpense: 15000,
 *   medianIncome: 2000000,
 *   medianExpense: 15000,
 *   standardDeviationExpense: 0,
 *   incomeExpensePercentage: 0.75,
 *   expenseDistribution: { Comida: 100 }
 * };
 *
 * generatePDF(transactions, statistics);
 */

export const generatePDF = (transactions, statistics) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Informe Financiero", 80, 20);

  doc.setFontSize(12);
  doc.text(`Periodo seleccionado: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Balance: ${statistics.balance.toFixed(2)} COP`, 20, 40);
  doc.text(
    `Media de ingresos: ${statistics.meanIncome.toFixed(2)} COP`,
    20,
    50,
  );
  doc.text(`Media de gastos: ${statistics.meanExpense.toFixed(2)} COP`, 20, 60);
  doc.text(
    `Mediana de ingresos: ${statistics.medianIncome.toFixed(2)} COP`,
    20,
    70,
  );
  doc.text(
    `Mediana de gastos: ${statistics.medianExpense.toFixed(2)} COP`,
    20,
    80,
  );
  doc.text(
    `Desviación estándar de gastos: ${statistics.standardDeviationExpense.toFixed(2)} COP`,
    20,
    90,
  );
  doc.text(
    `Porcentaje de ingresos gastados: ${statistics.incomeExpensePercentage.toFixed(2)}%`,
    20,
    100,
  );

  // Tabla de distribución de gastos
  let startY = 110;
  if (Object.keys(statistics.expenseDistribution).length > 0) {
    doc.text("Distribución de gastos por categoría:", 20, startY);
    startY += 10;
    autoTable(doc, {
      head: [["Categoría", "Porcentaje (%)"]],
      body: Object.entries(statistics.expenseDistribution).map(
        ([category, percentage]) => [category, `${percentage.toFixed(2)}%`],
      ),
      startY,
    });
    startY = doc.lastAutoTable.finalY + 10;
  }

  // Tabla de transacciones
  const transactionsData = transactions.map((t) => [
    new Date(t.date).toLocaleDateString(),
    t.category,
    `${t.amount.toFixed(2)} COP`,
    t.type === "expense" ? "Gasto" : "Ingreso",
  ]);

  autoTable(doc, {
    head: [["Fecha", "Categoría", "Monto (COP)", "Tipo"]],
    body: transactionsData,
    startY,
  });

  doc.save("informe_financiero.pdf");
};

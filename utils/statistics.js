/**
 * Computes statistical insights from a list of financial transactions.
 *
 * @param {Array<{ type: string, amount: number, category?: string }>} transactions -
 * An array of transaction objects. Each object must have a `type` ("ingreso" or "gasto")
 * and an `amount` (required). The `category` is optional and used for expense distribution.
 * @returns {Object|null} An object containing various statistical measures, or `null` if no transactions are provided.
 * @throws {TypeError} If `transactions` is not an array.
 *
 * @example
 * const transactions = [
 *   { type: "ingreso", amount: 1000 },
 *   { type: "ingreso", amount: 1500 },
 *   { type: "gasto", amount: 500, category: "Comida" },
 *   { type: "gasto", amount: 300, category: "Transporte" },
 *   { type: "gasto", amount: 200, category: "Comida" }
 * ];
 *
 * const stats = calculateStatistics(transactions);
 * console.log(stats);
 * // Output:
 * // {
 * //   meanIncome: 1250,
 * //   meanExpense: 333.33,
 * //   medianIncome: 1250,
 * //   medianExpense: 300,
 * //   modeExpense: [500, 300, 200],
 * //   standardDeviationExpense: 127.47,
 * //   incomeExpensePercentage: 66.67,
 * //   expenseDistribution: { Food: 70, Transport: 30 },
 * //   balance: 1500
 * // }
 */

export function calculateStatistics(transactions) {
  if (!transactions.length) return null;

  const incomes = transactions
    .filter((t) => t.type === "income")
    .map((t) => t.amount);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .map((t) => t.amount);

  const calculateMean = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const calculateMedian = (arr) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };
  const calculateMode = (arr) => {
    const frequency = {};
    arr.forEach((num) => (frequency[num] = (frequency[num] || 0) + 1));
    const maxFrequency = Math.max(...Object.values(frequency));
    return Object.keys(frequency).filter(
      (key) => frequency[key] === maxFrequency,
    );
  };
  const calculateStandardDeviation = (arr) => {
    if (!arr.length) return 0;
    const mean = calculateMean(arr);
    const sumDifferences = arr.reduce(
      (acc, num) => acc + Math.pow(num - mean, 2),
      0,
    );
    return Math.sqrt(sumDifferences / arr.length);
  };

  const totalIncome = incomes.reduce((a, b) => a + b, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b, 0);
  const incomeExpensePercentage = totalIncome
    ? (totalExpenses / totalIncome) * 100
    : 0;
  const expenseCategories = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const totalExpense = totalExpenses || 1;
  const expenseDistribution = Object.fromEntries(
    Object.entries(expenseCategories).map(([key, value]) => [
      key,
      (value / totalExpense) * 100,
    ]),
  );

  return {
    meanIncome: calculateMean(incomes),
    meanExpense: calculateMean(expenses),
    medianIncome: calculateMedian(incomes),
    medianExpense: calculateMedian(expenses),
    modeExpense: calculateMode(expenses),
    standardDeviationExpense: calculateStandardDeviation(expenses),
    incomeExpensePercentage,
    expenseDistribution,
    balance: totalIncome - totalExpenses,
  };
}

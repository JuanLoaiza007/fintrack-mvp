import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  CartesianGrid,
  Scatter,
} from "recharts";
import { getTransactions } from "@/db/db";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
} from "@/components/schemas/transaccion";

/**
 * Displays financial reports using different types of charts based on user-selected criteria.
 *
 * @component
 * @param {string} period - The selected time period for filtering transactions. Defaults to "todo". Optional.
 * @param {string} chartType - The type of chart to display financial data. Defaults to "ingresos_gastos". Optional.
 * @param {Array} transactions - The list of transactions to process. Required.
 * @param {function} setTransactions - Function to update the transactions state. Required.
 * @param {Array} filteredData - The processed transaction data used for visualization. Required.
 * @param {function} setFilteredData - Function to update the filtered data state. Required.
 * @param {Array} types - The available transaction types. Required.
 * @param {Array} categories - The available transaction categories. Required.
 *
 * @remarks
 * - Uses `useEffect` to fetch and process transaction data.
 * - Updates state dynamically when period, transactions, or chartType change.
 * - Supports various types of financial data visualization including pie, line, and scatter charts.
 *
 * @returns {JSX.Element} A component rendering financial reports and interactive selection controls.
 *
 * @example
 * <ReportesDashboard />
 */

export default function ReportesDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [period, setPeriod] = useState("todo");
  const [chartType, setChartType] = useState("ingresos_gastos");

  const types = TRANSACTION_TYPES;
  const categories = TRANSACTION_CATEGORIES;

  useEffect(() => {
    async function fetchData() {
      const data = await getTransactions();
      setTransactions(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    filterDataByPeriod(period);
  }, [transactions, period, chartType]);

  const filterDataByPeriod = (selectedPeriod) => {
    const now = new Date();
    let filtered = transactions;

    switch (selectedPeriod) {
      case "semana":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);
        filtered = transactions.filter((t) => new Date(t.date) >= startOfWeek);
        break;
      case "mes":
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        filtered = transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return (
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === currentMonth
          );
        });
        break;
      case "año":
        filtered = transactions.filter(
          (t) => new Date(t.date).getFullYear() === now.getFullYear(),
        );
        break;
    }

    aggregateData(filtered);
  };

  const aggregateData = (data) => {
    switch (chartType) {
      case "ingresos_gastos":
        let ingresos = 0,
          gastos = 0;
        data.forEach(({ amount, type }) => {
          if (type === "income") ingresos += parseFloat(amount);
          else gastos += parseFloat(amount);
        });
        setFilteredData([{ name: "Total", ingresos, gastos }]);
        break;

      case "gastos_categoria":
        const categorias = {};
        data
          .filter((t) => t.type === "expense")
          .forEach(({ category, amount }) => {
            categorias[category] =
              (categorias[category] || 0) + parseFloat(amount);
          });

        setFilteredData(
          Object.keys(categorias).map((cat) => {
            const categoryObj = TRANSACTION_CATEGORIES.find(
              (c) => c.value === cat,
            );
            return {
              name: categoryObj ? categoryObj.label : cat,
              value: categorias[cat],
            };
          }),
        );
        break;

      case "tipos_gastos":
        let totalEsenciales = 0;
        let totalNoEsenciales = 0;

        data.forEach(({ amount, type, essential }) => {
          if (type === "expense") {
            if (essential) totalEsenciales += parseFloat(amount);
            else totalNoEsenciales += parseFloat(amount);
          }
        });

        setFilteredData([
          { name: "Esenciales", value: totalEsenciales },
          { name: "No esenciales", value: totalNoEsenciales },
        ]);
        break;

      case "evolucion":
        const evolucion = {};

        data.forEach(({ date, amount, type }) => {
          const fecha = new Date(date).toISOString().split("T")[0];
          if (!evolucion[fecha]) evolucion[fecha] = { ingresos: 0, gastos: 0 };
          if (type === "income") {
            evolucion[fecha].ingresos += parseFloat(amount);
          } else {
            evolucion[fecha].gastos += parseFloat(amount);
          }
        });

        const sortedData = Object.keys(evolucion)
          .sort((a, b) => new Date(a) - new Date(b))
          .map((fecha) => ({
            name: new Date(fecha).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            ...evolucion[fecha],
          }));

        setFilteredData(sortedData);
        break;

      case "dispersion":
        const dispersion = data
          .filter(({ type }) => type === "expense")
          .map(({ date, amount, description }) => ({
            descripcion: description.replace(
              /\s*\(\d{1,2}\/\d{1,2}\/\d{4}\)\s*/,
              "",
            ),
            fecha: new Date(date).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            gastos: parseFloat(amount),
          }));

        setFilteredData(dispersion);
        break;
    }
  };

  const chartTitles = {
    ingresos_gastos: "Ingresos y Gastos",
    gastos_categoria: "Gastos por Categoría",
    tipos_gastos: "Gastos Esenciales y no Esenciales",
    evolucion: "Evolución de Ingresos y Gastos",
    dispersion: "Dispersión de Gastos",
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF4569",
  ];

  return (
    <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Reportes Financieros
      </h2>
      <div className="flex flex-col items-center space-y-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecciona un periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="semana">Última semana</SelectItem>
            <SelectItem value="mes">Último mes</SelectItem>
            <SelectItem value="año">Último año</SelectItem>
          </SelectContent>
        </Select>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-64" role="combobox" aria-label="grafico">
            <SelectValue placeholder="Selecciona un tipo de gráfico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ingresos_gastos">Ingresos y gastos</SelectItem>
            <SelectItem value="gastos_categoria">
              Gastos por categoría
            </SelectItem>
            <SelectItem value="tipos_gastos">
              Gastos esenciales y no esenciales
            </SelectItem>
            <SelectItem value="evolucion">
              Evolución de ingresos y gastos
            </SelectItem>
            <SelectItem value="dispersion">Dispersión de gastos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <h3 className="text-lg font-medium text-gray-700 text-center mt-6">
        {chartTitles[chartType]}
      </h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "gastos_categoria" ? (
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : chartType === "tipos_gastos" ? (
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : chartType === "evolucion" ? (
            <LineChart data={filteredData}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#4CAF50"
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="gastos"
                stroke="#F44336"
                name="Gastos"
              />
            </LineChart>
          ) : chartType === "dispersion" ? (
            <ScatterChart width={600} height={300} data={filteredData}>
              <CartesianGrid />
              <XAxis name="Fecha" dataKey="fecha" stroke="#8884d8" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { descripcion, fecha, gastos } = payload[0].payload;
                    return (
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: 10,
                          borderRadius: 5,
                          boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          <strong>{descripcion}</strong>
                        </p>{" "}
                        <p style={{ margin: 0 }}>Gasto: {gastos}</p>{" "}
                        <p style={{ margin: 0, color: "#8884d8" }}>
                          {fecha}
                        </p>{" "}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Scatter name="Gastos" dataKey="gastos" fill="#F44336" />
            </ScatterChart>
          ) : (
            <BarChart data={filteredData} barSize={80}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#4CAF50" name="Ingresos" />
              <Bar dataKey="gastos" fill="#F44336" name="Gastos" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

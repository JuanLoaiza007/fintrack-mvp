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
          (t) => new Date(t.date).getFullYear() === now.getFullYear()
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
              (c) => c.value === cat
            );
            return {
              name: categoryObj ? categoryObj.label : cat,
              value: categorias[cat],
            };
          })
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
          const fecha = new Date(date).toLocaleDateString();
          if (!evolucion[fecha]) evolucion[fecha] = { ingresos: 0, gastos: 0 };
          if (type === "income")
            evolucion[fecha].ingresos += parseFloat(amount);
          else evolucion[fecha].gastos += parseFloat(amount);
        });
        setFilteredData(
          Object.keys(evolucion).map((fecha) => ({
            name: fecha,
            ...evolucion[fecha],
          }))
        );
        break;
    }
  };

  const chartTitles = {
    ingresos_gastos: "Ingresos y Gastos",
    gastos_categoria: "Gastos por Categoría",
    tipos_gastos: "Gastos esenciales y no esenciales",
    evolucion: "Evolución de Ingresos y Gastos",
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
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecciona un tipo de gráfico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ingresos_gastos">Ingresos y gastos</SelectItem>
            <SelectItem value="gastos_categoria">Gastos por categoría</SelectItem>
            <SelectItem value="ingresos_tipos_gastos">
              Ingresos y tipos de gastos
            </SelectItem>
            <SelectItem value="evolucion">Evolución de ingresos y gastos</SelectItem>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : chartType === "ingresos_tipos_gastos" ? (
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <Line type="monotone" dataKey="ingresos" stroke="#4CAF50" name="Ingresos" />
              <Line type="monotone" dataKey="gastos" stroke="#F44336" name="Gastos" />
            </LineChart>
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

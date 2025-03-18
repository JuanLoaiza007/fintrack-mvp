import { ArrowUp, ArrowDown, XCircle } from "lucide-react";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
} from "@/components/schemas/transaccion";

const transactionTypes = [
  { value: "all", label: "Todas" },
  ...TRANSACTION_TYPES,
];
const categories = [
  { value: "all", label: "Todas" },
  ...TRANSACTION_CATEGORIES,
];

export default function TransactionFilters({
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
}) {
  // Función para restablecer todos los filtros
  const resetFilters = () => {
    setDateFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
    setSortField("date");
    setSortOrder("dsc");
  };

  return (
    <div className="p-4 border-b flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4 text-sm">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Filtro por periodo */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Periodo:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border-2 rounded-lg px-2 py-1"
          >
            <option value="all">Todas</option>
            <option value="day">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>

        {/* Filtro por tipo */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Tipo:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border-2 rounded-lg px-2 py-1"
          >
            {transactionTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por categoría */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Categoría:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border-2 rounded-lg px-2 py-1"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenación */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Ordenar por:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-white border-2 rounded-lg px-2 py-1"
          >
            <option value="date">Fecha</option>
            <option value="description">Nombre</option>
            <option value="amount">Cantidad</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-gray-300 p-2 rounded-full hover:bg-gray-400 transition"
          >
            {sortOrder === "asc" ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Botón para restablecer filtros */}
      <button
        onClick={resetFilters}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
      >
        <XCircle size={16} />
        Restablecer filtros
      </button>
    </div>
  );
}

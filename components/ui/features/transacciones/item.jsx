import { Calendar, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
} from "@/components/schemas/transaccion";

/**
 * Formats the amount into Colombian Pesos (COP) with proper thousand separators.
 *
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Gets the display label for a given transaction type.
 *
 * @param {string} type - The transaction type value (e.g., "income" or "expense").
 * @returns {string} The corresponding label (e.g., "Ingresos" or "Gastos").
 */
const getTypeLabel = (type) => {
  return (
    TRANSACTION_TYPES.find((t) => t.value === type)?.label || "Desconocido"
  );
};

/**
 * Gets the display label for a given transaction category.
 *
 * @param {string} category - The transaction category value.
 * @returns {string} The corresponding label (e.g., "Comida y Bebida").
 */
const getCategoryLabel = (category) => {
  return (
    TRANSACTION_CATEGORIES.find((c) => c.value === category)?.label || "Otros"
  );
};

/**
 * Determines the border color of the transaction item based on its type and importance.
 *
 * @param {Object} transaction - The transaction object.
 * @returns {string} The CSS class for the border color.
 */
const getBorderColor = (transaction) => {
  if (transaction.type === "income") return "border-green-500";
  return transaction.essential ? "border-yellow-500" : "border-red-500";
};

/**
 * TransactionItem Component
 *
 * @description
 * Displays a single transaction with formatted details, including the amount in COP,
 * translated labels for type and category, and action buttons for editing or deleting.
 *
 * @component
 * @param {Object} props - The component properties.
 * @param {Object} props.transaction - The transaction object.
 * @param {Function} props.handleEdit - Function to handle editing the transaction.
 * @param {Function} props.handleDelete - Function to handle deleting the transaction.
 * @returns {JSX.Element} The rendered transaction item.
 */
export default function TransactionItem({
  transaction,
  handleEdit,
  handleDelete,
}) {
  return (
    <li
      className={`flex justify-between items-center p-4 bg-white rounded-lg shadow border-l-4 ${getBorderColor(
        transaction,
      )}`}
    >
      <div className="flex flex-col">
        <p className="font-semibold text-base sm:text-lg">
          {transaction.description} -{" "}
          <span className="font-bold">
            {formatCurrency(transaction.amount)}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          {getTypeLabel(transaction.type)} •{" "}
          {getCategoryLabel(transaction.category)}
        </p>
        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
          <Calendar size={14} />
          <span>{format(new Date(transaction.date), "dd/MM/yyyy")}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handleEdit(transaction.id)}
          className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 transition flex items-center gap-1"
        >
          <Edit size={16} /> Editar
        </button>
        <button
          onClick={() => handleDelete(transaction.id)}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition flex items-center gap-1"
        >
          <Trash2 size={16} /> Eliminar
        </button>
      </div>
    </li>
  );
}

import { useEffect, useState, useMemo } from "react";
import { deleteTransaction, getTransactions } from "@/db/db";
import TransactionFilters from "./filters";
import TransactionList from "./list";
import { useTransactionContext } from "@/context/TransactionContext";

export default function TransactionHistory() {
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [transactions, setTransactions] = useState([]);
  const { transactionUpdated, notifyTransactionUpdate } = useTransactionContext();

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error al obtener transacciones:", error);
      }
    }
    fetchTransactions();
  }, [transactionUpdated]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);

      // Filtro por fecha
      if (
        dateFilter === "day" &&
        transactionDate.toDateString() !== now.toDateString()
      ) {
        return false;
      }
      if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (transactionDate < weekAgo) return false;
      }
      if (dateFilter === "month") {
        if (
          transactionDate.getMonth() !== now.getMonth() ||
          transactionDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      }

      // Filtro por tipo (income/expense)
      if (typeFilter !== "all" && t.type !== typeFilter) {
        return false;
      }

      // Filtro por categoría
      if (categoryFilter !== "all" && t.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, dateFilter, typeFilter, categoryFilter]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === "description") {
        return sortOrder === "asc"
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      }
      if (sortField === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortField === "date") {
        return sortOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return 0;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  return (
    <div className="flex flex-col w-full h-full bg-sidebar-accent rounded-lg shadow-lg">
      {/* Header: Contiene los filtros */}
      <header className="border-b">
        <TransactionFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </header>

      {/* Main: Lista de transacciones */}
      <main className="flex-1 min-h-0 max-h-[68vh] p-2 sm:p-4">
        <TransactionList
          handleEdit={() => {
            window.alert("Not implemented yet.");
          }}
          handleDelete={(id) => {
            deleteTransaction(id)
              .then(() => {
                window.alert("Transacción eliminada con éxito");
              })
              .catch((error) => {
                window.alert(error.message);
              });
            notifyTransactionUpdate();
          }}
          transactions={sortedTransactions}
        />
      </main>
    </div>
  );
}

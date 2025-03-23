"use client";
import { useEffect, useState, useMemo } from "react";
import { deleteTransaction, getTransactions } from "@/db/db";
import TransactionFilters from "./filters";
import TransactionList from "./list";
import { useTransactionContext } from "@/context/TransactionContext";

/**
 * Renders the TransactionHistory component which fetches, filters, sorts, and displays a list of transactions.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onEdit - A required callback function invoked with a transaction object when an edit is requested.
 * @returns {JSX.Element} The rendered TransactionHistory component.
 *
 * @example
 * <TransactionHistory onEdit={(transaction) => console.log(transaction)} />
 */
export default function TransactionHistory({ onEdit }) {
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [transactions, setTransactions] = useState([]);
  const { transactionUpdated, notifyTransactionUpdate, setIaTransactions } =
    useTransactionContext();

  useEffect(() => {
    /**
     * Asynchronously fetches transactions from the database and updates the state.
     *
     * @async
     * @function fetchTransactions
     * @returns {Promise<void>} A promise that resolves when the transactions have been successfully fetched.
     *
     * @example
     * fetchTransactions().catch(error => console.error(error));
     */
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
      // Filter by date
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
      // Filter by type
      if (typeFilter !== "all" && t.type !== typeFilter) {
        return false;
      }
      // Filter by category
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

  /**
   * Computes the transactions sorted by date from oldest to newest for IA analysis.
   *
   * @returns {Array} Array of transactions sorted in ascending order by date.
   *
   * @example
   * // Returns transactions sorted from oldest to newest
   * const iaData = iaSortedTransactions;
   */
  const iaSortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [filteredTransactions]);

  /**
   * Updates the IA transaction state with transactions sorted from oldest to newest.
   *
   * @function
   * @returns {void}
   *
   * @example
   * // Automatically update IA state when sorted transactions change
   * useEffect(() => { if (typeof setIaTransactions === "function") setIaTransactions(iaSortedTransactions); }, [iaSortedTransactions]);
   */
  useEffect(() => {
    if (typeof setIaTransactions === "function") {
      setIaTransactions(iaSortedTransactions);
    }
  }, [iaSortedTransactions, setIaTransactions]);

  /**
   * Handles the edit action for a transaction.
   *
   * @function handleEdit
   * @param {number} id - The unique identifier of the transaction to be edited.
   * @returns {void}
   *
   * @example
   * // To edit a transaction with id 123:
   * handleEdit(123);
   */
  const handleEdit = (id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      onEdit(transaction);
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full bg-sidebar-accent rounded-lg shadow-lg"
      aria-label="Transaction History"
    >
      {/* Header: Contains filters */}
      <header className="border-b" aria-label="Transaction Filters">
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

      {/* Main: Transaction list */}
      <main
        className="flex-1 min-h-0 max-h-[68vh] p-2 sm:p-4"
        aria-label="Transaction List"
      >
        <TransactionList
          handleEdit={handleEdit}
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

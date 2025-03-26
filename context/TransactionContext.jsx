"use client";
import { createContext, useContext, useState, useCallback } from "react";

/**
 * Context to handle transaction updates and store a copy of transactions for IA analysis.
 */
const TransactionContext = createContext();

/**
 * TransactionProvider Component
 *
 * @description Provides a context for managing transaction updates in the UI and storing a copy of transactions for IA analysis.
 * @component
 * @param {Object} props — Component props.
 * @param {React.ReactNode} props.children — The child components that will have access to the context.
 * @returns {JSX.Element} The context provider component.
 *
 * @example
 * <TransactionProvider>
 *   <App />
 * </TransactionProvider>
 */
export function TransactionProvider({ children }) {
  const [transactionUpdated, setTransactionUpdated] = useState(false);
  const [iaTransactions, setIaTransactions] = useState([]);

  /**
   * Notifies that transactions have been updated.
   *
   * @function
   * @returns {void} This function toggles the transactionUpdated state.
   *
   * @example
   * notifyTransactionUpdate();
   */
  const notifyTransactionUpdate = useCallback(() => {
    setTransactionUpdated((prev) => !prev);
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactionUpdated,
        notifyTransactionUpdate,
        iaTransactions,
        setIaTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

/**
 * useTransactionContext Hook
 *
 * @description Provides access to the transaction context.
 * @returns {{
 *   transactionUpdated: boolean,
 *   notifyTransactionUpdate: function,
 *   iaTransactions: Array,
 *   setIaTransactions: function
 * }} The transaction context values.
 *
 * @throws {Error} If used outside of a TransactionProvider.
 *
 * @example
 * const { transactionUpdated, notifyTransactionUpdate, iaTransactions, setIaTransactions } = useTransactionContext();
 */
export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider",
    );
  }
  return context;
}

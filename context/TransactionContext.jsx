"use client";
import { createContext, useContext, useState, useCallback } from "react";

/**
 * Context to handle transaction updates without affecting the CRUD logic.
 */
const TransactionContext = createContext();

/**
 * TransactionProvider Component
 *
 * @description
 * Provides a context for managing transaction updates in the UI.
 * This ensures that components are aware of transaction changes without
 * directly handling database operations.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 *
 * @returns {JSX.Element} The context provider component.
 *
 * @example
 * <TransactionProvider>
 *   <App />
 * </TransactionProvider>
 */
export function TransactionProvider({ children }) {
  const [transactionUpdated, setTransactionUpdated] = useState(false);

  /**
   * Notifies that transactions have been updated.
   *
   * @function
   * @returns {void}
   *
   * @example
   * notifyTransactionUpdate();
   */
  const notifyTransactionUpdate = useCallback(() => {
    setTransactionUpdated((prev) => !prev);
  }, []);

  return (
    <TransactionContext.Provider
      value={{ transactionUpdated, notifyTransactionUpdate }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

/**
 * useTransactionContext Hook
 *
 * @description
 * Provides access to the transaction context.
 *
 * @returns {{ transactionUpdated: boolean, notifyTransactionUpdate: function }} The transaction context values.
 *
 * @throws {Error} If used outside of a TransactionProvider.
 *
 * @example
 * const { transactionUpdated, notifyTransactionUpdate } = useTransactionContext();
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

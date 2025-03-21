import TransactionModule from "@/components/ui/features/transacciones/module";

/**
 * Renders the TransactionPage component, which serves as the main entry point for the transaction module.
 *
 * @component
 * @remarks This component uses the TransactionModule component to display transaction-related features.
 * It does not accept any props and has no side effects or hooks.
 *
 * @returns {JSX.Element} The rendered TransactionModule component.
 *
 * @example
 * // Example usage:
 * import TransactionPage from './path/to/TransactionPage';
 *
 * function App() {
 *   return <TransactionPage />;
 * }
 */
export default function TransactionPage() {
  return <TransactionModule />;
}

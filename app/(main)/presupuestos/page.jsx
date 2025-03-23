import BudgetModule from "@/components/ui/features/presupuestos/module";

/**
 * BudgetPage component.
 *
 * This component serves as the main page for managing user budgets.
 *
 * @component
 * @remarks This component does not accept any props and directly renders the `BudgetModule` component.
 * It is intended to be used as a standalone page in the application.
 *
 * @returns {JSX.Element} The rendered `BudgetModule` component.
 *
 * @example
 * // Example usage:
 * import BudgetPage from './BudgetPage';
 *
 * function App() {
 *   return <BudgetPage />;
 * }
 */
export default function BugdetPage() {
  return <BudgetModule />;
}

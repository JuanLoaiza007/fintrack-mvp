import GoalModule from "@/components/ui/features/metas/module";

/**
 * GoalPage component.
 *
 * This component serves as the main page for managing user goals.
 *
 * @component
 * @remarks This component does not accept any props and directly renders the `GoalModule` component.
 * It is intended to be used as a standalone page in the application.
 *
 * @returns {JSX.Element} The rendered `GoalModule` component.
 *
 * @example
 * // Example usage:
 * import GoalPage from './GoalPage';
 *
 * function App() {
 *   return <GoalPage />;
 * }
 */
export default function GoalPage() {
  return <GoalModule />;
}

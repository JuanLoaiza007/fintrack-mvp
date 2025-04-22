import ConfigModule from "@/components/ui/features/configuracion/module";

/**
 * Configuration page component.
 *
 * This component serves as the main entry point for the configuration module.
 * It renders the `configModule` component.
 *
 * @component
 * @remarks This component does not accept any props and directly renders the `configModule` component.
 * It is intended to be used as a standalone page in the application.
 *
 * @returns {JSX.Element} The rendered `configModule` component.
 *
 * @example
 * // Example usage:
 * import ConfigPage from './ConfigPage';
 *
 * function App() {
 *   return <ConfigPage />;
 * }
 */
export default function configPage() {
  return <ConfigModule />;
}

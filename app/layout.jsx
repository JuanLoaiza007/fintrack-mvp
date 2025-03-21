import "./globals.css";
import { TransactionProvider } from "@/context/TransactionContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "FinTrack",
  description: "Financial control and analysis application",
};

/**
 * RootLayout component that provides the main layout structure for the application.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components to render inside the layout. Required.
 * @remarks This component wraps the application with the TransactionProvider context and includes the Toaster for notifications.
 * @returns {JSX.Element} The rendered layout structure including the children components.
 * @example
 * <RootLayout>
 *   <div>Welcome to FinTrack</div>
 * </RootLayout>
 */
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <TransactionProvider>
        <body className="flex w-full h-full">
          <Toaster />
          {children}
        </body>
      </TransactionProvider>
    </html>
  );
}

import "./globals.css";
import { TransactionProvider } from "@/context/TransactionContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "FinTrack",
  description: "Financial control and analysis application",
};

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

import "./globals.css";
import { TransactionProvider } from "@/context/TransactionContext";

export const metadata = {
  title: "FinTrack",
  description: "Financial control and analysis application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <TransactionProvider>
        <body className="flex w-full h-full">{children}</body>
      </TransactionProvider>
    </html>
  );
}

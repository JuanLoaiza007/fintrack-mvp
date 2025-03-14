import "./globals.css";

export const metadata = {
  title: "FinTrack",
  description: "Financial control and analysis application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex w-full h-full">{children}</body>
    </html>
  );
}

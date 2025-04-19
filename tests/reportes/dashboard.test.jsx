import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReportesDashboard from "@/components/ui/features/reportes/dashboard";
import { getTransactions } from "@/db/db";

jest.mock("@/db/db", () => ({
  getTransactions: jest.fn().mockResolvedValue([
    {
      amount: "100",
      type: "income",
      date: new Date().toISOString(),
      category: "salario",
      essential: true,
      description: "Salario mensual",
    },
  ]),
}));

describe("ReportesDashboard", () => {
  it("renderiza correctamente el título", async () => {
    render(<ReportesDashboard />);
    expect(await screen.findByText("Reportes Financieros")).toBeInTheDocument();
  });

  it("cambia el periodo a 'mes' y actualiza el gráfico", async () => {
    render(<ReportesDashboard />);

    fireEvent.click(screen.getByText("Todo"));

    fireEvent.click(screen.getByText("Último mes"));

    expect(await screen.findByText("Último mes")).toBeInTheDocument();
  });

  it("cambia el periodo a 'año' y actualiza el gráfico", async () => {
    render(<ReportesDashboard />);

    fireEvent.click(screen.getByText("Todo"));
    fireEvent.click(screen.getByText("Último año"));

    expect(await screen.findByText("Último año")).toBeInTheDocument();
  });

  it("muestra un gráfico de barras por defecto", async () => {
    render(<ReportesDashboard />);

    fireEvent.click(screen.getByRole("combobox", { name: "grafico" }));
    fireEvent.click(screen.getByText("Gastos por categoría"));

    fireEvent.click(screen.getByRole("combobox", { name: "grafico" }));
    fireEvent.click(screen.getByText("Ingresos y gastos"));

    expect(await screen.findByText("Ingresos y Gastos")).toBeInTheDocument();
  });

  it("muestra un gráfico de gastos por categoria", async () => {
    render(<ReportesDashboard />);

    fireEvent.click(screen.getByRole("combobox", { name: "grafico" }));
    fireEvent.click(screen.getByText("Gastos por categoría"));

    expect(await screen.findByText("Gastos por categoría")).toBeInTheDocument();
  });

  it("muestra un gráfico de Gastos esenciales y no esenciales", async () => {
    render(<ReportesDashboard />);

    fireEvent.click(screen.getByRole("combobox", { name: "grafico" }));
    fireEvent.click(screen.getByText("Gastos esenciales y no esenciales"));

    expect(
      await screen.findByText("Gastos Esenciales y no Esenciales"),
    ).toBeInTheDocument();
  });

  it("muestra un gráfico de Evolución de ingresos y gastos", async () => {
    render(<ReportesDashboard />);

    fireEvent.click(screen.getByRole("combobox", { name: "grafico" }));
    fireEvent.click(screen.getByText("Evolución de ingresos y gastos"));

    expect(
      await screen.findByText("Evolución de Ingresos y Gastos"),
    ).toBeInTheDocument();
  });

  it("muestra un gráfico de Dispersión de gastos", async () => {
    render(<ReportesDashboard />);

    fireEvent.click(screen.getByRole("combobox", { name: "grafico" }));
    fireEvent.click(screen.getByText("Dispersión de gastos"));

    expect(await screen.findByText("Dispersión de Gastos")).toBeInTheDocument();
  });

  it("llama a getTransactions al montar", async () => {
    const { getTransactions } = require("@/db/db");
    render(<ReportesDashboard />);
    await waitFor(() => {
      expect(getTransactions).toHaveBeenCalledTimes(1);
    });
  });
});

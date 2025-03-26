import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import ReportesModule from "@/components/ui/features/reportes/module";
import {
  getTransactions,
  clearTransactions,
  importTransactions,
} from "@/db/db";
import { generateCSV, generatePDF } from "@/utils/export";
import { TransactionProvider } from "@/context/TransactionContext";
import Papa from "papaparse";

jest.mock("@/db/db");
jest.mock("@/utils/export", () => ({
  generateCSV: jest.fn(),
  generatePDF: jest.fn(),
}));
jest.mock("papaparse");

// Mock window.alert
global.alert = jest.fn();

describe("ReportesModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "confirm").mockImplementation(() => true); // Simula que el usuario acepta
  });

  it("renders all sections and elements", async () => {
    getTransactions.mockResolvedValue([]);
    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });

    await waitFor(() => expect(getTransactions).toHaveBeenCalled());

    expect(screen.getByText("Reportes Financieros")).toBeInTheDocument();
    expect(screen.getByText("Generar Reportes (Exportar)")).toBeInTheDocument();
    expect(screen.getByText("Importar Reportes (CSV)")).toBeInTheDocument();
    expect(screen.getByText("Generar Reportes")).toBeInTheDocument();
    expect(screen.getByText("Elegir archivo")).toBeInTheDocument();
    expect(screen.getByText("Importar Reportes")).toBeInTheDocument();
    expect(screen.getByText("Generar Estadisticas")).toBeInTheDocument();
  });

  it("generates reports correctly", async () => {
    getTransactions.mockResolvedValue([
      { id: 1, date: new Date().toISOString(), essential: true },
    ]);
    generateCSV.mockImplementation(() => {});
    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });

    fireEvent.click(screen.getByText("Generar Reportes"));

    await waitFor(() => expect(generateCSV).toHaveBeenCalled());
  });

  it("generates PDF reports correctly", async () => {
    getTransactions.mockResolvedValue([
      { id: 1, date: new Date().toISOString(), essential: true },
    ]);
    generatePDF.mockImplementation(() => {});
    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });

    fireEvent.click(screen.getByText("Generar Estadisticas"));

    await waitFor(() => expect(generatePDF).toHaveBeenCalled());
  });

  it("imports reports correctly", async () => {
    getTransactions.mockResolvedValue([]);
    clearTransactions.mockResolvedValue();
    importTransactions.mockResolvedValue();
    Papa.parse.mockImplementation((file, config) => {
      setTimeout(() => {
        config.complete({
          data: [{ id: 1, essential: "true", date: new Date().toISOString() }],
        });
      }, 0);
    });

    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });

    const file = new File(
      ["id,essential,date\n1,true,2024-01-01"],
      "test.csv",
      { type: "text/csv" },
    );
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Seleccionar archivo CSV:"), {
        target: { files: [file] },
      });
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Importar Reportes" }),
      );
    });
  });

  it("imports reports with incorrect format", async () => {
    getTransactions.mockResolvedValue([]);
    clearTransactions.mockResolvedValue();
    importTransactions.mockResolvedValue();
    Papa.parse.mockImplementation((file, config) => {
      config.complete({
        data: [{ wrongHeader: "value" }], // Incorrect header
      });
    });

    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });

    const file = new File(["wrongHeader\nvalue"], "wrong.csv", {
      type: "text/csv",
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Seleccionar archivo CSV:"), {
        target: { files: [file] },
      });
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Importar Reportes" }),
      );
    });

    expect(global.alert).toHaveBeenCalledWith(
      "El archivo CSV no tiene el formato correcto",
    ); // ✅ Mensaje corregido
  });

  it("disables import button when no file is selected", () => {
    render(
      <TransactionProvider>
        <ReportesModule />
      </TransactionProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Importar Reportes" }),
    ).toBeDisabled();
  });

  it("enables import button when a file is selected", () => {
    render(
      <TransactionProvider>
        <ReportesModule />
      </TransactionProvider>,
    );
    const file = new File(
      ["id,essential,date\n1,true,2024-01-01"],
      "test.csv",
      { type: "text/csv" },
    );
    fireEvent.change(screen.getByLabelText("Seleccionar archivo CSV:"), {
      target: { files: [file] },
    });
    expect(
      screen.getByRole("button", { name: "Importar Reportes" }),
    ).toBeEnabled();
  });

  it("filters transactions by week", async () => {
    getTransactions.mockResolvedValue([
      { id: 1, date: new Date().toISOString(), essential: true },
    ]);
    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });
    fireEvent.click(screen.getByText("Generar Reportes"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], {
      target: { value: "semana" },
    });
    expect(selects[0]).toHaveValue("semana");
  });

  it("filters transactions by month", async () => {
    getTransactions.mockResolvedValue([
      { id: 1, date: new Date().toISOString(), essential: true },
    ]);
    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });
    fireEvent.click(screen.getByText("Generar Reportes"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], {
      target: { value: "mes" },
    });
    expect(selects[0]).toHaveValue("mes");
  });

  it("filters transactions by year", async () => {
    getTransactions.mockResolvedValue([
      { id: 1, date: new Date().toISOString(), essential: true },
    ]);
    await act(async () => {
      render(
        <TransactionProvider>
          <ReportesModule />
        </TransactionProvider>,
      );
    });
    fireEvent.click(screen.getByText("Generar Reportes"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], {
      target: { value: "año" },
    });
    expect(selects[0]).toHaveValue("año");
  });
});

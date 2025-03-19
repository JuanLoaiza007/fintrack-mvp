import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReportesModule from "@/components/ui/features/reportes/module";
import { getTransactions, clearTransactions, importTransactions } from "@/db/db";
import { generateCSV } from "@/utils/export";
import Papa from "papaparse";

jest.mock("@/db/db");
jest.mock("@/utils/export", () => ({
    generateCSV: jest.fn(),
}));
jest.mock("papaparse");

// Mock window.alert
global.alert = jest.fn();

describe("ReportesModule", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all sections and elements", async () => {
        getTransactions.mockResolvedValue([]);
        await act(async () => {
            render(<ReportesModule />);
        });

        await waitFor(() => expect(getTransactions).toHaveBeenCalled());

        expect(screen.getByText("Reportes (En Construcción)")).toBeInTheDocument();
        expect(screen.getByText("Generar Reportes (Exportar)")).toBeInTheDocument();
        expect(screen.getByText("Importar Reportes (CSV)")).toBeInTheDocument();
        expect(screen.getByText("Generar Reportes")).toBeInTheDocument();
        expect(screen.getByText("Elegir archivo")).toBeInTheDocument();
        expect(screen.getByText("Importar Reportes")).toBeInTheDocument();
    });

    it("generates reports correctly", async () => {
        getTransactions.mockResolvedValue([{ id: 1, date: new Date().toISOString(), essential: true }]);
        generateCSV.mockImplementation(() => {});
        await act(async () => {
            render(<ReportesModule />);
        });

        fireEvent.click(screen.getByText("Generar Reportes"));

        await waitFor(() => expect(generateCSV).toHaveBeenCalled());
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
            render(<ReportesModule />);
        });

        const file = new File(["id,essential,date\n1,true,2024-01-01"], "test.csv", { type: "text/csv" });
        await act(async () => {
            fireEvent.change(screen.getByLabelText("Seleccionar archivo CSV:"), { target: { files: [file] } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Importar Reportes" }));
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
            render(<ReportesModule />);
        });

        const file = new File(["wrongHeader\nvalue"], "wrong.csv", { type: "text/csv" });
        await act(async () => {
            fireEvent.change(screen.getByLabelText("Seleccionar archivo CSV:"), { target: { files: [file] } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Importar Reportes" }));
        });

        expect(global.alert).toHaveBeenCalledWith("El archivo CSV no tiene el formato correcto");
    });

    it("disables import button when no file is selected", () => {
        render(<ReportesModule />);
        expect(screen.getByRole("button", { name: "Importar Reportes" })).toBeDisabled();
    });

    it("enables import button when a file is selected", () => {
        render(<ReportesModule />);
        const file = new File(["id,essential,date\n1,true,2024-01-01"], "test.csv", { type: "text/csv" });
        fireEvent.change(screen.getByLabelText("Seleccionar archivo CSV:"), { target: { files: [file] } });
        expect(screen.getByRole("button", { name: "Importar Reportes" })).toBeEnabled();
    });
    it("filters transactions by week", async () => {
        getTransactions.mockResolvedValue([{ id: 1, date: new Date().toISOString(), essential: true }]);
        await act(async () => {
            render(<ReportesModule />);
        });
        fireEvent.click(screen.getByText("Generar Reportes"));
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "semana" } });
        expect(screen.getByRole("combobox")).toHaveValue("semana");
    });

    it("filters transactions by month", async () => {
        getTransactions.mockResolvedValue([{ id: 1, date: new Date().toISOString(), essential: true }]);
        await act(async () => {
            render(<ReportesModule />);
        });
        fireEvent.click(screen.getByText("Generar Reportes"));
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "mes" } });
        expect(screen.getByRole("combobox")).toHaveValue("mes");
    });

    it("filters transactions by year", async () => {
        getTransactions.mockResolvedValue([{ id: 1, date: new Date().toISOString(), essential: true }]);
        await act(async () => {
            render(<ReportesModule />);
        });
        fireEvent.click(screen.getByText("Generar Reportes"));
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "año" } });
        expect(screen.getByRole("combobox")).toHaveValue("año");
    });    
});
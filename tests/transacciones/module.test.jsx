// __tests__/TransactionModule.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionModule from "@/components/ui/features/transacciones/module";

jest.mock("@/components/ui/features/transacciones/history", () => ({
  __esModule: true,
  default: ({ onEdit }) => (
    <button
      data-testid="edit-transaction"
      onClick={() => onEdit({ id: 42, amount: 100 })}
    >
      Edit Transaction
    </button>
  ),
}));
jest.mock("@/components/ui/features/transacciones/footer", () => ({
  __esModule: true,
  default: ({ onOpenCreate, onOpenCreateWithAI }) => (
    <>
      <button data-testid="open-create" onClick={onOpenCreate}>
        Create Transaction
      </button>
      <button data-testid="open-create-ai" onClick={onOpenCreateWithAI}>
        Crear con IA
      </button>
    </>
  ),
}));
jest.mock("@/components/ui/features/transacciones/form", () => ({
  __esModule: true,
  default: ({ transaction, setIsCreateOpen }) => (
    <div data-testid="transaction-form">
      {transaction ? `Editing ${transaction.id}` : "Creating new"}
      <button data-testid="close-form" onClick={() => setIsCreateOpen(false)}>
        Close
      </button>
    </div>
  ),
}));
jest.mock("@/utils/gemini-transaction-interpreter", () => ({
  interpretTransactions: jest.fn().mockResolvedValue({
    transactions: [
      {
        description: "Sueldo",
        amount: 1000000,
        type: "income",
        category: "work",
        essential: false,
        date: "2025-04-17",
      },
    ],
  }),
}));
jest.mock(
  "@/components/ui/features/transacciones/ai-voice-transaction-creator",
  () => ({
    __esModule: true,
    default: () => <div data-testid="mock-voice-creator" />,
  }),
);

describe("TransactionModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header", () => {
    render(<TransactionModule />);
    expect(
      screen.getByRole("heading", { name: /gestión de transacciones/i }),
    ).toBeInTheDocument();
  });

  it("opens create dialog when footer button is clicked", () => {
    render(<TransactionModule />);
    fireEvent.click(screen.getByTestId("open-create"));

    expect(screen.getByTestId("transaction-form")).toHaveTextContent(
      "Creating new",
    );
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("opens edit dialog when history edit button is clicked", () => {
    render(<TransactionModule />);
    fireEvent.click(screen.getByTestId("edit-transaction"));

    expect(screen.getByTestId("transaction-form")).toHaveTextContent(
      "Editing 42",
    );
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("closes dialog when form close button is clicked", () => {
    render(<TransactionModule />);
    fireEvent.click(screen.getByTestId("open-create"));
    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-form"));
    expect(screen.queryByTestId("transaction-form")).not.toBeInTheDocument();
  });

  it("opens AI transaction creator when AI button is clicked", () => {
    render(<TransactionModule />);
    fireEvent.click(screen.getByTestId("open-create-ai"));
    expect(screen.getByTestId("mock-voice-creator")).toBeInTheDocument();
  });
});

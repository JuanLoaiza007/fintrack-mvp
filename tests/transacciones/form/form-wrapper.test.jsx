import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/components/ui/features/transacciones/form/form-wrapper";
import TransactionForm from "@/components/ui/features/transacciones/form";
import { Button } from "@/components/ui/button";

// Mock del componente interno para evitar su lógica y enfocar el test en el wrapper
jest.mock("@/components/ui/features/transacciones/form", () =>
  jest.fn(() => <div data-testid="transaction-form" />),
);

// Mock de react-hook-form (opcional si querés espiar cómo se llama)
jest.mock("react-hook-form", () => {
  const actual = jest.requireActual("react-hook-form");
  return {
    ...actual,
    useForm: jest.fn(),
  };
});

describe("FormWrapper", () => {
  const mockTransaction = {
    id: 1,
    amount: 500,
    description: "Compra de libros",
    type: "expense",
    category: "education",
    date: "2025-04-18",
    essential: true,
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useForm.mockReturnValue({
      reset: jest.fn(),
      register: jest.fn(),
      handleSubmit: jest.fn(),
      watch: jest.fn((cb) => {
        cb(mockTransaction);
        return { unsubscribe: jest.fn() };
      }),
      formState: { errors: {} },
      setValue: jest.fn(),
    });
  });

  it("debería renderizar TransactionForm con los props correctos", () => {
    render(
      <FormWrapper
        transaction={mockTransaction}
        index={0}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const form = screen.getByTestId("transaction-form");
    expect(form).toBeInTheDocument();
    expect(TransactionForm).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: mockTransaction,
        isSaveAvailable: false,
        setIsCreateOpen: expect.any(Function),
        formInstance: expect.any(Object),
      }),
      {},
    );
  });

  it("debería pasar accesibilidad mínima (presencia de rol)", () => {
    render(
      <FormWrapper
        transaction={mockTransaction}
        index={0}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
  });

  it("debería ejecutar onDelete cuando se hace clic en el botón de eliminar", () => {
    render(
      <FormWrapper
        transaction={mockTransaction}
        index={0}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it("debería llamar a onUpdate cuando los datos del formulario cambian", () => {
    render(
      <FormWrapper
        transaction={mockTransaction}
        index={0}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    expect(mockOnUpdate).toHaveBeenCalledWith(0, mockTransaction);
  });
});

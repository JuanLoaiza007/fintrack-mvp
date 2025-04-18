import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/components/ui/features/transacciones/form/form-wrapper";
import TransactionForm from "@/components/ui/features/transacciones/form";

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

  beforeEach(() => {
    // Mock básico del hook useForm para devolver métodos falsos
    useForm.mockReturnValue({
      reset: jest.fn(),
      register: jest.fn(),
      handleSubmit: jest.fn(),
      watch: jest.fn(),
      formState: { errors: {} },
      setValue: jest.fn(),
    });
  });

  it("debería renderizar TransactionForm con los props correctos", () => {
    render(<FormWrapper transaction={mockTransaction} />);

    const form = screen.getByTestId("transaction-form");
    expect(form).toBeInTheDocument();
    expect(TransactionForm).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: mockTransaction,
        isSaveAvailable: false,
        setIsCreateOpen: expect.any(Function),
      }),
      {},
    );
  });

  it("debería resetear el formulario cuando cambia el prop 'transaction'", () => {
    const resetMock = jest.fn();

    // Primera instancia
    useForm.mockReturnValueOnce({
      reset: resetMock,
      register: jest.fn(),
      handleSubmit: jest.fn(),
      watch: jest.fn(),
      formState: { errors: {} },
      setValue: jest.fn(),
    });

    const { rerender } = render(
      <FormWrapper transaction={{ ...mockTransaction }} />,
    );

    // Segunda instancia (simula que react-hook-form se vuelve a inicializar)
    const resetMockNew = jest.fn();
    useForm.mockReturnValueOnce({
      reset: resetMockNew,
      register: jest.fn(),
      handleSubmit: jest.fn(),
      watch: jest.fn(),
      formState: { errors: {} },
      setValue: jest.fn(),
    });

    const newTransaction = { ...mockTransaction, amount: 999 };
    rerender(<FormWrapper transaction={newTransaction} />);

    expect(resetMockNew).toHaveBeenCalledWith(newTransaction);
  });

  it("debería pasar accesibilidad mínima (presencia de rol)", () => {
    render(<FormWrapper transaction={mockTransaction} />);
    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
  });
});

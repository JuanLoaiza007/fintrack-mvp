import { render, screen, fireEvent } from "@testing-library/react";
import FormCarrousel from "@/components/ui/features/transacciones/form/form-carrousel";

// 💥 Mock necesario para que embla no explote
jest.mock("embla-carousel-react", () => {
  const mockEmblaApi = {
    canScrollPrev: jest.fn(() => false),
    canScrollNext: jest.fn(() => true),
    scrollPrev: jest.fn(),
    scrollNext: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    slideNodes: [],
  };

  const useEmblaCarousel = () => [jest.fn(), mockEmblaApi];

  return {
    __esModule: true,
    default: useEmblaCarousel,
    useEmblaCarousel,
  };
});

// Mock del wrapper para evitar lógica interna
jest.mock("@/components/ui/features/transacciones/form/form-wrapper", () => ({
  __esModule: true,
  default: ({ index, transaction, onUpdate, onDelete }) => (
    <div data-testid={`form-wrapper-${index}`}>
      <span>{transaction.description}</span>
      <button
        onClick={() =>
          onUpdate(index, { ...transaction, description: "Actualizado" })
        }
      >
        Actualizar
      </button>
      <button onClick={onDelete}>Eliminar</button>
    </div>
  ),
}));

describe("FormCarrousel", () => {
  const mockTransactions = [
    {
      id: 1,
      amount: 100,
      category: "food",
      date: "2025-04-17",
      description: "Empanadas",
      type: "expense",
      essential: true,
    },
    {
      id: 2,
      amount: 2000,
      category: "salary",
      date: "2025-04-18",
      description: "Pago mensual",
      type: "income",
      essential: false,
    },
  ];

  it("renderiza correctamente el carrusel con transacciones", () => {
    render(
      <FormCarrousel
        transactions={mockTransactions}
        onSave={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText(/2 transacciones/i)).toBeInTheDocument();
    expect(screen.getByTestId("form-wrapper-0")).toBeInTheDocument();
    expect(screen.getByTestId("form-wrapper-1")).toBeInTheDocument();
  });

  it("no rompe si recibe una lista vacía", () => {
    render(
      <FormCarrousel
        transactions={[]}
        onSave={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText(/0 transacciones/i)).toBeInTheDocument();
  });

  it("mantiene la estructura de accesibilidad mínima", () => {
    render(
      <FormCarrousel
        transactions={mockTransactions}
        onSave={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3); // Prev, Next, Guardar Todos
  });

  it("llama a onSave cuando se hace clic en 'Guardar Todos'", () => {
    const onSaveMock = jest.fn();
    render(
      <FormCarrousel
        transactions={mockTransactions}
        onSave={onSaveMock}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /guardar todos/i }));
    expect(onSaveMock).toHaveBeenCalled();
  });

  it("actualiza una transacción cuando se llama a onUpdate", () => {
    const onUpdateMock = jest.fn();
    render(
      <FormCarrousel
        transactions={mockTransactions}
        onSave={jest.fn()}
        onUpdate={onUpdateMock}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getAllByText("Actualizar")[0]);
    expect(onUpdateMock).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ description: "Actualizado" }),
    );
  });

  it("elimina una transacción cuando se hace clic en Eliminar", () => {
    const onDeleteMock = jest.fn();
    render(
      <FormCarrousel
        transactions={mockTransactions}
        onSave={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={onDeleteMock}
      />,
    );

    fireEvent.click(screen.getAllByText("Eliminar")[0]);
    expect(onDeleteMock).toHaveBeenCalledWith(0);
  });
});

// tests/transacciones/form/form-carrousel.test.jsx

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
  default: ({ index, transaction, onUpdate }) => (
    <div data-testid={`form-wrapper-${index}`}>
      <span>{transaction.description}</span>
      <button
        onClick={() =>
          onUpdate(index, { ...transaction, description: "Actualizado" })
        }
      >
        Actualizar
      </button>
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
    render(<FormCarrousel transactions={mockTransactions} />);
    expect(screen.getByText(/2 transacciones/i)).toBeInTheDocument();
    expect(screen.getByTestId("form-wrapper-0")).toBeInTheDocument();
    expect(screen.getByTestId("form-wrapper-1")).toBeInTheDocument();
  });

  it("no rompe si recibe una lista vacía", () => {
    render(<FormCarrousel transactions={[]} />);
    expect(screen.getByText(/0 transacciones/i)).toBeInTheDocument();
  });

  it("mantiene la estructura de accesibilidad mínima", () => {
    render(<FormCarrousel transactions={mockTransactions} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("actualiza una transacción cuando se llama a onUpdate", () => {
    render(<FormCarrousel transactions={mockTransactions} />);

    expect(screen.getByText("Empanadas")).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("Actualizar")[0]);

    expect(screen.getByText("Actualizado")).toBeInTheDocument();
  });
});

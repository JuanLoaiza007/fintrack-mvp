import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIVoiceTransactionCreator from "@/components/ui/features/transacciones/ai-voice-transaction-creator";
import { interpretTransactions } from "@/utils/gemini-transaction-interpreter";
import { isValidTransactionArray } from "@/components/schemas/transaccion";
import { toast } from "sonner";
import { addTransaction } from "@/db/db";

// === Mocks ===
jest.mock("@/utils/speechServices", () => ({
  getSpeechServices: () => ({
    stt: jest.fn(),
    tts: jest.fn(),
  }),
}));

jest.mock("@/context/TransactionContext", () => ({
  useTransactionContext: jest.fn(() => ({
    notifyTransactionUpdate: jest.fn(),
  })),
}));

const listenMock = jest.fn();
const stopMock = jest.fn();
const resetMock = jest.fn();

jest.mock("@/utils/speechFlow", () => {
  return jest.fn(() => ({
    listening: false,
    speaking: false,
    listen: listenMock,
    stop: stopMock,
    reset: resetMock,
  }));
});

jest.mock("@/utils/gemini-transaction-interpreter", () => ({
  interpretTransactions: jest.fn(async (texto) =>
    JSON.stringify({
      transactions: texto.includes("vacío")
        ? []
        : [
            {
              date: "2024-01-01",
              amount: 1000,
              type: "income",
              category: "work",
              description: "pago",
            },
          ],
    }),
  ),
}));

jest.mock("@/components/schemas/transaccion", () => ({
  isValidTransactionArray: jest.fn((arr) => ({
    valid: arr.length > 0,
    errors: arr.length > 0 ? [] : [{ message: "Faltan datos" }],
  })),
}));

jest.mock("@/components/hooks/useMicVolume", () => ({
  useMicVolume: () => 10,
}));

jest.mock("react-markdown", () => (props) => {
  return <div data-testid="markdown">{props.children}</div>;
});

jest.mock("remark-gfm", () => () => {});

const saveMock = jest.fn();
jest.mock("@/db/db", () => ({
  addTransaction: jest.fn(() => Promise.resolve(saveMock())),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/ui/features/transacciones/form/form-carrousel", () => {
  return ({ transactions, onSave, onDelete, onUpdate }) => (
    <div data-testid="form-carrousel">
      <button onClick={onSave}>Guardar Todos</button>
      <button onClick={() => onDelete(0)}>Eliminar</button>
      <button
        onClick={() =>
          onUpdate(0, {
            description: "actualizado",
            amount: 123,
            type: "income",
            category: "work",
            date: "2024-01-01",
          })
        }
      >
        Actualizar
      </button>
    </div>
  );
});

// === TESTS ===
describe("AIVoiceTransactionCreator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("permite guardar todas las transacciones exitosamente", async () => {
    let onTextDetected;
    require("@/utils/speechFlow").mockImplementation(
      ({ onTextDetected: cb }) => {
        onTextDetected = cb;
        return {
          listening: true,
          speaking: false,
          listen: jest.fn(),
          stop: jest.fn(),
          reset: jest.fn(),
        };
      },
    );

    render(<AIVoiceTransactionCreator setIsCreateOpen={jest.fn()} />);
    await waitFor(() => onTextDetected("pago de sueldo"));

    const guardarBtn = await screen.findByText("Guardar Todos");
    fireEvent.click(guardarBtn);

    await waitFor(() => {
      expect(addTransaction).toHaveBeenCalledTimes(1);
    });
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringMatching(/todas las transacciones fueron guardadas/i),
    );
  });

  it("permite eliminar una transacción", async () => {
    let onTextDetected;
    require("@/utils/speechFlow").mockImplementation(
      ({ onTextDetected: cb }) => {
        onTextDetected = cb;
        return {
          listening: true,
          speaking: false,
          listen: jest.fn(),
          stop: jest.fn(),
          reset: jest.fn(),
        };
      },
    );

    render(<AIVoiceTransactionCreator setIsCreateOpen={jest.fn()} />);
    await waitFor(() => onTextDetected("pago de sueldo"));

    const eliminarBtn = await screen.findByText("Eliminar");
    fireEvent.click(eliminarBtn);

    // tras eliminar la única transacción, el carrusel ya no debería renderizarse
    await waitFor(() => {
      expect(screen.queryByTestId("form-carrousel")).not.toBeInTheDocument();
    });
  });

  it("permite actualizar una transacción", async () => {
    let onTextDetected;
    require("@/utils/speechFlow").mockImplementation(
      ({ onTextDetected: cb }) => {
        onTextDetected = cb;
        return {
          listening: true,
          speaking: false,
          listen: jest.fn(),
          stop: jest.fn(),
          reset: jest.fn(),
        };
      },
    );

    render(<AIVoiceTransactionCreator setIsCreateOpen={jest.fn()} />);
    await waitFor(() => onTextDetected("pago de sueldo"));

    const actualizarBtn = await screen.findByText("Actualizar");
    fireEvent.click(actualizarBtn);

    // verificamos internamente que se actualizó (esto puede validarse con addTransaction si se guarda luego)
    const guardarBtn = await screen.findByText("Guardar Todos");
    fireEvent.click(guardarBtn);

    await waitFor(() => {
      const payload = addTransaction.mock.calls[0][0];
      expect(payload.description).toBe("actualizado");
      expect(payload.amount).toBe(123);
    });
  });
});

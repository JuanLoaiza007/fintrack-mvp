import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIVoiceTransactionCreator from "@/components/ui/features/transacciones/ai-voice-transaction-creator";
import { interpretTransactions } from "@/utils/gemini-transaction-interpreter";
import { isValidTransactionArray } from "@/components/schemas/transaccion";
import { toast } from "sonner";

// === Mocks ===
jest.mock("@/utils/speechServices", () => ({
  getSpeechServices: () => ({
    stt: jest.fn(),
    tts: jest.fn(),
  }),
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

jest.mock(
  "@/components/ui/features/transacciones/form/form-carrousel",
  () => () => <div data-testid="form-carrousel" />,
);

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// === TESTS ===
describe("AIVoiceTransactionCreator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders instructions and button", () => {
    render(<AIVoiceTransactionCreator />);
    expect(screen.getByText(/Instrucciones:/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByTestId("markdown")).toBeInTheDocument();
  });

  it("starts listening when not currently listening", () => {
    render(<AIVoiceTransactionCreator />);
    fireEvent.click(screen.getByRole("button"));
    expect(listenMock).toHaveBeenCalled();
  });

  it("stops listening when already listening", () => {
    require("@/utils/speechFlow").mockReturnValueOnce({
      listening: true,
      speaking: false,
      listen: listenMock,
      stop: stopMock,
      reset: resetMock,
    });

    render(<AIVoiceTransactionCreator />);
    fireEvent.click(screen.getByRole("button"));
    expect(stopMock).toHaveBeenCalled();
  });

  it("shows loading state while processing", async () => {
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

    render(<AIVoiceTransactionCreator />);
    await waitFor(() => onTextDetected("Hoy me pagaron 1000 del trabajo"));

    expect(interpretTransactions).toHaveBeenCalled();
    expect(isValidTransactionArray).toHaveBeenCalled();

    // ✅ Esperar a que el FormCarrousel se renderice antes de hacer el assert
    await waitFor(() =>
      expect(screen.getByTestId("form-carrousel")).toBeInTheDocument(),
    );
  });

  it("shows error when LLM returns empty transactions", async () => {
    let onTextDetected;
    require("@/utils/speechFlow").mockImplementation(
      ({ onTextDetected: cb }) => {
        onTextDetected = cb;
        return {
          listening: true,
          speaking: false,
          listen: listenMock,
          stop: stopMock,
          reset: resetMock,
        };
      },
    );

    render(<AIVoiceTransactionCreator />);
    await waitFor(() => onTextDetected("vacío"));

    expect(screen.queryByTestId("form-carrousel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("form-carrousel")).not.toBeInTheDocument();
    expect(isValidTransactionArray).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/no se han encontrado transacciones/i),
    );
  });

  it("shows toast error on interpret failure", async () => {
    interpretTransactions.mockRejectedValueOnce(
      new Error("Fallo al interpretar"),
    );

    let onTextDetected;
    require("@/utils/speechFlow").mockImplementation(
      ({ onTextDetected: cb }) => {
        onTextDetected = cb;
        return {
          listening: true,
          speaking: false,
          listen: listenMock,
          stop: stopMock,
          reset: resetMock,
        };
      },
    );

    render(<AIVoiceTransactionCreator />);
    await waitFor(() => onTextDetected("algo que falla"));

    expect(interpretTransactions).toHaveBeenCalled();
    expect(screen.queryByTestId("form-carrousel")).not.toBeInTheDocument();
  });
});

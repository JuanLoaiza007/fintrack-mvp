import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIVoiceTransactionCreator from "@/components/ui/features/transacciones/ai-voice-transaction-creator";

jest.mock("@/utils/speechServices", () => ({
  getSpeechServices: () => ({
    stt: jest.fn(),
    tts: jest.fn(),
  }),
}));

jest.mock("@/utils/speechFlow", () => {
  return jest.fn(() => ({
    listening: false,
    speaking: false,
    listen: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
});

jest.mock("@/utils/gemini-transaction-interpreter", () => ({
  interpretTransactions: jest.fn(async (texto) =>
    JSON.stringify({
      transactions: texto.includes("vacío")
        ? []
        : [{ fecha: "2024-01-01", monto: 1000 }],
    }),
  ),
}));

jest.mock("@/components/schemas/transaccion", () => ({
  isValidTransactionArray: jest.fn((arr) => ({
    valid: arr.length > 0,
    errors: arr.length > 0 ? [] : ["Faltan datos"],
  })),
}));

jest.mock("@/components/hooks/useMicVolume", () => ({
  useMicVolume: () => 10,
}));

jest.mock("react-markdown", () => (props) => {
  return <div data-testid="markdown">{props.children}</div>;
});

jest.mock("remark-gfm", () => () => {});

describe("AIVoiceTransactionCreator", () => {
  it("must render the component without errors", () => {
    render(<AIVoiceTransactionCreator />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders instructions and button", () => {
    render(<AIVoiceTransactionCreator />);
    expect(screen.getByText(/Instrucciones:/)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays recording message when button is pressed and not listening", () => {
    require("@/utils/speechFlow").mockReturnValueOnce({
      listening: false,
      speaking: true,
      listen: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    });

    render(<AIVoiceTransactionCreator />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText(/🎙️ Escuchando.../)).toBeInTheDocument();
  });

  it("displays stop message when already listening", () => {
    require("@/utils/speechFlow").mockReturnValueOnce({
      listening: true,
      speaking: false,
      listen: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    });

    render(<AIVoiceTransactionCreator />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText(/⏹️ Grabación detenida/)).toBeInTheDocument();
  });
});

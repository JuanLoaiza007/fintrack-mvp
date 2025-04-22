import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AISuggestion from "@/components/ui/features/transacciones/ai-suggestion";
import { generateFinancialSummary } from "@/utils/gemini";
import { getGoals } from "@/db/db";

// Mock Gemini request and getGoals functions
jest.mock("@/utils/gemini", () => ({
  generateFinancialSummary: jest.fn(),
}));
jest.mock("@/db/db", () => ({
  getGoals: jest.fn(),
}));

jest.mock("remark-gfm", () => {
  return () => {};
});

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

// Mock TransactionContext to provide iaTransactions
jest.mock("@/context/TransactionContext", () => ({
  useTransactionContext: () => ({
    iaTransactions: [{ id: 1, description: "Test transaction" }],
  }),
}));

// Create a mock for tts.speak and tts.cancel
const mockSpeak = jest.fn();
const mockCancel = jest.fn();

// Mock getSpeechServices
jest.mock("@/utils/speechServices", () => ({
  getSpeechServices: () => ({
    tts: { speak: mockSpeak, cancel: mockCancel },
  }),
}));

// Mock speechFlow (used in AiChat)
jest.mock("@/utils/speechFlow", () => ({
  __esModule: true,
  default: () => ({
    transcript: "",
    listening: false,
    supportsSpeechRecognition: false,
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

// Mock window.alert
window.alert = jest.fn();

describe("AISuggestion Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue({}),
    };

    global.AudioContext = jest.fn().mockImplementation(() => ({
      createAnalyser: jest.fn(() => ({
        fftSize: 256,
        frequencyBinCount: 128,
        getByteFrequencyData: jest.fn(),
      })),
      createMediaStreamSource: jest.fn(() => ({
        connect: jest.fn(),
      })),
      close: jest.fn(),
    }));

    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("renders the open suggestion button initially", () => {
    render(<AISuggestion />);
    expect(
      screen.getByRole("button", { name: /open ia suggestion/i }),
    ).toBeInTheDocument();
  });

  it("fetches goals on mount and updates metaAhorro", async () => {
    const fakeGoals = [
      { id: 1, amount: 5000, targetDate: new Date().toISOString() },
      { id: 2, amount: 10000, targetDate: "2024-01-01" },
    ];
    getGoals.mockResolvedValueOnce(fakeGoals);
    render(<AISuggestion />);
    await waitFor(() => {
      expect(getGoals).toHaveBeenCalled();
    });
  });

  it("allows closing the suggestion panel", async () => {
    generateFinancialSummary.mockResolvedValueOnce("Suggestion text");
    render(<AISuggestion />);
    fireEvent.click(
      screen.getByRole("button", { name: /open ia suggestion/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /generate ia suggestion/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/suggestion text/i)).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /close ia suggestion/i }),
    );
    await waitFor(() => {
      expect(screen.queryByText(/suggestion text/i)).toBeNull();
    });
  });

  it("calls tts.speak with the suggestion", async () => {
    generateFinancialSummary.mockResolvedValueOnce("Mock spoken suggestion");
    render(<AISuggestion />);
    fireEvent.click(
      screen.getByRole("button", { name: /open ia suggestion/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /generate ia suggestion/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/mock spoken suggestion/i)).toBeInTheDocument();
    });
    const ttsButton = screen.getByRole("button", { name: /start stop tts/i });
    fireEvent.click(ttsButton);
    expect(mockSpeak).toHaveBeenCalledWith(
      "Mock spoken suggestion",
      undefined,
      expect.any(Function),
    );
  });

  it("calls tts.speak with fallback message if no suggestion exists", async () => {
    render(<AISuggestion />);
    fireEvent.click(
      screen.getByRole("button", { name: /open ia suggestion/i }),
    );
    const ttsButton = screen.getByRole("button", { name: /start stop tts/i });
    fireEvent.click(ttsButton);
    expect(mockSpeak).toHaveBeenCalledWith(
      "Presiona generar para obtener una sugerencia",
      undefined,
      expect.any(Function),
    );
  });

  it("cancels tts if playing is true", async () => {
    generateFinancialSummary.mockResolvedValueOnce("Cancel test suggestion");
    render(<AISuggestion />);
    fireEvent.click(
      screen.getByRole("button", { name: /open ia suggestion/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /generate ia suggestion/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/cancel test suggestion/i)).toBeInTheDocument();
    });
    const ttsButton = screen.getByRole("button", { name: /start stop tts/i });
    // start playback
    fireEvent.click(ttsButton);
    // simulate callback setting playing to false
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled();
    });
    // stop playback
    fireEvent.click(ttsButton);
    expect(mockCancel).toHaveBeenCalled();
  });
});

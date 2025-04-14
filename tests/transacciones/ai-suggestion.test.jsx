import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AISuggestion from "@/components/ui/features/transacciones/ai-suggestion";
import { request_gemini } from "@/utils/gemini";
import { getGoals } from "@/db/db";

// Mock Gemini request and getGoals functions
jest.mock("@/utils/gemini", () => ({
  request_gemini: jest.fn(),
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

// Mock window.alert
window.alert = jest.fn();

describe("AISuggestion Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue({
        // Puedes retornar un objeto MediaStream falso si lo necesitas
      }),
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
    // Provide fake goals data with one goal in current month
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
    request_gemini.mockResolvedValueOnce("Suggestion text");
    render(<AISuggestion />);
    // Open the suggestion panel by clicking the open button and then generate
    fireEvent.click(
      screen.getByRole("button", { name: /open ia suggestion/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /generate ia suggestion/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/suggestion text/i)).toBeInTheDocument();
    });
    // Click the close button
    fireEvent.click(
      screen.getByRole("button", { name: /close ia suggestion/i }),
    );
    await waitFor(() => {
      expect(screen.queryByText(/suggestion text/i)).toBeNull();
    });
  });
});

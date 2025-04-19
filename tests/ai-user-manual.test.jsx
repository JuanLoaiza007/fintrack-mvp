import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserManual } from "@/components/ui/features/ai-user-manual";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import { getSpeechServices } from "@/utils/speechServices";
import useSpeechFlow from "@/utils/speechFlow";
import { askUsageHelp } from "@/utils/gemini-help-assistant";

jest.mock("@/components/hooks/useMicVolume");
jest.mock("@/utils/speechServices");
jest.mock("@/utils/speechFlow");
jest.mock("@/utils/gemini-help-assistant");
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => (
      <div {...props} data-testid="motion-div">
        {children}
      </div>
    ),
  },
  useMotionValue: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    onChange: jest.fn(),
  })),
  useSpring: jest.fn((value) => value),
}));

describe("UserManual Component", () => {
  const mockTrigger = <button data-testid="trigger-button">Open Help</button>;

  // Mock implementations
  const mockUseMicVolume = {
    volume: 10,
  };

  const mockSpeechServices = {
    stt: {
      start: jest.fn(),
      stop: jest.fn(),
      onresult: jest.fn(),
    },
    tts: {
      speak: jest.fn(),
      cancel: jest.fn(),
    },
  };

  // Create a more robust mock for speechFlow
  const createSpeechFlowMock = () => {
    const mock = {
      listen: jest.fn(),
      stop: jest.fn(),
      speak: jest.fn(),
      listening: false,
      _textDetectedCallback: null,
      onTextDetected: jest.fn((callback) => {
        mock._textDetectedCallback = callback;
      }),
      simulateTextDetected: (text) => {
        if (mock._textDetectedCallback) {
          mock._textDetectedCallback(text);
        }
      },
    };
    return mock;
  };

  let mockSpeechFlow;

  beforeEach(() => {
    jest.clearAllMocks();
    useMicVolume.mockReturnValue(mockUseMicVolume);
    getSpeechServices.mockReturnValue(mockSpeechServices);
    mockSpeechFlow = createSpeechFlowMock();
    useSpeechFlow.mockReturnValue(mockSpeechFlow);
    askUsageHelp.mockResolvedValue("Respuesta de prueba del asistente");
  });

  test("renders closed dialog with trigger", () => {
    render(<UserManual trigger={mockTrigger} />);
    expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
    expect(screen.queryByText("Chatbot de ayuda")).not.toBeInTheDocument();
  });

  test("opens dialog when trigger is clicked", async () => {
    render(<UserManual trigger={mockTrigger} />);
    fireEvent.click(screen.getByTestId("trigger-button"));
    expect(await screen.findByText("Chatbot de ayuda")).toBeInTheDocument();
  });

  test("shows microphone animation when listening", async () => {
    useSpeechFlow.mockReturnValue({
      ...mockSpeechFlow,
      listening: true,
    });

    render(<UserManual trigger={mockTrigger} />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    await waitFor(() => {
      expect(screen.getByTestId("motion-div")).toBeInTheDocument();
    });
  });

  test("is accessible with proper ARIA attributes", async () => {
    render(<UserManual trigger={mockTrigger} />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText("Chatbot de ayuda")).toBeInTheDocument();
    });
  });
  test("displays initial chat message on open", async () => {
    render(<UserManual trigger={mockTrigger} />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    await waitFor(() => {
      expect(
        screen.getByText(/¡Hola! Soy tu asistente de ayuda/i),
      ).toBeInTheDocument();
    });
  });

  test("handles speech processing errors gracefully", async () => {
    askUsageHelp.mockRejectedValue(new Error("API error"));
    render(<UserManual trigger={mockTrigger} />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    act(() => {
      mockSpeechFlow.simulateTextDetected("test question");
    });

    await waitFor(() => {
      expect(
        screen.getByText(/¡Hola! Soy tu asistente de ayuda/i),
      ).toBeInTheDocument();
    });
  });

  test("cleans up speech services when dialog is closed", async () => {
    render(<UserManual trigger={mockTrigger} />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    // Close dialog
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(mockSpeechFlow.stop).toHaveBeenCalled();
    });
  });

  test("toggles microphone button correctly", async () => {
    render(<UserManual trigger={mockTrigger} />);
    fireEvent.click(screen.getByTestId("trigger-button"));

    const micButton = screen.getByRole("button", {
      name: /Hablar con el asistente/i,
    });
    fireEvent.click(micButton);

    expect(mockSpeechFlow.listen).toHaveBeenCalled();

    // Simula cambio a estado escuchando
    useSpeechFlow.mockReturnValueOnce({ ...mockSpeechFlow, listening: true });

    fireEvent.click(micButton);
    expect(mockSpeechFlow.stop).toHaveBeenCalled();
  });
});

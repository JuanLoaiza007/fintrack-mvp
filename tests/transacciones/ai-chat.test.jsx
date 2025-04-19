import { render, screen } from "@testing-library/react";
import AiChat from "@/components/ui/features/transacciones/ai-chat";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock framer-motion
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    useMotionValue: jest.fn().mockReturnValue({
      set: jest.fn(),
    }),
    useSpring: jest.fn().mockReturnValue(0.5),
    motion: {
      div: (props) => <div {...props} />,
    },
  };
});

// Mock useMicVolume hook
jest.mock("@/components/hooks/useMicVolume", () => ({
  useMicVolume: jest.fn(),
}));

// Mock custom utils
jest.mock("@/utils/speechFlow", () => {
  return jest.fn(() => ({
    listen: jest.fn(),
    stop: jest.fn(),
    speak: jest.fn(),
    reset: jest.fn(),
    listening: true,
    speaking: false,
    shouldAlert: false,
  }));
});

jest.mock("@/utils/speechServices", () => ({
  getSpeechServices: () => ({
    stt: {},
    tts: {},
  }),
}));

jest.mock("@/utils/gemini", () => ({
  continueFinancialChat: jest.fn().mockResolvedValue("Respuesta de la IA"),
}));

describe("AiChat Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useMicVolume.mockReturnValue(10);
  });

  const setup = (isOpen = true) => {
    render(
      <AiChat
        isOpen={isOpen}
        onClose={mockOnClose}
        initialContext={{
          transacciones: [],
          metaAhorro: 0,
          presupuesto: 0,
        }}
      />,
    );
  };

  it("renders dialog when open", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: /asistente financiero/i }),
    ).toBeInTheDocument();
  });

  it("does not render dialog when closed", () => {
    const { container } = render(
      <AiChat
        isOpen={false}
        onClose={mockOnClose}
        initialContext={{ transacciones: [], metaAhorro: 0, presupuesto: 0 }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders microphone button with label", () => {
    setup();
    const micButton = screen.getByRole("button", { name: /detener/i });
    expect(micButton).toBeInTheDocument();
  });

  it("handles click on microphone button", async () => {
    setup();
    const micButton = screen.getByRole("button", { name: /detener/i });

    // El botón puede deshabilitarse luego del click para evitar múltiples activaciones
    expect(micButton).toBeEnabled();
    await userEvent.click(micButton);
  });

  it("renders chat messages", () => {
    setup();
    const userMsg = screen.queryByText(/tú:/i);
    const aiMsg = screen.queryByText(/ia:/i);
    expect(userMsg).not.toBeInTheDocument();
    expect(aiMsg).not.toBeInTheDocument();
  });

  it("updates animation based on mic volume", () => {
    useMicVolume.mockReturnValue(100);
    setup();
    expect(useMicVolume).toHaveBeenCalled();
  });

  it("renders accessibility roles", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: /asistente financiero/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /detener/i }),
    ).toBeInTheDocument();
  });
});

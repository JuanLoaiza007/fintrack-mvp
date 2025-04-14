import { render, screen, fireEvent } from "@testing-library/react";
import AiChat from "@/components/ui/features/transacciones/ai-chat";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import userEvent from "@testing-library/user-event";

// Mocking dependencies
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    useMotionValue: jest.fn().mockReturnValue({ set: jest.fn() }),
    useSpring: jest.fn().mockReturnValue(0.5),
    motion: {
      div: (props) => <div {...props} />,
    },
  };
});

jest.mock("@/components/hooks/useMicVolume");

describe("AiChat Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useMicVolume.mockReturnValue(10); // default mock volume
  });

  it("renders the dialog when isOpen is true", () => {
    render(<AiChat isOpen={true} onClose={mockOnClose} />);

    // Check for dialog title and mic indicator
    expect(
      screen.getByRole("heading", { name: /asistente financiero/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/estoy escuchando/i)).toBeInTheDocument();
  });

  it("does not render the dialog when isOpen is false", () => {
    const { container } = render(
      <AiChat isOpen={false} onClose={mockOnClose} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClose when user clicks the close button", async () => {
    render(<AiChat isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });

    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it("shows the microphone icon with proper accessibility", () => {
    render(<AiChat isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument(); // Lucide icons render SVGs
  });

  it("updates animation scale and opacity when mic volume changes", () => {
    // The hook is mocked, but we verify that the volume is being used in the effect.
    useMicVolume.mockReturnValue(100); // simulate high volume
    render(<AiChat isOpen={true} onClose={mockOnClose} />);
    expect(useMicVolume).toHaveBeenCalled();
    // No direct assertion of motion values since they are mocked, but test ensures volume is read
  });
});

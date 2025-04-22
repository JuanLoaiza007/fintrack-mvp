import { render, screen, fireEvent } from "@testing-library/react";
import ConfigModule from "@/components/ui/features/configuracion/module";
import VoiceSelector from "@/components/ui/features/configuracion/voiceSelector";

// Mocking the VoiceSelector component
jest.mock("@/components/ui/features/configuracion/voiceSelector", () => {
  return jest.fn(() => <div>Mocked VoiceSelector</div>);
});

describe("ConfigModule", () => {
  it("renders the component correctly", () => {
    render(<ConfigModule />);

    // Check if the title is rendered
    expect(
      screen.getByRole("heading", { name: /configuración/i }),
    ).toBeInTheDocument();

    // Check if the subtitle is rendered
    expect(
      screen.getByRole("heading", { name: /selector de voz del asistente/i }),
    ).toBeInTheDocument();

    // Check if the mocked VoiceSelector component is rendered
    expect(screen.getByText(/mocked voiceselector/i)).toBeInTheDocument();
  });
});

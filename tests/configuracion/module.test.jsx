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

  it("renders the VoiceSelector correctly", () => {
    render(<ConfigModule />);

    // Check if the mocked VoiceSelector renders as expected
    expect(screen.getByText(/mocked voiceselector/i)).toBeInTheDocument();
  });

  //   it('displays an error message when there is an error playing the voice', async () => {
  //     render(<VoiceSelector />);

  //     // Select a voice (mocking it as a valid ID)
  //     fireEvent.change(screen.getByRole('combobox'), { target: { value: 'JBFqnCBsd6RMkjVDRZzb' } });

  //     // Click play
  //     fireEvent.click(screen.getByRole('button'));

  //     // Wait for the error message to appear
  //     const errorMessage = await screen.findByText(/an error occurred while playing the voice/i);
  //     expect(errorMessage).toBeInTheDocument();
  //   });

  it("performs a basic interaction (if applicable)", () => {
    // You can use this to simulate interactions if needed, e.g., clicking a button to change the voice
    render(<ConfigModule />);

    // Example: Let's simulate clicking a button (if there was one)
    // fireEvent.click(screen.getByRole('button'));
    // You would check for the expected outcome here
  });

  // Example of testing accessibility
  //   it('should have accessible roles and labels', () => {
  //     render(<ConfigModule />);

  //     // Check if the VoiceSelector is accessible by role or label
  //     expect(screen.getByRole('button', { name: /select voice/i })).toBeInTheDocument();
  //   });
});

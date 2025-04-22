// tests/VoiceSelector.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import VoiceSelector from "@/components/ui/features/configuracion/voiceSelector";
import { elevenLabsTTS } from "../../utils/elevenlabsTTS";

// Mock de los módulos
jest.mock("../../utils/elevenlabsTTS", () => ({
  elevenLabsTTS: {
    speak: jest.fn(),
    cancel: jest.fn(),
  },
}));

describe("VoiceSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar los mocks antes de cada prueba
  });

  it("renders correctly", async () => {
    render(<VoiceSelector />);

    // Esperar a que el texto "George" se renderice
    await screen.findByText("George");

    // Verificar que el select tiene la opción seleccionada con el valor predeterminado "George"
    expect(screen.getByText("George")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("selects a voice", () => {
    render(<VoiceSelector />);

    // Abrir el Select
    fireEvent.click(screen.getByText("George"));

    // Seleccionar una voz (por ejemplo, George)
    fireEvent.click(screen.getByText("Rachel"));

    // Verificar que la voz seleccionada se ha actualizado correctamente
    expect(screen.getByText("Rachel")).toBeInTheDocument();
  });

  it("plays the audio when clicking play", async () => {
    // Configurar el mock para que no haga nada al invocar speak
    render(<VoiceSelector />);

    fireEvent.click(screen.getByText("Rachel"));
    fireEvent.click(screen.getByText("George"));

    // Simular clic en el botón de play
    fireEvent.click(screen.getByRole("button"));

    // Verificar que `elevenLabsTTS.speak` fue llamado con el texto y voz correctos
    expect(elevenLabsTTS.speak).toHaveBeenCalledWith(
      "Hola, esta es una prueba de voz",
      "JBFqnCBsd6RMkjVDRZzb",
    );
  });

  it("button is disabled when a voice is selected and audio is playing", async () => {
    render(<VoiceSelector />);

    // Simular clic en el botón de play
    fireEvent.click(screen.getByRole("button"));

    // Verificar que el botón esté deshabilitado
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

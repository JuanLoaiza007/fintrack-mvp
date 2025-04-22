import { renderHook, act } from "@testing-library/react";
import { useElevenLabsSTT } from "../../utils/elevenlabsSTT"; // ajusta esta ruta
import { ElevenLabsClient } from "elevenlabs";

global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{ stop: jest.fn() }],
  }),
};

global.MediaRecorder = class {
  constructor() {
    this.state = "inactive";
    this.ondataavailable = null;
    this.onstop = null;

    this.stop = jest.fn(() => {
      this.state = "inactive";
      if (this.onstop) this.onstop();
    });

    this.start = jest.fn(() => {
      this.state = "recording";
      setTimeout(() => {
        if (this.ondataavailable) {
          const dummyBlob = new Blob(["audio de prueba"], {
            type: "audio/webm",
          });
          this.ondataavailable({ data: dummyBlob });
        }
        if (this.onstop) {
          this.state = "inactive";
          this.onstop();
        }
      }, 100);
    });
  }
};

global.AudioContext = class {
  constructor() {
    this.createAnalyser = jest.fn(() => ({
      fftSize: 2048,
      getByteTimeDomainData: jest.fn((data) => {
        for (let i = 0; i < data.length; i++) {
          data[i] = 128;
        }
      }),
    }));
    this.createMediaStreamSource = jest.fn(() => ({
      connect: jest.fn(),
    }));
    this.close = jest.fn();
  }
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

jest.mock("elevenlabs", () => {
  return {
    ElevenLabsClient: jest.fn().mockImplementation(() => {
      return {
        speechToText: {
          convert: jest.fn().mockResolvedValue({ text: "Texto de prueba" }),
        },
      };
    }),
  };
});

jest.useFakeTimers();

describe("useElevenLabsSTT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería inicializar con los valores por defecto", () => {
    const { result } = renderHook(() => useElevenLabsSTT());

    expect(result.current.transcript).toBe("");
    expect(result.current.listening).toBe(false);
    expect(result.current.supportsSpeechRecognition).toBe(true);
    expect(typeof result.current.start).toBe("function");
    expect(typeof result.current.stop).toBe("function");
    expect(typeof result.current.resetTranscript).toBe("function");
  });

  it("debería iniciar grabación y actualizar transcript después de detenerse", async () => {
    const { result } = renderHook(() => useElevenLabsSTT());

    await act(async () => {
      await result.current.start();
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(result.current.listening).toBe(false);
    expect(result.current.transcript).toBe("Texto de prueba");
  });

  it("debería manejar el error si la conversión de audio falla", async () => {
    jest.mock("elevenlabs", () => {
      return {
        ElevenLabsClient: jest.fn().mockImplementation(() => {
          return {
            speechToText: {
              convert: jest
                .fn()
                .mockRejectedValue(new Error("Error en la conversión")),
            },
          };
        }),
      };
    });

    const { result } = renderHook(() => useElevenLabsSTT());

    await act(async () => {
      await result.current.start();
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(result.current.listening).toBe(false);
    expect(result.current.transcript).toBe("Texto de prueba");
  });

  it("debería restablecer el transcript correctamente", async () => {
    const { result } = renderHook(() => useElevenLabsSTT());

    await act(async () => {
      await result.current.start();
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(result.current.transcript).toBe("Texto de prueba");

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe("");
  });

  it("debería detectar que el navegador sí soporta la grabación de audio", () => {
    const { result } = renderHook(() => useElevenLabsSTT());

    expect(result.current.supportsSpeechRecognition).toBe(true);
  });
});

describe("elevenLabsTTS", () => {
  it("debería llamar onEndCallback cuando termina el audio", async () => {
    const mockCallback = jest.fn();

    const mockPlay = jest.fn().mockResolvedValue();
    const mockPause = jest.fn();
    const mockAudio = {
      play: mockPlay,
      pause: mockPause,
      onended: null,
    };

    global.Audio = jest.fn(() => mockAudio);

    const { elevenLabsTTS } = await import("../../utils/elevenlabsTTS");

    jest
      .spyOn(elevenLabsTTS, "speak")
      .mockImplementation(async (text, voiceId, onEndCallback) => {
        mockAudio.onended = onEndCallback;
        await mockAudio.play();
        mockAudio.onended();
      });

    await elevenLabsTTS.speak("Test", undefined, mockCallback);

    expect(mockCallback).toHaveBeenCalled();
  });
});

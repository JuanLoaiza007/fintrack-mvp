"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mic } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import useSpeechFlow from "@/utils/speechFlow";
import { getSpeechServices } from "@/utils/speechServices";
import { askUsageHelp } from "@/utils/gemini-help-assistant";

/**
 * A help chatbot component that provides voice-based guidance on using the FinTrack app.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {JSX.Element} props.trigger - The React element used to open the chatbot dialog. Required.
 * @param {Object} [props.context={}] - Optional context object used to enhance response behavior (e.g., financial data). Defaults to an empty object.
 *
 * @remarks
 * This component uses speech recognition and synthesis via `useSpeechFlow`, manages microphone volume with `useMicVolume`,
 * and updates chat state via internal `useState`. It also applies Framer Motion animations to visualize audio input.
 *
 * @returns {JSX.Element} A dialog-based chatbot UI that listens for user voice input and responds with contextual help messages.
 *
 * @example
 * <UserManual
 *   trigger={<Button>Open Help</Button>}
 *   context={{ presupuesto: { total: 1000 }, transacciones: [] }}
 * />
 */
export function UserManual({ trigger, context = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      sender: "model",
      text: "¡Hola! Soy tu asistente de ayuda. Pregúntame cómo registrar transacciones o visualizar reportes!",
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const isProcessingRef = useRef(false);
  const { stt, tts } = getSpeechServices();

  /**
   * Handles detected speech input from the user, updates the chat log,
   * invokes the help assistant API, and responds using text-to-speech.
   *
   * @async
   * @function handleTextDetected
   * @param {string} userText - The transcribed text detected from the user's voice input. Required.
   * @returns {Promise<void>} A promise that resolves when the help response has been processed and spoken.
   * @remarks
   * This function updates the chat log state, manages loading state for speech processing,
   * calls the `askUsageHelp` service, and invokes the `speech.speak` method with the response.
   * It also uses `isProcessingRef` to prevent concurrent processing.
   * On error, a fallback message is displayed and spoken.
   * The function depends on state setters `setChatLog`, `setIsProcessingSpeech`, and the `speech` instance.
   * It is used as a callback in `useSpeechFlow`.
   *
   * @example
   * await handleTextDetected("¿Cómo registro una transacción?");
   */
  const handleTextDetected = async (userText) => {
    const userMessage = userText;
    const newChatLog = [...chatLog, { sender: "user", text: userMessage }];
    setChatLog(newChatLog);

    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsProcessingSpeech(true);

      try {
        const response = await askUsageHelp(userText);

        setChatLog((prev) => [...prev, { sender: "model", text: response }]);
        speech.speak(response);
      } catch (error) {
        console.error("Error processing help request:", error);
        speech.speak("Lo siento, hubo un error. Intenta de nuevo.");
        setChatLog((prev) => [
          ...prev,
          {
            sender: "model",
            text: "❌ Error al procesar tu pregunta. Intenta de nuevo.",
          },
        ]);
      } finally {
        isProcessingRef.current = false;
        setIsProcessingSpeech(false);
      }
    }
  };

  const speech = useSpeechFlow({
    onTextDetected: handleTextDetected,
    stt,
    tts,
  });

  useEffect(() => {
    if (isOpen) {
      speech.listen();
      setIsListening(true);
    } else {
      speech.stop();
      setIsListening(false);
    }

    return () => speech.stop();
  }, [isOpen]);

  /**
   * Handles microphone activation or deactivation when the user interacts with the voice assistant button.
   *
   * @async
   * @function handleListenClick
   * @returns {Promise<void>} A promise that resolves when the microphone state has been toggled and speech listening started or stopped.
   * @remarks
   * This function toggles the voice assistant's listening state and cancels any ongoing text-to-speech playback.
   * It manages the state `isProcessingSpeech` to provide feedback while processing the action.
   * Errors during mic control are logged to the console.
   *
   * @example
   * await handleListenClick(); // Starts or stops the speech recognition
   */
  const handleListenClick = async () => {
    setIsProcessingSpeech(true);
    try {
      if (speech.listening) {
        speech.stop();
      } else {
        tts.cancel();
        speech.listen();
      }
    } catch (error) {
      console.error("Error al cambiar el estado del micrófono:", error);
    } finally {
      setIsProcessingSpeech(false);
    }
  };

  // Microphone animation setup
  const volume = useMicVolume();
  const rawOpacity = useMotionValue(0.4);
  const rawScale = useMotionValue(1);
  const smoothOpacity = useSpring(rawOpacity, { stiffness: 100, damping: 20 });
  const smoothScale = useSpring(rawScale, { stiffness: 120, damping: 15 });

  useEffect(() => {
    const normalized = Math.min(volume / 20, 1);
    rawScale.set(1 + normalized * 1.5);
    rawOpacity.set(0.4 + normalized * 0.4);
  }, [volume, rawOpacity, rawScale]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Chatbot de ayuda
          </DialogTitle>
          <DialogDescription>
            Este chatbot te ayudará a aprender a usar la aplicación. Habla con
            él!
          </DialogDescription>
        </DialogHeader>

        {/* Chat messages display */}
        <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {chatLog.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                msg.sender === "user"
                  ? "ml-auto bg-purple-100 border border-purple-200"
                  : "mr-auto bg-white border border-gray-200"
              }`}
            >
              <div className="font-medium text-sm text-purple-800 mb-1">
                {msg.sender === "user" ? "Tú" : "Asistente"}
              </div>
              <div className="text-gray-800 whitespace-pre-line">
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Voice controls */}
        <div className="flex flex-col items-center gap-3 mt-4">
          {speech.listening && !isProcessingSpeech && (
            <motion.div
              className="h-3 w-3 rounded-full bg-purple-600"
              style={{ scale: smoothScale }}
            />
          )}

          <Button
            onClick={handleListenClick}
            disabled={isProcessingSpeech}
            variant={speech.listening ? "destructive" : "default"}
            className="gap-2"
          >
            <Mic className="w-4 h-4" />
            {isProcessingSpeech
              ? "Procesando..."
              : speech.listening
                ? "Detener micrófono"
                : "Hablar con el asistente"}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            {isProcessingSpeech
              ? "Procesando tu pregunta..."
              : speech.listening
                ? "Escuchando... di algo como '¿Cómo registrar una transacción?'"
                : "Presiona el botón y pregunta en voz alta"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useRef } from "react";
import { Mic } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import { continueFinancialChat } from "@/utils/gemini";
import useSpeechFlow from "@/utils/speechFlow";
import { getSpeechServices } from "@/utils/speechServices";

/**
 * AI-powered financial assistant chat component with voice interaction capabilities.
 * @component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls visibility of the dialog (required)
 * @param {Function} props.onClose - Callback when dialog is closed (required)
 * @param {Object} [props.initialContext] - Optional initial context containing financial data
 * @param {Array} [props.initialContext.transacciones] - Transaction history
 * @param {number} [props.initialContext.metaAhorro] - Savings goal amount
 * @param {Object} [props.initialContext.presupuesto] - Budget information
 *
 * @remarks
 * Uses speech-to-text and text-to-speech services for voice interactions.
 * Implements real-time microphone volume visualization with framer-motion animations.
 * Manages chat state and integrates with financial AI service (Gemini).
 * Automatically starts/stops listening when dialog opens/closes.
 * Shows visual feedback during speech processing and microphone activity.
 * Handles browser compatibility checks for speech APIs.
 *
 * @returns {JSX.Element} A modal dialog with:
 * - Chat message history display
 * - Voice interaction controls
 * - Real-time microphone visualization
 * - Processing state indicators
 *
 * @example
 * <AiChat
 *   isOpen={isChatOpen}
 *   onClose={() => setChatOpen(false)}
 *   initialContext={{
 *     transacciones: recentTransactions,
 *     metaAhorro: 5000,
 *     presupuesto: monthlyBudget
 *   }}
 * />
 */
export default function AiChat({ isOpen, onClose, initialContext }) {
  const [chatLog, setChatLog] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const isProcessingRef = useRef(false);
  const { stt, tts } = getSpeechServices();
  /**
   * Handles text detection from speech input and manages the conversation flow.
   * @param {string} userText - The recognized text from user's speech input
   * @returns {Promise<void>} Resolves when the conversation turn is complete
   * @throws {Error} When there's an error processing the message
   *
   * @example
   * await handleTextDetected("Quiero ahorrar más dinero");
   */
  const handleTextDetected = async (userText) => {
    const userMessage = userText;
    const newChatLog = [...chatLog, { sender: "user", text: userMessage }];
    setChatLog(newChatLog);

    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsProcessingSpeech(true);
      try {
        const response = await continueFinancialChat(
          newChatLog,
          initialContext.transacciones,
          initialContext.metaAhorro,
          initialContext.presupuesto,
        );

        setChatLog((prev) => [...prev, { sender: "model", text: response }]);
        speech.speak(response);
      } catch (error) {
        speech.speak("Error al procesar el mensaje. Intenta de nuevo.");
        setChatLog((prev) => [
          ...prev,
          {
            sender: "model",
            text: "❌ Error al procesar el mensaje. Intenta de nuevo.",
          },
        ]);
      } finally {
        isProcessingRef.current = false;
        setIsProcessingSpeech(false);
        speech.reset();
      }
    }
  };

  const speech = useSpeechFlow({
    onTextDetected: handleTextDetected,
    stt,
    tts,
  });

  /**
   * Controls the microphone listening state based on dialog open/close
   * @param {boolean} isOpen - Current open state of the dialog
   * @returns {void}
   *
   * @example
   * useEffect(() => {
   *   // Automatic listening control
   * }, [isOpen]);
   */

  useEffect(() => {
    if (isOpen) {
      speech.listen();
      setIsListening(true);
    } else {
      speech.stop();
      setIsListening(false);
    }
  }, [isOpen]);

  /**
   * Handles microphone button click to toggle listening state
   * @returns {Promise<void>} Resolves when the state change is complete
   * @throws {Error} When there's an error changing microphone state
   *
   * @example
   * <button onClick={handleListenClick}>Toggle Mic</button>
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

  if (speech.shouldAlert) {
    alert("Lo siento, tu navegador no soporta Speech Recognition.");
  }

  const volume = useMicVolume();

  const rawOpacity = useMotionValue(0.4);
  const rawScale = useMotionValue(1);

  const smoothOpacity = useSpring(rawOpacity, { stiffness: 100, damping: 20 });
  const smoothScale = useSpring(rawScale, { stiffness: 120, damping: 15 });

  /**
   * Updates motion values based on microphone volume input
   * @param {number} volume - Current microphone volume level
   * @returns {void}
   *
   * @example
   * useEffect(() => {
   *   // Update motion values
   * }, [volume]);
   */
  useEffect(() => {
    const normalized = Math.min(volume / 20, 1);
    rawScale.set(1 + normalized * 1.5);
    rawOpacity.set(0.4 + normalized * 0.4);
  }, [volume, rawOpacity, rawScale]);

  return (
    <>
      {isOpen && speech.listening && !isProcessingSpeech && (
        <motion.div
          className="fixed inset-0 z-40"
          style={{
            backgroundColor: "rgb(103, 58, 183)",
            opacity: smoothOpacity,
          }}
        />
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="z-50 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-xl min-h-100 min-w-200">
          <DialogHeader className="w-full flex justify-between items-center">
            <DialogTitle className="text-lg font-bold text-purple-700">
              Asistente Financiero
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 m-4 bg-gray-100 border-2 border-dashed border-purple-500 rounded-lg shadow-lg">
            <div className="w-full max-h-40 overflow-y-auto border p-2 rounded bg-white">
              {chatLog.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-1 px-2 py-1 rounded ${
                    msg.sender === "user"
                      ? "text-right bg-purple-300"
                      : "text-left bg-gray-200"
                  }`}
                >
                  <strong>{msg.sender === "user" ? "Tú:" : "IA:"}</strong>{" "}
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
          {speech.listening && !isProcessingSpeech && (
            <motion.div
              className="my-2 h-4 w-4 rounded-full bg-purple-700"
              style={{
                scale: smoothScale,
              }}
            />
          )}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleListenClick}
              disabled={isProcessingSpeech}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <Mic className="w-5 h-5" />
              {isProcessingSpeech
                ? "Procesando"
                : speech.listening
                  ? "Detener"
                  : "Hablar"}
            </button>
            <p className="text-sm text-gray-700 text-center">
              {isProcessingSpeech
                ? "Procesando tu voz..."
                : speech.listening
                  ? "Estoy escuchando..."
                  : "Presiona para hablar"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

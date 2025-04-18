"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getSpeechServices } from "@/utils/speechServices";
import { interpretTransactions } from "@/utils/gemini-transaction-interpreter";
import { isValidTransactionArray } from "@/components/schemas/transaccion";
import useSpeechFlow from "@/utils/speechFlow";
import { Loader, Mic, MicOff } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FormCarrousel from "./form/form-carrousel";
import { toast } from "sonner";

const markdownInstructions = `
Cuéntale a la IA tus **ingresos** y **gastos** para que los registre como transacciones.

Incluye detalles como:

- 📅 **Fecha**: Puedes decir "hoy", "ayer", "el lunes", etc.
- 💰 **Monto**: Indica cuánto gastaste o recibiste.
- 📝 **Descripción opcional**: como "almuerzo", "transporte", "sueldo", etc.

**Ejemplo:**

*"Ayer gasté 12 mil en almuerzo y hoy me pagaron 100 mil del trabajo"*
`;

/**
 * AIVoiceTransactionCreator component that enables users to create transactions via voice input.
 * The component listens to user speech, processes it with the Gemini utility, and interprets the detected transactions.
 * It displays the results and allows users to interact with the system through a button to start/stop voice recording.
 *
 * @component
 * @example
 * return (
 *   <AIVoiceTransactionCreator />
 * )
 *
 * @returns {JSX.Element} - The AIVoiceTransactionCreator component.
 */
export default function AIVoiceTransactionCreator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transacciones, setTransacciones] = useState([]);

  const { stt, tts } = getSpeechServices();

  /**
   * Handles the detected text from speech input, processes it for transaction interpretation,
   * and validates the parsed transactions.
   *
   * @param {string} texto - The detected speech input text.
   */
  const handleTextDetected = async (texto) => {
    console.clear();
    setIsProcessing(true);

    try {
      const parsed = JSON.parse(await interpretTransactions(texto));
      const transactions = parsed.transactions;

      if (transactions === undefined || transactions === null)
        throw new Error("El LLM no ha podido interpretar las transacciones");

      if (transactions.length === 0) {
        toast.error("❌ No se han encontrado transacciones en el texto.");
        return;
      }

      const { valid, errors } = isValidTransactionArray(transactions);

      if (!valid) {
        toast.error(
          `❌ No se han podido interpretar las transacciones, intente nuevamente. ${errors
            .map((e) => e.message)
            .join(", ")}`,
        );
        return;
      }

      setTransacciones(transactions);
    } catch (err) {
      console.error("❌ Error al interpretar transacción:", err);
      toast.error("❌ Error al interpretar transacción: " + err.message);
    } finally {
      setIsProcessing(false);
      speech.reset();
    }
  };

  /**
   * Speech flow handler that listens to speech input and calls the handleTextDetected function when text is detected.
   */
  const speech = useSpeechFlow({
    onTextDetected: handleTextDetected,
    stt,
    tts,
  });

  /**
   * Toggles the recording state, starting or stopping the speech recognition.
   */
  const handleToggleRecording = () => {
    if (speech.speaking) speech.stop();
    if (speech.listening) {
      speech.stop();
    } else {
      speech.listen();
    }
  };

  const volume = useMicVolume();
  const rawScale = useMotionValue(1);
  const smoothScale = useSpring(rawScale, { stiffness: 120, damping: 15 });

  /**
   * Adjusts the scale animation based on the microphone volume.
   */
  useEffect(() => {
    const normalized = Math.min(volume / 20, 1);
    rawScale.set(1 + normalized * 1.5);
  }, [volume, rawScale]);

  /**
   * The component renders a button to start/stop voice recording, a display for messages, and transaction instructions in Markdown format.
   * The UI updates based on the speech recognition state and provides feedback to the user.
   */
  return (
    <>
      {transacciones?.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          {speech.listening && !isProcessing && (
            <motion.div
              className="h-4 w-4 rounded-full bg-purple-600"
              style={{ scale: smoothScale }}
            />
          )}
          <div className="flex flex-col text-sm text-muted-foreground gap-2 p-2">
            <p className="flex-1 text-center">
              <span className="font-bold">🎤 Instrucciones:</span> Presiona el
              botón para hablar con la IA
            </p>
            <Markdown remarkPlugins={[remarkGfm]}>
              {markdownInstructions}
            </Markdown>
          </div>

          <Button
          size="icon"
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className={`rounded-lg flex items-center text-white ${
              speech.listening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
          >
            {speech.listening ? (
              <>
                <MicOff className="w-4 h-4" />
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
              </>
            )}
          </Button>
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="animate-spin h-4 w-4" />
              Procesando transacciones...
            </div>
          )}
        </div>
      ) : (
        <FormCarrousel transactions={transacciones} />
      )}
    </>
  );
}

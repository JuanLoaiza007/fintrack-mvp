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
import { addTransaction } from "@/db/db";
import { useTransactionContext } from "@/context/TransactionContext";

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
 * A React component that enables users to create transactions using voice commands interpreted by AI.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.setIsCreateOpen - A function to toggle the visibility of the transaction creator modal. Required.
 * @remarks This component uses multiple hooks, including `useState`, `useEffect`, and custom hooks like `useSpeechFlow` and `useMicVolume`.
 * It also integrates with external services for speech-to-text (STT) and text-to-speech (TTS) functionalities.
 * @returns {JSX.Element} A UI for voice-based transaction creation, including instructions, a recording button, and a transaction form carousel.
 * @example
 * <AIVoiceTransactionCreator setIsCreateOpen={setIsCreateOpen} />
 */
export default function AIVoiceTransactionCreator({ setIsCreateOpen }) {
  const { notifyTransactionUpdate } = useTransactionContext();

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
    setIsProcessing(true);

    try {
      const parsed = JSON.parse(await interpretTransactions(texto));
      const transactions = parsed.transactions;

      if (transactions === undefined || transactions === null)
        throw new Error("El LLM no ha podido interpretar las transacciones");

      if (transactions.length === 0) {
        toast.error("No se han encontrado transacciones en el texto.");
        return;
      }

      const { valid, errors } = isValidTransactionArray(transactions);

      if (!valid) {
        toast.error(
          `No se han podido interpretar las transacciones, intente nuevamente. ${errors
            .map((e) => e.message)
            .join(", ")}`,
        );
        return;
      }

      setTransacciones(transactions);
    } catch (err) {
      console.error("Error al interpretar transacción:", err);
      toast.error("Error al interpretar transacción: " + err.message);
    } finally {
      setIsProcessing(false);
      speech.reset();
    }
  };

  /**
   * Saves all transactions to the database, handling errors for individual transactions
   * and notifying the user of the overall result.
   *
   * @async
   * @function
   * @throws {Error} If there is a general error while saving all transactions.
   * @returns {Promise<void>} Resolves when all transactions are saved or errors are handled.
   * @example
   * await handleSaveAll(); // Saves all transactions in the current state.
   */
  const handleSaveAll = async () => {
    try {
      const promises = [];

      transacciones.forEach((transaction) => {
        const payload = { ...transaction };
        if (payload.type === "income") delete payload.essential;

        const promise = addTransaction(payload).catch((err) => {
          console.error("Error al guardar transacción:", err);
          toast.error(`Error al guardar transacción`);
        });

        promises.push(promise);
      });

      await Promise.all(promises);

      toast.success(
        "✅ Todas las transacciones fueron guardadas exitosamente.",
      );
    } catch (err) {
      toast.error("Error general al guardar todas las transacciones");
      console.error(
        `Error general al guardar todas las transacciones: ${err.message}`,
      );
      setTransacciones([]);
    } finally {
      notifyTransactionUpdate();
      setIsCreateOpen(false);
    }
  };

  /**
   * Deletes a transaction from the local state by its index.
   *
   * @param {number} index - The index of the transaction to delete. Required.
   * @returns {void} This function does not return a value.
   * @example
   * handleDelete(0); // Deletes the first transaction in the list.
   */
  const handleDelete = (index) => {
    const updated = [...transacciones];
    updated.splice(index, 1);
    setTransacciones(updated);
  };

  /**
   * Updates a specific transaction in the local state with new data.
   *
   * @param {number} index - The index of the transaction to update. Required.
   * @param {Object} updatedData - The updated transaction data. Required.
   * @returns {void} This function does not return a value.
   * @example
   * handleUpdate(0, { id: 1, name: "Updated Transaction", amount: 150 });
   */
  const handleUpdate = (index, updatedData) => {
    const updated = [...transacciones];
    updated[index] = updatedData;
    setTransacciones(updated);
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
        <FormCarrousel
          transactions={transacciones}
          onSave={handleSaveAll}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getSpeechServices } from "@/utils/speechServices";
import { interpretTransactions } from "@/utils/gemini-transaction-interpreter";
import { isValidTransactionArray } from "@/components/schemas/transaccion";
import useSpeechFlow from "@/utils/speechFlow";
import { Mic, MicOff } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownInstructions = `
Cuéntale a la IA tus **ingresos** y **gastos** para que los registre como transacciones.

Incluye detalles como:

- 📅 **Fecha**: Puedes decir "hoy", "ayer", "el lunes", etc.
- 💰 **Monto**: Indica cuánto gastaste o recibiste.
- 📝 **Descripción opcional**: como "almuerzo", "transporte", "sueldo", etc.

**Ejemplo:**

*"Ayer gasté 12 mil en almuerzo y hoy me pagaron 100 mil del trabajo"*
`;

export default function AIVoiceTransactionCreator() {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transacciones, setTransacciones] = useState([]);

  const { stt, tts } = getSpeechServices();

  const appendMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleTextDetected = async (texto) => {
    console.clear();
    console.log("📥 Texto detectado:", texto);
    appendMessage(`✅ Interpretando: "${texto}"`);
    setIsProcessing(true);

    try {
      const parsed = JSON.parse(await interpretTransactions(texto));
      const transactions = parsed.transactions;
      console.log("transactions: ", transactions);

      if (transactions === undefined || transactions === null)
        throw new Error("El LLM no ha podido interpretar las transacciones");

      if (transactions.length === 0) {
        appendMessage("❌ No se han detectado transacciones en el texto");
        return;
      }

      const { valid, errors } = isValidTransactionArray(transactions);

      if (!valid) {
        console.log("❌ Errores de validación:", errors);
      }

      if (valid) {
        setTransacciones(parsed);
        appendMessage("✅ Es posible crear las transacciones");
      } else {
        appendMessage(
          "❌ No se ha podido interpretar las transacciones, intente nuevamente."
        );
      }
    } catch (err) {
      console.error("❌ Error al interpretar transacción:", err);
      appendMessage(
        "❌ Hubo un error interno al interpretar, por favor intente nuevamente."
      );
    } finally {
      setIsProcessing(false);
      speech.reset();
      console.log("🔁 Finalizó proceso. isProcessing:", false);
    }
  };

  const speech = useSpeechFlow({
    onTextDetected: handleTextDetected,
    stt,
    tts,
  });

  const handleToggleRecording = () => {
    if (speech.speaking) speech.stop();
    if (speech.listening) {
      speech.stop();
      appendMessage("⏹️ Grabación detenida");
    } else {
      speech.listen();
      setMessages(["🎙️ Escuchando..."]);
    }
  };

  const volume = useMicVolume();
  const rawScale = useMotionValue(1);
  const smoothScale = useSpring(rawScale, { stiffness: 120, damping: 15 });

  useEffect(() => {
    const normalized = Math.min(volume / 20, 1);
    rawScale.set(1 + normalized * 1.5);
  }, [volume, rawScale]);

  return (
    <div className="flex flex-col items-center gap-4">
      {speech.listening && !isProcessing && (
        <motion.div
          className="h-4 w-4 rounded-full bg-purple-600"
          style={{ scale: smoothScale }}
        />
      )}
      <div className="flex flex-col text-sm text-muted-foreground gap-2 p-2">
        <p className="flex-1 text-center">
          <span className="font-bold">🎤 Instrucciones:</span> Presiona el botón
          para hablar con la IA
        </p>
        <Markdown remarkPlugins={[remarkGfm]}>{markdownInstructions}</Markdown>
      </div>

      <Button
        onClick={handleToggleRecording}
        disabled={isProcessing}
        className={
          speech.listening
            ? "bg-red-500 hover:bg-red-600"
            : "bg-purple-500 hover:bg-purple-600"
        }
      >
        {speech.listening ? (
          <>
            <MicOff className="w-4 h-4 mr-1" />
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-1" />
          </>
        )}
      </Button>

      {messages && (
        <div className="flex flex-col gap-1 max-w-sm text-sm text-muted-foreground text-center">
          {messages.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
}

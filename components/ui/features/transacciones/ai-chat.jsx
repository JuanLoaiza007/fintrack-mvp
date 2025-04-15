"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import { continueFinancialChat } from "@/utils/gemini";

/**
 * Voice-activated chat dialog component that reacts to microphone volume input with animations.
 *
 * @component
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Controls the visibility of the dialog; required.
 * @param {(open: boolean) => void} props.onClose - Callback triggered when the dialog is closed; required.
 *
 * @remarks
 * This component uses the `useMicVolume` custom hook to read real-time microphone input and applies smooth visual feedback using `framer-motion`.
 * React `useEffect` is used to update the motion values whenever the mic volume changes.
 *
 * @returns {JSX.Element} A modal dialog with animated feedback indicating active microphone input.
 *
 * @example
 * <AiChat
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 * />
 */
export default function AiChat({ isOpen, onClose, initialContext }) {
  const [chatLog, setChatLog] = useState([]); // Estado para el historial de chat
  const [userMessage, setUserMessage] = useState("");

  // Función para enviar mensaje de texto
  async function handleSendTextMessage() {
    // Agregar el mensaje del usuario al historial
    const newChatLog = [...chatLog, { sender: "user", text: userMessage }];
    setChatLog(newChatLog);
    // Llamar a la función continueFinancialChat, pasando el contexto inicial
    try {
      const response = await continueFinancialChat(
        newChatLog,
        initialContext.transacciones,
        initialContext.metaAhorro,
        initialContext.presupuesto
      );
      // Agregar la respuesta de la IA al chat
      setChatLog([...newChatLog, { sender: "model", text: response }]);
    } catch (error) {
      console.error(error);
    }
    setUserMessage("");
  }
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
    <>
      {isOpen && (
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

          {/* Componente de prueba para el log del chat
          {process.env.NEXT_PUBLIC_ENVIRONMENT_IS_DEVELOPMENT && (
            <div className="p-4 m-4 bg-gray-100 border-2 border-dashed border-purple-500 rounded-lg shadow-lg">
              <h1 className="text-xl font-bold text-purple-700 mb-2">
                DEVELOPMENT TOOL
              </h1>
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
              <div className="w-full mb-3">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="w-full p-2 border-1 border-purple-700 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400 "
                />
                <button
                  onClick={handleSendTextMessage}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          )} */}

          <motion.div
            className="my-2 h-4 w-4 rounded-full bg-purple-700"
            style={{
              scale: smoothScale,
            }}
          />
          <div className="flex items-center justify-center gap-2">
            <Mic
              className="w-6 h-6 text-purple-700"
              role="img"
              aria-label="Mic Icon"
            />
            <p className="text-sm text-gray-700 text-center">
              Estoy escuchando...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

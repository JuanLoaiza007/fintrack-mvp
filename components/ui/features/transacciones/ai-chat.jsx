"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMicVolume } from "@/components/hooks/useMicVolume";
import { useEffect } from "react";

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
export default function AiChat({ isOpen, onClose }) {
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

"use client";

import { useState } from "react";
import { CircleHelp, Plus } from "lucide-react";
import { Button } from "../../button";
import AISuggestion from "./ai-suggestion";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TransactionFooter component renders a footer with two buttons:
 * one for opening a help dialog and another for creating a new transaction.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {function} props.onOpenCreate - Callback function to handle opening the create transaction dialog.
 * @param {function} props.onOpenCreateWithAI - Callback function to handle opening the create transaction with AI dialog.
 * @returns {JSX.Element} The rendered footer component.
 */
export default function TransactionFooter({
  onOpenCreate,
  onOpenCreateWithAI,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex w-full items-center justify-between"
      aria-label="Transaction Footer"
    >
      <div aria-label="AI Suggestion">
        <AISuggestion />
      </div>
      <div
        className="relative flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-10"
            >
              <Button
                className="border-purple-600 bg-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 cursor-pointer"
                size="icon"
                onClick={() => onOpenCreateWithAI()}
                aria-label="Extra Plus Action"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="ml-4">
          <Button
            size="icon"
            onClick={() => onOpenCreate(true)}
            aria-label="Create Transaction"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

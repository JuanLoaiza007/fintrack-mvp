/**
 * AI-powered financial suggestion component for analyzing user transactions.
 *
 * @component
 * @remarks
 * This component fetches the user's financial goals and transactions to generate strategic
 * suggestions using an AI model. It uses `useTransactionContext` to access transactions
 * and retrieves goals from IndexedDB. The AI suggestions are displayed in a collapsible UI.
 *
 * @returns {JSX.Element} The rendered component containing a button to trigger suggestions
 * and a UI for displaying the AI-generated recommendations.
 *
 * @example
 * // Usage in a parent component
 * import AISuggestion from "@/components/ui/features/transacciones/ai-suggestion";
 *
 * function Dashboard() {
 *   return <AISuggestion />;
 * }
 */
import { useState, useEffect } from "react";
import { generateFinancialSummary } from "@/utils/gemini";
import { getGoals, getBudget } from "@/db/db";
import { isDateInNowMonth } from "@/lib/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RefreshCcw, X, WandSparkles, Mic, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionContext } from "@/context/TransactionContext";
import AiChat from "./ai-chat";
import { getSpeechServices } from "@/utils/speechServices";

export default function AISuggestion() {
  const { iaTransactions } = useTransactionContext();
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [metaAhorro, setMetaAhorro] = useState(null);
  const [presupuesto, setPresupuesto] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const { tts } = getSpeechServices();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const goals = await getGoals();
        setMetaAhorro(goals);
        const _goals = goals.filter((g) => isDateInNowMonth(g.targetDate));
        setMetaAhorro(_goals[0]?.amount ?? null);
      } catch (error) {
        console.error(
          error?.message ?? "An error occurred while fetching the goals.",
        );
      }
    }

    fetchGoals();

    async function fetchBudget() {
      try {
        const data = await getBudget();
        setPresupuesto(data[0]?.amount ?? null);
      } catch (error) {
        console.error(
          error?.message ?? "An error occurred while fetching the budget",
        );
      }
    }
    fetchBudget();
  }, []);

  /**
   * Generates and displays a financial summary suggestion based on available transactions.
   *
   * @throws {Error} Throws an error if required transaction data is missing.
   * @returns {Promise<void>} Resolves when the suggestion has been generated and displayed.
   *
   * @example
   * // Assuming iaTransactions, metaAhorro, and presupuesto are already defined:
   * await getIASuggestion();
   */
  async function getIASuggestion() {
    if (!iaTransactions || iaTransactions.length === 0) {
      alert("No hay transacciones para analizar.");
      return;
    }
    setLoading(true);
    setSuggestion("");
    const response = await generateFinancialSummary(
      iaTransactions,
      metaAhorro,
      presupuesto,
    );
    setSuggestion(response);
    tts.speak(response, undefined, () => {
      setPlaying(false);
    });
    setPlaying(true);
    setLoading(false);
    setShowSuggestion(true);
  }

  /**
   * Handles the text-to-speech (TTS) playback of a suggestion or a default message if no suggestion is available.
   *
   * @returns {Promise<void>} Resolves when the TTS action has been triggered or canceled.
   *
   * @example
   * // Toggles TTS playback depending on the current state:
   * await handleTTS();
   */
  async function handleTTS() {
    if (playing) {
      tts.cancel();
      setPlaying(false);
    } else {
      if (suggestion == "") {
        tts.speak(
          "Presiona generar para obtener una sugerencia",
          undefined,
          () => {
            setPlaying(false);
          },
        );
      } else {
        tts.speak(suggestion, undefined, () => {
          setPlaying(false);
        });
      }
      setPlaying(true);
    }
  }

  return (
    <div className="relative w-80">
      {!showSuggestion && (
        <Button
          variant="default"
          onClick={() => setShowSuggestion(true)}
          className="p-4 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
          aria-label="Open IA Suggestion"
        >
          <WandSparkles size={24} />
        </Button>
      )}
      {showSuggestion && (
        <div className="absolute bottom-0 left-0 max-h-80 min-w-100 max-w-140 bg-white shadow p-4 rounded-xl border border-purple-600 flex flex-col gap-3 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center shadow">
                🤖
              </div>
              <span className="font-medium text-purple-600">Sugerencia IA</span>
            </div>
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setShowSuggestion(false)}
              aria-label="Close IA Suggestion"
            >
              <X size={18} />
            </Button>
          </div>
          <div className="bg-gray-200 p-3 rounded-lg text-gray-800 text-sm flex-1 overflow-y-auto">
            {loading ? (
              <p className="animate-pulse">Obteniendo sugerencias...</p>
            ) : suggestion ? (
              <Markdown remarkPlugins={[remarkGfm]}>{suggestion}</Markdown>
            ) : (
              <p className="italic">
                Presiona &quot;Generar&quot; para obtener una sugerencia
              </p>
            )}
          </div>
          <div className="flex justify-between items-center">
            <Button
              variant="default"
              onClick={handleTTS}
              className="py-2 px-4 rounded-lg flex items-center gap-2 justify-center bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              aria-label="Start Stop TTS"
            >
              {playing ? <Square size={16} /> : <Play size={16} />}
            </Button>
            <Button
              variant="default"
              onClick={getIASuggestion}
              disabled={loading}
              className="py-2 px-4 rounded-lg flex items-center gap-2 justify-center bg-purple-600 hover:bg-purple-700 text-white cursor-pointer w-[75%]"
              aria-label="Generate IA Suggestion"
            >
              <RefreshCcw size={16} />
              {loading ? "Generando..." : "Generar sugerencia"}
            </Button>
            <Button
              variant="default"
              onClick={() => setShowChat(true)}
              className="py-2 px-4 rounded-lg flex items-center gap-2 justify-center bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              aria-label="Chat voice with IA"
            >
              <Mic size={16} />
            </Button>
          </div>
          <AiChat
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            initialContext={{
              transacciones: iaTransactions,
              metaAhorro,
              presupuesto,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * A React component for selecting a voice and playing a sample text using Eleven Labs TTS.
 *
 * @component
 * @remarks
 * This component uses `useState` to manage the selected voice and playback state, and `useEffect` to persist the selected voice in localStorage.
 * It also integrates with the Eleven Labs TTS utility for text-to-speech functionality.
 *
 * @returns {JSX.Element} A UI for selecting a voice and playing a sample text.
 *
 * @example
 * <VoiceSelector />
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { elevenLabsTTS } from "../../../../utils/elevenlabsTTS.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const voices = [
  { name: "George", id: "JBFqnCBsd6RMkjVDRZzb" },
  { name: "Rachel", id: "21m00Tcm4TlvDq8ikWAM" },
  { name: "Drew", id: "29vD33N1CtxCmqQRPOHJ" },
  { name: "Clyde", id: "2EiwWnXFnvU5JabPnv8n" },
  { name: "Aria", id: "9BWtsMINqrJLrRacOk9x" },
  { name: "Emily", id: "LcfcDJNUP1GQjkzn1xUU" },
];

export default function VoiceSelector() {
  const [selectedVoice, setSelectedVoice] = useState("JBFqnCBsd6RMkjVDRZzb");
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (!selectedVoice || isPlaying) return;

    try {
      setIsPlaying(true);
      // Cancela cualquier audio que esté sonando antes de empezar
      elevenLabsTTS.cancel();
      await elevenLabsTTS.speak(
        "Hola, esta es una prueba de voz",
        selectedVoice,
      );
    } catch (error) {
      console.error("Error reproduciendo voz:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedVoiceId");
    if (saved) setSelectedVoice(saved);
  }, []);

  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem("selectedVoiceId", selectedVoice);
    }
  }, [selectedVoice]);

  return (
    <div className="flex items-center gap-6">
      <Select onValueChange={setSelectedVoice} value={selectedVoice}>
        <SelectTrigger className="w-[250px] h-12 text-lg border-black border-2">
          <SelectValue placeholder="Selecciona una voz" />
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem key={voice.id} value={voice.id} className="text-base">
              {voice.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        Role="button"
        variant="ghost"
        size="icon"
        disabled={!selectedVoice || isPlaying}
        onClick={handlePlay}
        className="w-12 h-12"
      >
        <Play className="w-6 h-6" />
      </Button>
    </div>
  );
}

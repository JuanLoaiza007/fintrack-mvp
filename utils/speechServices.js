import { useElevenLabsSTT } from "@/utils/elevenlabsSTT";
import { elevenLabsTTS } from "@/utils/elevenlabsTTS";

const defaultSTT = useElevenLabsSTT;
const defaultTTS = elevenLabsTTS;

/**
 * Factory function that provides configured speech services (STT and TTS) for voice interactions.
 * Returns the default implementations of speech-to-text and text-to-speech services.
 *
 * @returns {Object} An object containing:
 * - `stt` {Function}: The speech-to-text service hook (ElevenLabs implementation).
 * - `tts` {Object}: The text-to-speech service instance (ElevenLabs implementation).
 *
 * @example
 * // Usage example:
 * const { stt, tts } = getSpeechServices();
 * const { transcript, listening, start } = stt();
 * tts.speak('Hello world');
 */
export const getSpeechServices = () => {
  return {
    stt: defaultSTT,
    tts: defaultTTS,
  };
};

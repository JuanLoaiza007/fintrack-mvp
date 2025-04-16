import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing speech flow between STT (Speech-to-Text) and TTS (Text-to-Speech) services.
 * Handles the complete voice interaction cycle including listening, processing, and speaking.
 *
 * @param {Object} config - Configuration object for the speech flow.
 * @param {Function} config.onTextDetected - Callback invoked when valid speech text is detected.
 * @param {Object} config.stt - Speech-to-Text service object with required methods.
 * @param {Object} config.tts - Text-to-Speech service object with required methods.
 *
 * @returns {Object} An object containing:
 * - `shouldAlert` {boolean}: Indicates if the browser doesn't support speech recognition.
 * - `shouldProcess` {boolean}: Flag indicating if speech processing should occur.
 * - `transcript` {string}: The current transcribed text from STT.
 * - `listening` {boolean}: Indicates if the system is currently listening.
 * - `listen` {Function}: Starts the listening process.
 * - `stop` {Function}: Stops the listening process.
 * - `reset` {Function}: Resets the speech flow state.
 * - `speak` {Function}: Converts text to speech using TTS.
 */
export default function useSpeechFlow({ onTextDetected, stt, tts }) {
  const [shouldProcess, setShouldProcess] = useState(false);
  const [shouldAlert, setShouldAlert] = useState(false);
  const hasProcessedRef = useRef(false);

  const {
    transcript,
    listening,
    resetTranscript,
    supportsSpeechRecognition,
    start,
    stop,
  } = stt();

  useEffect(() => {
    if (!supportsSpeechRecognition) {
      setShouldAlert(true);
    }
  }, [supportsSpeechRecognition]);

  useEffect(() => {
    if (!transcript.trim()) return;

    if (!listening && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      const userText = transcript.trim();
      onTextDetected(userText);
      setShouldProcess(true);
    }
  }, [listening, transcript]);

  const listen = () => {
    tts.cancel();
    hasProcessedRef.current = false;
    resetTranscript();
    start();
  };

  const stopListening = () => {
    stop();
  };

  const reset = () => {
    setShouldProcess(false);
    resetTranscript();
  };

  const speak = (text) => {
    tts.speak(text);
  };

  return {
    shouldAlert,
    shouldProcess,
    transcript,
    listening,
    listen,
    stop: stopListening,
    reset,
    speak,
  };
}

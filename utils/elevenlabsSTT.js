import React, { useState, useRef } from "react";
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
});

/**
 * Custom hook for speech-to-text functionality using ElevenLabs API.
 * Provides methods to start and stop audio recording, detect silence, and process audio into text.
 *
 * @returns {Object} An object containing:
 * - `transcript` {string}: The transcribed text from the audio.
 * - `listening` {boolean}: Indicates whether the recording is currently active.
 * - `supportsSpeechRecognition` {boolean}: Indicates if the browser supports MediaRecorder.
 * - `start` {Function}: Starts the audio recording and transcription process.
 * - `stop` {Function}: Stops the audio recording and transcription process.
 * - `resetTranscript` {Function}: Resets the transcript to an empty string.
 */
export const useElevenLabsSTT = () => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const supportsSpeechRecognition =
    typeof window !== "undefined" && !!window.MediaRecorder;

  const start = async () => {
    if (!supportsSpeechRecognition) return;

    setTranscript("");
    audioChunksRef.current = [];
    setListening(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      try {
        const result = await client.speechToText.convert({
          file: audioBlob,
          model_id: "scribe_v1",
          tag_audio_events: false,
          language_code: "spa",
          diarize: false,
        });

        setTranscript(result.text || "");
      } catch (err) {
        console.error("STT error:", err);
        setTranscript("");
        alert("Parece que hubo un error, intentalo de nuevo.");
      }
      setListening(false);
      cleanup();
    };

    mediaRecorder.start();

    // Setup audio context for silence detection
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);

    detectSilence(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    });
  };

  const detectSilence = (onSilence, timeout = 2000, threshold = 0.01) => {
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.fftSize);
    let silenceStart = Date.now();

    const loop = () => {
      analyser.getByteTimeDomainData(data);
      const rms = Math.sqrt(
        data.reduce((sum, val) => sum + (val - 128) ** 2, 0) / data.length,
      );

      if (rms < threshold) {
        if (Date.now() - silenceStart > timeout) {
          onSilence();
          return;
        }
      } else {
        silenceStart = Date.now();
      }

      silenceTimerRef.current = requestAnimationFrame(loop);
    };

    loop();
  };

  const stop = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
  };

  const resetTranscript = () => setTranscript("");

  const cleanup = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (silenceTimerRef.current) {
      cancelAnimationFrame(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  return {
    transcript,
    listening,
    supportsSpeechRecognition,
    start,
    stop,
    resetTranscript,
  };
};

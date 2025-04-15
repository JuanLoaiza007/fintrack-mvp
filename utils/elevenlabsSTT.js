import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
});

/**
 * Graba audio desde el micrófono, detecta silencio y transcribe con ElevenLabs
 * @param {Function} onSuccess - callback con el texto reconocido
 * @param {Function} onError - callback con un mensaje de error
 */
export const transcribeFromMic = async (onSuccess, onError) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      try {
        const result = await client.speechToText.convert({
          file: audioBlob,
          model_id: "scribe_v1",
          tag_audio_events: false,
          language_code: "spa",
          diarize: false,
        });

        if (result.text && result.text.trim()) {
          onSuccess(result.text);
        } else {
          onError("No se entendió lo que dijiste 😅");
        }
      } catch (err) {
        console.error("Error al transcribir:", err);
        onError("Hubo un problema al transcribir el audio.");
      }

      audioContext.close();
    };

    // Inicia grabación
    mediaRecorder.start();

    // Detectar silencio
    const detectSilence = (timeout = 2000, threshold = 0.01) => {
      const data = new Uint8Array(analyser.fftSize);
      let silenceStart = Date.now();

      const loop = () => {
        analyser.getByteTimeDomainData(data);
        const rms = Math.sqrt(
          data.reduce((sum, val) => sum + (val - 128) ** 2, 0) / data.length
        );

        if (rms < threshold) {
          if (Date.now() - silenceStart > timeout) {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
            }
            return;
          }
        } else {
          silenceStart = Date.now();
        }

        requestAnimationFrame(loop);
      };

      loop();
    };

    detectSilence();
  } catch (error) {
    console.error("Error al acceder al micrófono:", error);
    onError("No pudimos acceder al micrófono 😵. ¿Tienes los permisos activados?");
  }
};
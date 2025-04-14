import { useEffect, useState, useRef } from "react";

/**
 * Custom React hook that captures and returns the average microphone volume in real time.
 *
 * @returns {number} The current average volume level from the user's microphone (range: 0–255).
 *
 * @throws {DOMException} If access to the microphone is denied or an error occurs during audio setup.
 *
 * @example
 * import { useMicVolume } from './hooks/useMicVolume';
 *
 * function MicVisualizer() {
 *   const volume = useMicVolume();
 *
 *   return (
 *     <div>
 *       <p>Mic Volume: {Math.round(volume)}</p>
 *       <div style={{ width: volume, height: 10, backgroundColor: 'green' }} />
 *     </div>
 *   );
 * }
 */
export function useMicVolume() {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const setupAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
        setVolume(avg);
        requestAnimationFrame(updateVolume);
      };

      updateVolume();
    };

    setupAudio();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  return volume;
}

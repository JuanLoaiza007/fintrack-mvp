import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
});

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

let currentAudio = null;

/**
 * Decodes a Base64 encoded audio string into a Uint8Array.
 *
 * @param {string} base64 - The Base64 encoded audio string (required).
 * @returns {Uint8Array} The decoded byte array representing the audio.
 * @example
 * const byteArray = decodeBase64Audio('U29tZUJhc2U2NEVuY29kZWRTdHJpbmc=');
 */
const decodeBase64Audio = (base64) => {
  const binaryString = atob(base64);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  return byteArray;
};

/**
 * Truncates text to a maximum number of characters.
 *
 * @param {string} text - The original text.
 * @param {number} maxLength - The maximum number of characters.
 * @returns {string} The truncated text not exceeding maxLength.
 */
const limitTextLength = (text, maxLength = 200) => {
  return text.length <= maxLength ? text : text.slice(0, maxLength);
};

/**
 * Generates an audio Blob from the given text using the ElevenLabs API.
 *
 * @param {string} text - The text to convert to audio (required).
 * @returns {Promise<Blob>} A promise that resolves with the audio Blob in mp3 format.
 * @throws {Error} If the audio generation process fails.
 * @example
 * const audioBlob = await generateAudioFromText('Hello, world!');
 */
export const generateAudioFromText = async (text, voiceId) => {
  const response = await client.textToSpeech.streamWithTimestamps(voiceId, {
    output_format: "mp3_44100_128",
    text,
    model_id: "eleven_multilingual_v2",
  });

  const audioChunks = [];
  for await (const item of response) {
    if (item.audio_base64) {
      audioChunks.push(decodeBase64Audio(item.audio_base64));
    }
  }

  return new Blob(audioChunks, { type: "audio/mp3" });
};

/**
 * Creates a temporary URL for the provided audio Blob.
 *
 * @param {Blob} blob - The audio Blob for which to create the URL (required).
 * @returns {string} A URL representing the audio Blob.
 * @example
 * const audioURL = createAudioURL(audioBlob);
 */
export const createAudioURL = (blob) => {
  return URL.createObjectURL(blob);
};

/**
 * Initiates a download of an audio file from the given URL.
 *
 * @param {string} url - The URL of the audio file to download (required).
 * @param {string} [filename="tts-audio.mp3"] - The filename to use for the downloaded file (optional).
 * @returns {void}
 * @example
 * downloadAudio('blob:http://example.com/12345', 'my-audio.mp3');
 */
export const downloadAudio = (url, filename = "tts-audio.mp3") => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Provides text-to-speech functionality using the ElevenLabs API.
 *
 * @property {function(string): Promise<void>} speak - Converts text to speech and plays the audio.
 * @property {function(): void} cancel - Stops the currently playing audio, if any.
 * @example
 * await elevenLabsTTS.speak('Hello, world!');
 * elevenLabsTTS.cancel();
 */
export const elevenLabsTTS = {
  /**
   * Converts text to speech and plays the resulting audio.
   *
   * @param {string} text - The text to be spoken (required).
   * @param {string} [voiceId=DEFAULT_VOICE_ID] - The voice ID to use for text-to-speech (optional).
   * @param {Function} [onEndCallback=() => {}] - A callback function to be executed when the audio playback ends (optional).
   * @returns {Promise<void>} A promise that resolves when the audio playback starts.
   * @throws {Error} If the text-to-speech conversion fails.
   * @example
   * await elevenLabsTTS.speak('This is an example.');
   *
   * @example
   * await elevenLabsTTS.speak('Playback finished callback.', undefined, () => {
   *   console.log('Audio has finished playing.');
   * });
   */
  speak: async (text, voiceId = DEFAULT_VOICE_ID, onEndCallback = () => {}) => {
    // Retrieve selected voice or default
    voiceId = localStorage.getItem("selectedVoiceId") || DEFAULT_VOICE_ID;

    // Truncate incoming text to first 200 characters automatically
    const safeText = limitTextLength(text, 200);

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // Generate and play new audio
    const blob = await generateAudioFromText(safeText, voiceId);
    const audio = new Audio(createAudioURL(blob));
    currentAudio = audio;
    audio.onended = () => onEndCallback();
    await audio.play();
  },

  /**
   * Stops the currently playing audio, if any.
   *
   * @returns {void}
   * @example
   * elevenLabsTTS.cancel();
   */
  cancel: () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  },
};

import VoiceSelector from "@/components/ui/features/configuracion/voiceSelector";

/**
 * ConfigModule Component
 *
 * This component renders the configuration module for the application.
 * It includes a title, a subtitle, and a voice selector for the assistant.
 *
 * @component
 * @returns {JSX.Element} The rendered ConfigModule component.
 * @example
 * // Example usage:
 * <ConfigModule />
 */
export default function ConfigModule() {
  return (
    <>
      <div className="p-4 gap-4 flex flex-col items-center justify-start w-full h-full max-h-screen overflow-y-hidden">
        <div className="p-4 w-full flex justify-center">
          <h1 className="font-bold text-2xl">Configuración</h1>
        </div>
        <div className="p-4 w-full flex justify-center">
          <h2 className="font-semibold text-xl">
            Selector de voz del asistente
          </h2>
        </div>
        <div className="w-full flex justify-center">
          <VoiceSelector />
        </div>
      </div>
    </>
  );
}

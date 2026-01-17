import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../hooks/useAudio";

export default function AudioPlayer() {
  const audio = useAudio("/audio/cs2-menu.mp3");

  return (
    <button
      onClick={audio.toggleMute}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-cs-card border border-cs-border flex items-center justify-center text-cs2-gray hover:text-white hover:border-cs2-orange transition-all duration-200 shadow-lg"
      aria-label={audio.muted ? "Unmute" : "Mute"}
    >
      {audio.muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
    </button>
  );
}

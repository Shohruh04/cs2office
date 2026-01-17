import { useState, useEffect, useRef, useCallback } from "react";
import { Howl, Howler } from "howler";

const STORAGE_KEY = "cs2-audio-muted";

export function useAudio(src: string) {
  const soundRef = useRef<Howl | null>(null);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Initialize Howler
  useEffect(() => {
    // Unlock audio context immediately
    Howler.autoUnlock = true;

    const sound = new Howl({
      src: [src],
      loop: true,
      volume: 0.3,
      autoplay: !muted, // Auto-play on load
      preload: true,
      onload: () => {
        console.log("Audio loaded");
        if (!muted) {
          sound.play();
        }
      },
      onloaderror: (_id: number, error: unknown) => {
        console.error("Audio load error:", error);
      },
      onplayerror: (_id: number, error: unknown) => {
        console.error("Audio play error:", error);
        // Try to play again after unlock
        sound.once("unlock", () => {
          if (!muted) {
            sound.play();
          }
        });
      },
    });

    soundRef.current = sound;

    // Multiple attempts to play
    const tryPlay = () => {
      if (soundRef.current && !muted && !soundRef.current.playing()) {
        soundRef.current.play();
      }
    };

    // Try immediately
    tryPlay();

    // Try after short delays
    setTimeout(tryPlay, 100);
    setTimeout(tryPlay, 500);
    setTimeout(tryPlay, 1000);

    // Play on any user interaction
    const events = ["click", "keydown", "touchstart", "mousemove", "scroll"];
    const playOnInteraction = () => {
      tryPlay();
      events.forEach((e) => document.removeEventListener(e, playOnInteraction));
    };
    events.forEach((e) =>
      document.addEventListener(e, playOnInteraction, { once: true }),
    );

    return () => {
      sound.unload();
      events.forEach((e) => document.removeEventListener(e, playOnInteraction));
    };
  }, [src]);

  // Handle mute state changes
  useEffect(() => {
    if (soundRef.current) {
      if (muted) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {
      // Ignore
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  return {
    muted,
    toggleMute,
  };
}

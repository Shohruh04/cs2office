import { useState, useEffect } from "react";

interface CS2LoaderProps {
  onLoadComplete: () => void;
  minDuration?: number;
}

export default function CS2Loader({
  onLoadComplete,
  minDuration = 3000,
}: CS2LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  const loadingStages = [
    "Initializing...",
    "Loading assets...",
    "Connecting to server...",
    "Preparing dashboard...",
    "Almost ready...",
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      const stageIndex = Math.min(
        Math.floor((newProgress / 100) * loadingStages.length),
        loadingStages.length - 1
      );
      setLoadingText(loadingStages[stageIndex]);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(onLoadComplete, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration, onLoadComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px]" />
      </div>

      {/* CS2 Logo */}
      <div className="relative mb-8">
        <img
          src="/images/cs2-logo.png"
          alt="Counter-Strike 2"
          className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(255,153,0,0.5)] animate-pulse"
        />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">
        COUNTER-STRIKE 2
      </h1>
      <p className="text-orange-500 text-lg mb-8 tracking-widest">
        OFFICE STATS TRACKER
      </p>

      {/* Loading bar container */}
      <div className="w-80 relative">
        {/* Background bar */}
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          {/* Progress bar */}
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text and percentage */}
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-gray-400">{loadingText}</span>
          <span className="text-orange-500 font-mono">
            {Math.floor(progress)}%
          </span>
        </div>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-600 text-xs tracking-wider">
          POWERED BY FIZMASOFT
        </p>
      </div>

      {/* Animated corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-orange-500/30" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-orange-500/30" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-orange-500/30" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-orange-500/30" />
    </div>
  );
}

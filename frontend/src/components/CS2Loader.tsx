import { useState, useEffect } from "react";

interface CS2LoaderProps {
  onLoadComplete: () => void;
  minDuration?: number;
}

export default function CS2Loader({
  onLoadComplete,
  minDuration = 1500,
}: CS2LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(onLoadComplete, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration, onLoadComplete]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Background with diagonal split */}
      <div className="absolute inset-0">
        {/* SVG Background */}
        <img
          src="/images/header_bg.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Content container */}
      <div className="relative h-full flex">
        {/* Left side - CT/T Operators */}
        <div className="flex-1 flex items-end justify-center">
          <img
            src="/images/header_ctt.png"
            alt="CT & T Operators"
            className="max-h-[85vh] object-contain drop-shadow-2xl"
          />
        </div>

        {/* Right side - Logo and text */}
        <div className="flex-1 flex flex-col items-center justify-center pr-8">
          {/* Introducing text */}
          <p className="text-white text-xl tracking-[0.3em] mb-4 font-light">
            INTRODUCING
          </p>

          {/* CS2 Logo */}
          <img
            src="/images/logo_cs2_header.svg"
            alt="Counter-Strike 2"
            className="w-[500px] max-w-full mb-8"
          />

          {/* Subtitle */}
          <p className="text-white/80 text-lg tracking-[0.2em] mb-12">
            FIZMASOFT CS2 STATS TRACKER
          </p>

          {/* Loading bar */}
          <div className="w-80">
            <div className="h-1 bg-black/30 rounded-full overflow-hidden backdrop-blur">
              <div
                className="h-full bg-white transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-white/60 tracking-wider">LOADING...</span>
              <span className="text-white font-mono">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent">
        <div className="h-full flex items-center justify-center">
          <p className="text-white/40 text-xs tracking-[0.3em]">
            POWERED BY FIZMASOFT
          </p>
        </div>
      </div>
    </div>
  );
}

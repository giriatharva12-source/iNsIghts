"use client";

import React, { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

interface RoundTimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onTimeUp?: () => void;
}

export function RoundTimer({ initialSeconds, isRunning, onTimeUp }: RoundTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (seconds <= 0) {
      sound.buzzer();
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev - 1;
        if (next <= 5 && next > 0) {
          sound.tick();
        }
        if (next === 0) {
          sound.buzzer();
          onTimeUp?.();
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, onTimeUp]);

  // Color dynamic logic
  const isUrgent = seconds <= 5;
  const isWarning = seconds <= 10 && !isUrgent;

  const percentage = Math.max(0, Math.min(100, (seconds / (initialSeconds || 30)) * 100));

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-11 h-11 flex items-center justify-center">
        {/* Circular SVG track */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
          <path
            className="text-white/10"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`transition-all duration-1000 stroke-current ${
              isUrgent
                ? "text-rose-500 animate-pulse"
                : isWarning
                ? "text-electric-orange"
                : "text-electric-violet"
            }`}
            strokeWidth="3.5"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        {/* Numeric time display */}
        <span
          className={`absolute text-sm font-black tracking-tight ${
            isUrgent
              ? "text-rose-400 scale-110 animate-ping-slow font-mono"
              : isWarning
              ? "text-electric-orange font-mono"
              : "text-white font-mono"
          }`}
        >
          {seconds}
        </span>
      </div>
    </div>
  );
}


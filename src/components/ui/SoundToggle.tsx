"use client";

import React, { useState, useEffect } from "react";
import { sound } from "@/lib/sound";
import { Volume2, VolumeX } from "lucide-react";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(sound.enabled);
  }, []);

  const handleToggle = () => {
    const next = sound.toggle();
    setEnabled(next);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2.5 rounded-full bg-surface/80 hover:bg-surface-light border border-surface-border text-white/80 hover:text-white transition-all shadow-md active:scale-95"
      title={enabled ? "Mute sound effects" : "Unmute sound effects"}
      aria-label="Toggle sound"
    >
      {enabled ? <Volume2 className="w-5 h-5 text-electric-violet" /> : <VolumeX className="w-5 h-5 text-white/40" />}
    </button>
  );
}


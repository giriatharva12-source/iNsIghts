"use client";

import React from "react";

interface AvatarBadgeProps {
  avatar: string;
  color?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isHost?: boolean;
  isReady?: boolean;
  roleBadge?: string;
  showName?: boolean;
  isSubject?: boolean;
  isOddOneOut?: boolean;
}

export function AvatarBadge({
  avatar,
  color = "#8b5cf6",
  name,
  size = "md",
  isHost,
  isReady,
  roleBadge,
  showName = true,
  isSubject,
  isOddOneOut,
}: AvatarBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-20 h-20 text-4xl",
  }[size];

  return (
    <div className="flex flex-col items-center gap-1.5 select-none group">
      <div className="relative">
        {/* Glow halo */}
        <div
          className="absolute -inset-1 rounded-2xl opacity-60 blur-sm transition-all group-hover:opacity-100 group-hover:scale-105"
          style={{ backgroundColor: color }}
        />
        {/* Avatar Container */}
        <div
          className={`relative ${sizeClasses} rounded-2xl flex items-center justify-center font-bold shadow-card-shadow border border-white/20 transition-transform active:scale-95`}
          style={{
            background: `linear-gradient(135deg, ${color}dd, #120e24)`,
          }}
        >
          <span>{avatar}</span>

          {/* Host Crown */}
          {isHost && (
            <div
              className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-400 to-electric-orange text-white p-0.5 px-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md"
              title="Room Host"
            >
              👑 HOST
            </div>
          )}

          {/* Target / Subject Marker */}
          {isSubject && (
            <div
              className="absolute -bottom-2 -left-1 bg-gradient-to-r from-electric-pink to-electric-violet text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-glow-pink animate-pulse"
              title="Subject of this round"
            >
              🎯 TARGET
            </div>
          )}

          {/* Odd One Out Secret Marker (Only for debugging or revealed state) */}
          {isOddOneOut && (
            <div
              className="absolute -bottom-2 -right-1 bg-gradient-to-r from-purple-800 to-black text-electric-pink text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-electric-pink/50 shadow-md"
            >
              🕵️ ODD ONE
            </div>
          )}
        </div>

        {/* Ready status dot */}
        {isReady !== undefined && (
          <span
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0c0a14] ${
              isReady ? "bg-emerald-400 shadow-glow" : "bg-white/30"
            }`}
            title={isReady ? "Ready to play" : "Not ready"}
          />
        )}
      </div>

      {showName && name && (
        <span className="text-xs font-semibold text-white/90 truncate max-w-[80px] text-center tracking-wide">
          {name}
        </span>
      )}

      {roleBadge && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
          {roleBadge}
        </span>
      )}
    </div>
  );
}


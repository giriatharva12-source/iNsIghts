"use client";

import React from "react";
import { SoundToggle } from "./SoundToggle";
import { UserProfile } from "@/types/game";
import { ShieldCheck, User, Users, Home } from "lucide-react";
import { sound } from "@/lib/sound";

interface HeaderProps {
  profile: UserProfile;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  roomCode?: string;
}

export function Header({ profile, currentScreen, onNavigate, roomCode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-surface-border bg-background/80 backdrop-blur-xl px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => {
            sound.click();
            onNavigate("home");
          }}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric-purple to-electric-pink flex items-center justify-center font-black text-white text-xl shadow-glow group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-electric-violet via-pink-400 to-electric-orange">
                INSIGHT
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-electric-pink/20 text-electric-pink border border-electric-pink/30 uppercase">
                PARTY
              </span>
            </div>
            {roomCode ? (
              <span className="text-[11px] font-mono font-bold text-electric-cyan">
                ROOM: {roomCode}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-white/50 hidden sm:block">
                How well do friends know you?
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Home Button if not on home */}
          {currentScreen !== "home" && !roomCode && (
            <button
              onClick={() => {
                sound.click();
                onNavigate("home");
              }}
              className="p-2 rounded-full bg-surface/80 hover:bg-surface-light border border-surface-border text-white/80 hover:text-white transition-all shadow-md active:scale-95"
              title="Home"
            >
              <Home className="w-5 h-5 text-white/70" />
            </button>
          )}

          {/* Friends Button */}
          <button
            onClick={() => {
              sound.click();
              onNavigate("friends");
            }}
            className={`p-2 rounded-full border border-surface-border transition-all shadow-md active:scale-95 ${
              currentScreen === "friends"
                ? "bg-electric-purple/30 text-electric-pink border-electric-pink/40"
                : "bg-surface/80 hover:bg-surface-light text-white/80 hover:text-white"
            }`}
            title="Friends"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Admin Button */}
          <button
            onClick={() => {
              sound.click();
              onNavigate("admin");
            }}
            className={`p-2 rounded-full border border-surface-border transition-all shadow-md active:scale-95 ${
              currentScreen === "admin"
                ? "bg-electric-purple/30 text-electric-orange border-electric-orange/40"
                : "bg-surface/80 hover:bg-surface-light text-white/80 hover:text-white"
            }`}
            title="Admin & Question Bank"
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </button>

          {/* Sound Toggle */}
          <SoundToggle />

          {/* User Profile Pill */}
          <button
            onClick={() => {
              sound.click();
              onNavigate("profile");
            }}
            className="flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full bg-surface/80 hover:bg-surface-light border border-surface-border transition-all active:scale-95 group"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {profile.avatar}
            </div>
            <span className="text-xs font-semibold text-white/90 max-w-[70px] truncate group-hover:text-white">
              {profile.nickname}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}


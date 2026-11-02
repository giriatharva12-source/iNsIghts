"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AVATAR_OPTIONS, COLOR_OPTIONS, userStore } from "@/lib/userStore";
import { UserProfile } from "@/types/game";
import { sound } from "@/lib/sound";
import { Sparkles, ArrowRight, UserCheck, Shield } from "lucide-react";

interface SplashOnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function SplashOnboardingScreen({ onComplete }: SplashOnboardingProps) {
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [authMode, setAuthMode] = useState<"guest" | "email">("guest");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("Please choose a nickname to play!");
      return;
    }
    if (nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters.");
      return;
    }

    sound.success();
    const profile = userStore.getProfile();
    profile.nickname = nickname.trim();
    profile.avatar = selectedAvatar;
    profile.avatarColor = selectedColor;
    userStore.saveProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface/85 border border-surface-border shadow-card-shadow backdrop-blur-2xl"
      >
        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-purple via-electric-pink to-electric-orange p-1 shadow-glow mb-3 items-center justify-center text-3xl font-black text-white"
          >
            ⚡
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-electric-violet via-pink-400 to-electric-orange">
            INSIGHT
          </h1>
          <p className="text-white/70 text-sm mt-1 font-medium">
            How well do your friends really know you?
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex p-1 rounded-xl bg-black/40 border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => {
              sound.click();
              setAuthMode("guest");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === "guest"
                ? "bg-electric-purple text-white shadow-glow"
                : "text-white/60 hover:text-white"
            }`}
          >
            Play as Guest
          </button>
          <button
            type="button"
            onClick={() => {
              sound.click();
              setAuthMode("email");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === "email"
                ? "bg-electric-purple text-white shadow-glow"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sign In / Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {authMode === "email" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-electric-violet transition-colors text-sm"
              />
            </div>
          )}

          {/* Nickname input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
              Choose Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError("");
              }}
              maxLength={15}
              placeholder="e.g. Alex, StarLord, Maverick"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-electric-violet transition-colors text-sm font-semibold"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Select Avatar & Color
            </label>
            <div className="flex gap-2 justify-center mb-3">
              {COLOR_OPTIONS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    sound.click();
                    setSelectedColor(c);
                  }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedColor === c ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-black/30 border border-white/5 max-h-36 overflow-y-auto">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    sound.click();
                    setSelectedAvatar(av);
                  }}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? "ring-2 ring-white scale-110 shadow-glow"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  style={selectedAvatar === av ? { backgroundColor: selectedColor } : {}}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-400 text-center animate-shake">
              {error}
            </p>
          )}

          {/* Enter Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-electric-violet via-pink-500 to-electric-orange text-white font-black text-base tracking-wider uppercase shadow-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Let&apos;s Play</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-white/40">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> No signup required
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Free & instant
          </span>
        </div>
      </motion.div>
    </div>
  );
}


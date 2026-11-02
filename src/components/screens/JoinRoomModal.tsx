"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { sound } from "@/lib/sound";
import { X, LogIn, KeyRound } from "lucide-react";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
}

export function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError("Room code must be 6 characters long.");
      sound.buzzer();
      return;
    }

    sound.click();
    onJoin(cleanCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface border border-surface-border shadow-card-shadow relative"
      >
        <button
          onClick={() => {
            sound.click();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-electric-pink/20 border border-electric-pink/40 flex items-center justify-center text-electric-pink mx-auto mb-3 shadow-glow-pink">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Join Room</h2>
          <p className="text-xs text-white/50 mt-1">
            Enter the 6-character room code from the host
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="e.g. 7K9X2B"
              className="w-full text-center tracking-[0.4em] text-2xl font-black font-mono py-4 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-white/20 focus:outline-none focus:border-electric-pink transition-all uppercase"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-400 text-center animate-shake">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-electric-pink to-electric-orange text-white font-black text-base tracking-wider uppercase shadow-glow-pink hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Join Lobby</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}


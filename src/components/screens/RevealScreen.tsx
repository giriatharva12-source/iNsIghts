"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomState, Player, Submission } from "@/types/game";
import { sound } from "@/lib/sound";
import { Sparkles, ArrowRight, Eye, ShieldCheck, Heart } from "lucide-react";

interface RevealScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onAdvanceToVoting: () => void;
}

export function RevealScreen({
  room,
  currentPlayer,
  onAdvanceToVoting,
}: RevealScreenProps) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const isHost = currentPlayer.isHost;

  useEffect(() => {
    sound.reveal();
    // Auto reveal all cards progressively
    room.submissions.forEach((sub, idx) => {
      setTimeout(() => {
        sound.pop();
        setRevealedIds((prev) => new Set([...prev, sub.id]));
      }, 500 + idx * 700);
    });
  }, [room.submissions]);

  const targetPlayer = room.players.find((p) => p.id === room.targetPlayerId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-xs font-black uppercase tracking-wider text-electric-pink">
          Round {room.currentRound} • Reveal Phase
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {room.gameMode === "CLASSIC"
            ? `${targetPlayer?.name || "Target"}'s Truth & Predictions`
            : "The Answers are In!"}
        </h2>
        <p className="text-xs text-white/60">
          {room.gameMode === "BLACKOUT"
            ? "Inspect the answers closely. One of these was written by the secret impostor!"
            : "See how well everyone guessed or read each other's minds."}
        </p>
      </div>

      {/* Target Player's Actual Answer Spotlight (In Classic Mode) */}
      {room.gameMode === "CLASSIC" && targetPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-gradient-to-r from-electric-purple/30 via-surface to-electric-pink/30 border-2 border-electric-pink shadow-glow-pink relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{targetPlayer.avatar}</span>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-electric-pink block">
                {targetPlayer.name}&apos;s ACTUAL ANSWER:
              </span>
              <span className="text-sm font-bold text-white/70">The True Answer</span>
            </div>
          </div>

          {/* Find target player's submission */}
          {(() => {
            const targetSub = room.submissions.find((s) => s.playerId === targetPlayer.id);
            return (
              <p className="text-xl sm:text-2xl font-black text-white italic mt-2 leading-relaxed">
                &ldquo;{targetSub?.answer || "No answer submitted"}&rdquo;
              </p>
            );
          })()}
        </motion.div>
      )}

      {/* Submissions Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {room.submissions
          .filter((sub) => (room.gameMode === "CLASSIC" ? sub.playerId !== targetPlayer?.id : true))
          .map((sub, idx) => {
            const isRevealed = revealedIds.has(sub.id);
            const isMyAnswer = sub.playerId === currentPlayer.id;

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-3xl border transition-all relative overflow-hidden shadow-card-shadow ${
                  isMyAnswer
                    ? "bg-surface-light border-electric-violet shadow-glow"
                    : "bg-surface/85 border-surface-border hover:border-white/20"
                }`}
              >
                {/* Author Info (Hidden in Blackout mode until voting ends) */}
                <div className="flex items-center justify-between mb-3">
                  {room.gameMode === "BLACKOUT" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs text-white/50">
                        ?
                      </div>
                      <span className="text-xs font-bold text-white/50">Anonymous Player</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sub.playerAvatar || "🦊"}</span>
                      <span className="text-xs font-bold text-white/90">{sub.playerName}</span>
                      {isMyAnswer && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-electric-purple/30 text-electric-pink border border-electric-pink/30">
                          YOU
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Answer Content */}
                <div className="min-h-[60px] flex items-center">
                  <AnimatePresence mode="wait">
                    {isRevealed ? (
                      <motion.p
                        key="revealed"
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        className="text-base font-bold text-white leading-snug"
                      >
                        &ldquo;{sub.answer}&rdquo;
                      </motion.p>
                    ) : (
                      <motion.div
                        key="hidden"
                        className="w-full flex items-center justify-center gap-1.5 py-4 text-xs font-bold text-white/30"
                      >
                        <span>Revealing...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Advance to Voting button */}
      <div className="pt-4 flex justify-center">
        {isHost ? (
          <button
            onClick={() => {
              sound.click();
              onAdvanceToVoting();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-electric-violet via-pink-500 to-electric-orange text-white font-black text-base tracking-wider uppercase shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>
              {room.gameMode === "BLACKOUT" ? "Start Impostor Vote" : "Proceed to Voting"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-xs font-semibold text-white/50 animate-pulse">
            Waiting for host to begin voting phase...
          </div>
        )}
      </div>
    </div>
  );
}


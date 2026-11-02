"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { RoomState, Player } from "@/types/game";
import { sound } from "@/lib/sound";
import { AvatarBadge } from "../ui/AvatarBadge";
import { Sparkles, ArrowRight, Eye, ShieldAlert } from "lucide-react";

interface QuestionScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onProceedToAnswer: () => void;
}

export function QuestionScreen({
  room,
  currentPlayer,
  onProceedToAnswer,
}: QuestionScreenProps) {
  const targetPlayer = room.players.find((p) => p.id === room.targetPlayerId);
  const isOddOneOut = room.gameMode === "BLACKOUT" && currentPlayer.id === room.oddOneOutId;
  const isSubject = room.gameMode === "CLASSIC" && currentPlayer.id === room.targetPlayerId;

  useEffect(() => {
    sound.reveal();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh]">
      {/* Round & Mode Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <span className="px-3 py-1 rounded-full bg-electric-purple/30 text-electric-pink border border-electric-pink/30 text-xs font-black uppercase tracking-wider">
          Round {room.currentRound} of {room.totalRounds}
        </span>
        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
          • {room.gameMode}
        </span>
      </motion.div>

      {/* Special Mode Banners */}
      {/* 1. Classic Mode Target Header */}
      {room.gameMode === "CLASSIC" && targetPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-electric-purple/20 via-surface to-electric-pink/20 border border-electric-violet/40 shadow-glow flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
            style={{ backgroundColor: targetPlayer.avatarColor }}
          >
            {targetPlayer.avatar}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-electric-pink block">
              {isSubject ? "You are the focus player!" : "Target player this round:"}
            </span>
            <span className="text-sm font-extrabold text-white">
              {isSubject
                ? "Answer honestly! Other players will predict your answer."
                : `Predict what ${targetPlayer.name} will answer!`}
            </span>
          </div>
        </motion.div>
      )}

      {/* 2. Blackout Mode Secret Role Alert */}
      {room.gameMode === "BLACKOUT" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-2xl border shadow-card-shadow flex items-center gap-3 w-full ${
            isOddOneOut
              ? "bg-rose-950/60 border-rose-500/50 shadow-glow"
              : "bg-surface border-surface-border"
          }`}
        >
          <div className="text-2xl">{isOddOneOut ? "🕵️" : "🛡️"}</div>
          <div>
            <span className="text-[11px] uppercase font-black tracking-wider block text-white/70">
              {isOddOneOut ? "SECRET ROLE: YOU ARE THE ODD ONE OUT!" : "SECRET ROLE: INNOCENT"}
            </span>
            <span className="text-xs font-semibold text-white/90">
              {isOddOneOut
                ? "You will NOT see the real question. Use your secret clue below and try to blend in without getting caught!"
                : "Answer the question truthfully. Later, vote out the impostor!"}
            </span>
          </div>
        </motion.div>
      )}

      {/* The Big Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full p-8 sm:p-10 rounded-3xl bg-surface/90 border-2 border-electric-violet/40 shadow-card-shadow relative overflow-hidden backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-pink/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-electric-purple/15 rounded-full blur-2xl pointer-events-none" />

        {/* Category tag */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
            {room.currentQuestion?.category || "Insight"}
          </span>
          <span className="text-xs text-white/40 font-semibold">
            {room.settings.roundTimer}s Timer
          </span>
        </div>

        {/* Question Text */}
        <div className="my-6">
          {isOddOneOut ? (
            <div className="space-y-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block">
                [CLUE FOR ODD ONE OUT]
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-rose-200 leading-snug">
                {room.currentQuestion?.impostorPrompt ||
                  "Give a wild, funny answer that sounds believable, but don't blow your cover!"}
              </h2>
            </div>
          ) : (
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
              {room.currentQuestion?.text || "What is their biggest guilty pleasure?"}
            </h2>
          )}
        </div>

        {/* Proceed to Answer Button */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              sound.click();
              onProceedToAnswer();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-electric-violet via-pink-500 to-electric-orange text-white font-black text-sm tracking-wider uppercase shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Write Answer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}


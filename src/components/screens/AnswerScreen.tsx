"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RoomState, Player } from "@/types/game";
import { RoundTimer } from "../ui/RoundTimer";
import { sound } from "@/lib/sound";
import { Send, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface AnswerScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onSubmitAnswer: (answer: string) => void;
  onTimeUp: () => void;
}

export function AnswerScreen({
  room,
  currentPlayer,
  onSubmitAnswer,
  onTimeUp,
}: AnswerScreenProps) {
  const [answer, setAnswer] = useState("");
  const isOddOneOut = room.gameMode === "BLACKOUT" && currentPlayer.id === room.oddOneOutId;
  const isSubject = room.gameMode === "CLASSIC" && currentPlayer.id === room.targetPlayerId;
  const hasSubmitted = currentPlayer.hasSubmitted;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim()) return;
    sound.success();
    onSubmitAnswer(answer.trim());
  };

  const handleTimerFinished = () => {
    if (!hasSubmitted) {
      // Auto submit fallback if time runs out
      const fallback = answer.trim() || "Ran out of time! ⏳";
      onSubmitAnswer(fallback);
    }
    onTimeUp();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header with Timer and Category */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/80 border border-surface-border shadow-card-shadow">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-electric-purple/30 text-electric-pink border border-electric-pink/30">
            Round {room.currentRound}/{room.totalRounds}
          </span>
          <span className="text-xs font-bold text-white/50">{room.gameMode}</span>
        </div>

        {/* Circular Animated Timer */}
        <RoundTimer
          initialSeconds={room.timer}
          isRunning={room.timerRunning && !hasSubmitted}
          onTimeUp={handleTimerFinished}
        />
      </div>

      {/* Question Reminder Card */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
        <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1">
          {isOddOneOut ? "Your Secret Clue" : "The Question"}
        </span>
        <p className="text-base sm:text-lg font-bold text-white leading-snug">
          {isOddOneOut
            ? room.currentQuestion?.impostorPrompt
            : room.currentQuestion?.text}
        </p>
      </div>

      {/* Answer Form or Submitted Waiting Card */}
      {!hasSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              maxLength={280}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={
                isSubject
                  ? "Type your honest answer here..."
                  : isOddOneOut
                  ? "Craft a clever answer to blend in..."
                  : "Predict their answer or write your take..."
              }
              className="w-full p-4 rounded-2xl bg-surface/90 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all text-base resize-none shadow-inner"
              autoFocus
            />
            <span className="absolute bottom-3 right-3 text-[11px] font-mono text-white/40">
              {answer.length}/280
            </span>
          </div>

          <button
            type="submit"
            disabled={!answer.trim()}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-glow flex items-center justify-center gap-2 active:scale-98 ${
              answer.trim()
                ? "bg-gradient-to-r from-electric-violet via-pink-500 to-electric-orange text-white hover:brightness-110"
                : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Lock In Answer</span>
          </button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl bg-surface/90 border border-electric-violet/40 shadow-glow text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-glow">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Answer Locked In!</h3>
            <p className="text-xs text-white/60 mt-1">
              Your answer: <span className="text-white font-semibold italic">&ldquo;{answer || "Submitted"}&rdquo;</span>
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <span className="text-xs font-bold text-white/50 block mb-3 uppercase tracking-wider">
              Waiting for other players...
            </span>

            {/* Live Player Submission Status */}
            <div className="flex flex-wrap justify-center gap-3">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    p.hasSubmitted
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-black/30 border-white/10 text-white/40 animate-pulse"
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                  {p.hasSubmitted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}


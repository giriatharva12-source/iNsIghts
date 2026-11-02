"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RoomState, Player } from "@/types/game";
import { sound } from "@/lib/sound";
import { userStore } from "@/lib/userStore";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Home,
  Share2,
  Check,
  Crown,
  Medal,
  Sparkles,
} from "lucide-react";

interface FinalResultsScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onRematch: () => void;
  onExitHome: () => void;
}

export function FinalResultsScreen({
  room,
  currentPlayer,
  onRematch,
  onExitHome,
}: FinalResultsScreenProps) {
  const [copied, setCopied] = useState(false);
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isHost = currentPlayer.isHost;

  useEffect(() => {
    sound.fanfare();
    // Confetti cannons
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#ec4899", "#f97316", "#06b6d4"],
    });

    // Record game in user store
    const myRank = sortedPlayers.findIndex((p) => p.id === currentPlayer.id) + 1;
    const isWinner = myRank === 1;

    userStore.recordGameComplete(
      {
        id: `gh_${Date.now()}`,
        roomCode: room.code,
        gameMode: room.gameMode,
        rounds: room.totalRounds,
        winnerName: winner?.name || "Player",
        winnerScore: winner?.score || 0,
        myRank,
        myScore: currentPlayer.score,
        date: new Date().toLocaleDateString(),
      },
      isWinner
    );
  }, []);

  const handleShareResults = () => {
    sound.click();
    const podiumText = sortedPlayers
      .slice(0, 3)
      .map((p, idx) => `${idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"} ${p.name}: ${p.score} pts`)
      .join("\n");

    const text = `🎉 INSIGHT Party Game Results!\nMode: ${room.gameMode} (${room.totalRounds} rounds)\n\n${podiumText}\n\nThink your friends know you better? Play INSIGHT!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-24 text-center">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-purple/30 text-electric-pink border border-electric-pink/30 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Game Completed • {room.gameMode} Mode
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Victory Podium
        </h1>
        <p className="text-xs text-white/60 mt-1">
          {winner?.name} proved to have the sharpest instincts!
        </p>
      </div>

      {/* 3D Visual Podium (Top 3) */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-8 pb-4 max-w-lg mx-auto">
        {/* 2nd Place */}
        {sortedPlayers[1] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="relative mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md border-2 border-slate-300"
                style={{ backgroundColor: sortedPlayers[1].avatarColor }}
              >
                {sortedPlayers[1].avatar}
              </div>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥈</span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px]">
              {sortedPlayers[1].name}
            </span>
            <span className="text-xs font-extrabold text-slate-300">
              {sortedPlayers[1].score} pts
            </span>

            {/* Pedestal */}
            <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-slate-700/60 to-slate-500/40 border-t border-slate-400 mt-2 flex items-center justify-center font-black text-slate-300 text-xl font-mono">
              2
            </div>
          </motion.div>
        )}

        {/* 1st Place (Center, Tallest) */}
        {sortedPlayers[0] && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="relative mb-2">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-bold shadow-glow border-2 border-amber-400"
                style={{ backgroundColor: sortedPlayers[0].avatarColor }}
              >
                {sortedPlayers[0].avatar}
              </div>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                👑
              </span>
            </div>
            <span className="text-sm font-black text-white truncate max-w-[100px]">
              {sortedPlayers[0].name}
            </span>
            <span className="text-sm font-extrabold text-amber-400">
              {sortedPlayers[0].score} pts
            </span>

            {/* Pedestal */}
            <div className="w-full h-36 rounded-t-2xl bg-gradient-to-t from-amber-600/60 to-amber-400/40 border-t-2 border-amber-300 mt-2 flex items-center justify-center font-black text-amber-200 text-3xl font-mono shadow-glow">
              1
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {sortedPlayers[2] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="relative mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md border-2 border-amber-700"
                style={{ backgroundColor: sortedPlayers[2].avatarColor }}
              >
                {sortedPlayers[2].avatar}
              </div>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥉</span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px]">
              {sortedPlayers[2].name}
            </span>
            <span className="text-xs font-extrabold text-amber-600">
              {sortedPlayers[2].score} pts
            </span>

            {/* Pedestal */}
            <div className="w-full h-16 rounded-t-2xl bg-gradient-to-t from-amber-900/60 to-amber-700/40 border-t border-amber-600 mt-2 flex items-center justify-center font-black text-amber-600 text-xl font-mono">
              3
            </div>
          </motion.div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="p-6 rounded-3xl bg-surface/85 border border-surface-border text-left shadow-card-shadow max-w-xl mx-auto space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
          Complete Standings
        </h3>
        {sortedPlayers.map((player, idx) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-xs text-white/40 w-4">
                #{idx + 1}
              </span>
              <span className="text-lg">{player.avatar}</span>
              <span className="text-xs font-bold text-white">{player.name}</span>
            </div>
            <span className="text-xs font-black text-electric-pink">{player.score} pts</span>
          </div>
        ))}
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-4">
        {/* Share Result Card */}
        <button
          onClick={handleShareResults}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? "Copied Results!" : "Share Results"}</span>
        </button>

        {/* Rematch Button (Host only) */}
        {isHost && (
          <button
            onClick={() => {
              sound.click();
              onRematch();
            }}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-electric-violet to-electric-pink text-white font-black text-sm uppercase tracking-wider shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch</span>
          </button>
        )}

        {/* Exit Home */}
        <button
          onClick={() => {
            sound.click();
            onExitHome();
          }}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 border border-white/10"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
}


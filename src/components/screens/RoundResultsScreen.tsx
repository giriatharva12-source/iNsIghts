"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { RoomState, Player } from "@/types/game";
import { sound } from "@/lib/sound";
import { AvatarBadge } from "../ui/AvatarBadge";
import { Trophy, Flame, ArrowRight, Sparkles, ShieldCheck, AlertCircle } from "lucide-react";

interface RoundResultsScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onNextRound: () => void;
}

export function RoundResultsScreen({
  room,
  currentPlayer,
  onNextRound,
}: RoundResultsScreenProps) {
  const isHost = currentPlayer.isHost;
  const isLastRound = room.currentRound >= room.totalRounds;
  const isBlackout = room.gameMode === "BLACKOUT";
  const oddOneOut = room.players.find((p) => p.id === room.oddOneOutId);

  useEffect(() => {
    sound.fanfare();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-xs font-black uppercase tracking-wider text-electric-pink">
          Round {room.currentRound} Results
        </span>
        <h2 className="text-3xl font-black text-white">Scoreboard Update</h2>
      </div>

      {/* Special Blackout Identity Reveal Banner */}
      {isBlackout && oddOneOut && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 to-rose-950/80 border border-electric-pink shadow-glow-pink flex items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
            style={{ backgroundColor: oddOneOut.avatarColor }}
          >
            {oddOneOut.avatar}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-electric-pink block">
              ODD ONE OUT REVEALED
            </span>
            <span className="text-base font-extrabold text-white">
              {oddOneOut.name} was the secret impostor!
            </span>
            <p className="text-xs text-white/60 mt-0.5">
              {oddOneOut.roundScore > 120
                ? "Master of Deception! Fooled the room and scored big bonus points."
                : "The innocents saw right through the disguise!"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Dynamic Leaderboard List */}
      <div className="p-6 rounded-3xl bg-surface/85 border border-surface-border shadow-card-shadow space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 px-3 pb-2 border-b border-white/5">
          <span>Rank & Player</span>
          <span>Round / Total</span>
        </div>

        {room.players.map((player, idx) => {
          const isMe = player.id === currentPlayer.id;
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                isMe
                  ? "bg-surface-light border-electric-violet shadow-glow"
                  : "bg-black/20 border-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm w-5 text-center text-white/40">
                  #{idx + 1}
                </span>

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  {player.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-white">{player.name}</span>
                    {isMe && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-electric-pink/20 text-electric-pink border border-electric-pink/30">
                        YOU
                      </span>
                    )}
                    {player.streak > 1 && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {player.streak}x
                      </span>
                    )}
                  </div>
                  {player.roundScore > 0 && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      +{player.roundScore} this round
                    </span>
                  )}
                </div>
              </div>

              {/* Total Score */}
              <div className="text-right">
                <span className="text-base font-black text-white block">
                  {player.score} <span className="text-xs font-semibold text-white/50">pts</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Round Button */}
      <div className="pt-2 flex justify-center">
        {isHost ? (
          <button
            onClick={() => {
              sound.click();
              onNextRound();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-electric-violet via-pink-500 to-electric-orange text-white font-black text-base tracking-wider uppercase shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLastRound ? "View Final Results 🏆" : "Start Next Round"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-xs font-semibold text-white/50 animate-pulse text-center">
            Waiting for host to proceed to {isLastRound ? "final results" : "next round"}...
          </div>
        )}
      </div>
    </div>
  );
}


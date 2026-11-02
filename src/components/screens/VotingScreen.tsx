"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RoomState, Player } from "@/types/game";
import { sound } from "@/lib/sound";
import { AvatarBadge } from "../ui/AvatarBadge";
import { Check, Vote as VoteIcon, Sparkles, ShieldAlert, Heart, Laugh } from "lucide-react";

interface VotingScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onSubmitVote: (targetId: string) => void;
}

export function VotingScreen({
  room,
  currentPlayer,
  onSubmitVote,
}: VotingScreenProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const hasVoted = currentPlayer.hasVoted;
  const isBlackout = room.gameMode === "BLACKOUT";
  const isClassic = room.gameMode === "CLASSIC";
  const isTargetPlayer = room.targetPlayerId === currentPlayer.id;

  const handleVote = (targetId: string) => {
    if (hasVoted) return;
    sound.success();
    setSelectedTarget(targetId);
    onSubmitVote(targetId);
  };

  const totalVoters = room.players.length;
  const votedCount = room.players.filter((p) => p.hasVoted).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-xs font-black uppercase tracking-wider text-electric-pink">
          Voting Phase • {votedCount}/{totalVoters} Votes In
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {isBlackout
            ? "Who is the Odd One Out?"
            : isClassic && isTargetPlayer
            ? "Which prediction was closest to your truth?"
            : "Vote for the Best Answer!"}
        </h2>
        <p className="text-xs text-white/60">
          {isBlackout
            ? "Vote to identify the secret impostor. Impostor gets points for surviving!"
            : isClassic && isTargetPlayer
            ? "Pick the prediction that impressed you or was spot-on."
            : "Choose your favorite answer (cannot vote for yourself)."}
        </p>
      </div>

      {/* Voting Options */}
      {isBlackout ? (
        /* Blackout: Vote for suspected Player */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {room.players
            .filter((p) => p.id !== currentPlayer.id) // Can't vote for self
            .map((player) => {
              const isSelected = selectedTarget === player.id;
              return (
                <motion.div
                  key={player.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVote(player.id)}
                  className={`p-5 rounded-3xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? "bg-rose-950/70 border-rose-500 shadow-glow ring-2 ring-rose-500"
                      : "bg-surface/85 border-surface-border hover:border-white/20"
                  }`}
                >
                  <AvatarBadge
                    avatar={player.avatar}
                    color={player.avatarColor}
                    name={player.name}
                    size="lg"
                  />
                  <button
                    disabled={hasVoted}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      isSelected
                        ? "bg-rose-500 text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {isSelected ? "Suspected! 🕵️" : "Vote Suspect"}
                  </button>
                </motion.div>
              );
            })}
        </div>
      ) : (
        /* Classic & Other Modes: Vote for Answer Submissions */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {room.submissions
            .filter((sub) => sub.playerId !== currentPlayer.id) // Can't vote for own submission
            .map((sub) => {
              const isSelected = selectedTarget === sub.id;
              return (
                <motion.div
                  key={sub.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleVote(sub.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-electric-purple/30 border-electric-pink shadow-glow-pink ring-2 ring-electric-pink"
                      : "bg-surface/85 border-surface-border hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{sub.playerAvatar || "🦊"}</span>
                      <span className="text-xs font-bold text-white/80">{sub.playerName}</span>
                    </div>
                    <p className="text-base font-bold text-white italic leading-snug">
                      &ldquo;{sub.answer}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/40">
                      {isClassic ? "Prediction" : "Submission"}
                    </span>
                    <button
                      disabled={hasVoted}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                        isSelected
                          ? "bg-electric-pink text-white shadow-glow-pink"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {isSelected ? "Voted! ❤️" : "Select Vote"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Waiting Indicator if voted */}
      {hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center"
        >
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 mb-1">
            <Check className="w-4 h-4" /> Vote Recorded!
          </span>
          <p className="text-xs text-white/50">
            Waiting for remaining players to cast their votes...
          </p>
        </motion.div>
      )}
    </div>
  );
}


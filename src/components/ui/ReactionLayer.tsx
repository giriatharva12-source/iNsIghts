"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roomEngine } from "@/lib/multiplayer/roomEngine";
import { Reaction } from "@/types/game";
import { sound } from "@/lib/sound";

interface ReactionLayerProps {
  roomCode: string;
  playerId: string;
  playerName: string;
}

const EMOJI_LIST = ["❤️", "😂", "💀", "🔥", "👏", "😱"];

export function ReactionLayer({ roomCode, playerId, playerName }: ReactionLayerProps) {
  const [activeReactions, setActiveReactions] = useState<(Reaction & { xOffset: number })[]>([]);

  useEffect(() => {
    const unsubscribe = roomEngine.subscribeReactions(roomCode, (reaction) => {
      sound.pop();
      const xOffset = Math.random() * 80 - 40; // randomize floating position
      setActiveReactions((prev) => [...prev.slice(-15), { ...reaction, xOffset }]);
    });
    return () => unsubscribe();
  }, [roomCode]);

  const handleSendEmoji = (emoji: string) => {
    sound.pop();
    roomEngine.sendReaction(roomCode, playerId, playerName, emoji);
  };

  return (
    <>
      {/* Floating Reactions Portal */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {activeReactions.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: "85vh", x: `calc(50% + ${item.xOffset}vw)`, scale: 0.5 }}
              animate={{
                opacity: [1, 1, 0],
                y: "15vh",
                x: `calc(50% + ${item.xOffset * 1.5}vw)`,
                scale: [0.8, 1.4, 1.1],
              }}
              transition={{ duration: 2.8, ease: "easeOut" }}
              onAnimationComplete={() => {
                setActiveReactions((prev) => prev.filter((r) => r.id !== item.id));
              }}
              className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/90 border border-white/20 shadow-glow backdrop-blur-md"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-bold text-white/90">{item.playerName}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Reaction Bar at bottom */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-surface/90 border border-surface-border shadow-glow backdrop-blur-lg">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendEmoji(emoji)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl rounded-full hover:bg-white/10 active:scale-125 transition-transform"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}


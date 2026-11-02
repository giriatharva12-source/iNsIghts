"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GameMode, UserProfile } from "@/types/game";
import { sound } from "@/lib/sound";
import { userStore } from "@/lib/userStore";
import {
  Users,
  PlusCircle,
  LogIn,
  Zap,
  Eye,
  Flame,
  Sparkles,
  BookOpen,
  Trophy,
  History,
  ChevronRight,
  Smile,
} from "lucide-react";

interface HomeScreenProps {
  profile: UserProfile;
  onCreateRoom: (mode?: GameMode) => void;
  onJoinRoom: () => void;
  onQuickPlay: () => void;
  onOpenCustomQuestions: () => void;
  onSelectModeInfo: (mode: GameMode) => void;
  onNavigate: (screen: string) => void;
}

export const GAME_MODES_INFO: {
  id: GameMode;
  name: string;
  tagline: string;
  icon: string;
  gradient: string;
  accent: string;
  description: string;
  players: string;
  vibe: string;
}[] = [
  {
    id: "CLASSIC",
    name: "Classic",
    tagline: "The Core Mind-Reader Experience",
    icon: "🎯",
    gradient: "from-purple-600 via-indigo-600 to-electric-violet",
    accent: "#8b5cf6",
    description:
      "One player is the focus. Everyone predicts what they will answer. The target reveals their truth and scores who understands them best!",
    players: "3–10 Players",
    vibe: "Insightful & Bonding",
  },
  {
    id: "BLACKOUT",
    name: "Blackout",
    tagline: "Secret Impostor & Deception",
    icon: "🕵️",
    gradient: "from-zinc-900 via-purple-950 to-electric-pink",
    accent: "#ec4899",
    description:
      "One player is secretly the Odd One Out with only a vague clue. Everyone submits answers. Can the innocents vote out the impostor, or will they fool everyone?",
    players: "3–10 Players",
    vibe: "Suspense & Bluffing",
  },
  {
    id: "TROUBLE",
    name: "Trouble",
    tagline: "Funny & Chaotic Dilemmas",
    icon: "💣",
    gradient: "from-rose-600 via-orange-600 to-amber-500",
    accent: "#f97316",
    description:
      "Awkward scenarios, unhinged dilemmas, and savage confessions. Vote for the funniest answers and crown the most chaotic friend.",
    players: "2–10 Players",
    vibe: "Unhinged Laughs",
  },
  {
    id: "HOOT",
    name: "Hoot",
    tagline: "Bold & Personal Confessions",
    icon: "🦉",
    gradient: "from-fuchsia-600 to-pink-500",
    accent: "#d946ef",
    description:
      "Spicy secrets, daring truths, and personal takes with configurable intensity filters. Best for close friends who aren't afraid of the heat.",
    players: "2–10 Players",
    vibe: "Spicy & Playful",
  },
  {
    id: "TRASH",
    name: "Trash",
    tagline: "Absurd, Ridiculous & Wild",
    icon: "🗑️",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    accent: "#06b6d4",
    description:
      "Zero filter, surreal questions, and bizarre hypothetical debates. The stupider your answer, the more likely you are to win votes.",
    players: "2–10 Players",
    vibe: "Pure Absurdity",
  },
  {
    id: "DEEP",
    name: "Deep",
    tagline: "Meaningful & Heartfelt Connections",
    icon: "🌊",
    gradient: "from-blue-700 via-indigo-700 to-cyan-500",
    accent: "#3b82f6",
    description:
      "Explore childhood memories, ambitions, vulnerabilities, and the real meaning of friendship. Thoughtful, heartwarming, and memorable.",
    players: "2–10 Players",
    vibe: "Emotional & Introspective",
  },
  {
    id: "BATTLE",
    name: "Battle",
    tagline: "Fast-Paced Speed & Trivia",
    icon: "⚡",
    gradient: "from-amber-500 via-orange-600 to-rose-600",
    accent: "#f59e0b",
    description:
      "Rapid 15-second countdown timer! Fast answers receive huge speed bonuses. Real-time dynamic leaderboard after every single question.",
    players: "2–10 Players",
    vibe: "Adrenaline & Competition",
  },
];

export function HomeScreen({
  profile,
  onCreateRoom,
  onJoinRoom,
  onQuickPlay,
  onOpenCustomQuestions,
  onSelectModeInfo,
  onNavigate,
}: HomeScreenProps) {
  const history = userStore.getHistory();
  const friends = userStore.getFriends();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 pb-20">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface via-surface-light to-surface p-6 sm:p-8 border border-surface-border shadow-card-shadow"
      >
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-electric-purple/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-electric-pink/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{profile.avatar}</span>
              <span className="text-white/60 text-sm font-medium">Welcome back,</span>
              <span className="text-white font-bold text-base">{profile.nickname}!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to test your friendships?
            </h1>
            <p className="text-white/60 text-sm mt-1 max-w-lg">
              Start a private party room, invite your friends with a 6-character code, and find out what everyone really thinks.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => {
                sound.click();
                onNavigate("profile");
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{profile.gamesWon} Wins</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Create Room */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.click();
            onCreateRoom();
          }}
          className="p-6 rounded-3xl bg-gradient-to-br from-electric-purple/30 via-surface to-surface border border-electric-violet/40 shadow-glow cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-electric-purple flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white group-hover:text-electric-violet transition-colors">
            Create Room
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Host a private room, pick game modes, customize questions & invite friends.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-electric-pink gap-1">
            <span>Host Game</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Join Room */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.click();
            onJoinRoom();
          }}
          className="p-6 rounded-3xl bg-gradient-to-br from-electric-pink/20 via-surface to-surface border border-electric-pink/30 shadow-glow-pink cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-electric-pink flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white group-hover:text-electric-pink transition-colors">
            Join Room
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Have a 6-letter room code from a friend? Enter it to jump into the lobby.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-electric-pink gap-1">
            <span>Enter Code</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Quick Play */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.click();
            onQuickPlay();
          }}
          className="p-6 rounded-3xl bg-gradient-to-br from-electric-orange/20 via-surface to-surface border border-electric-orange/30 shadow-glow-orange cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-electric-orange flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white group-hover:text-electric-orange transition-colors">
            Quick Play
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Test the game instantly with smart AI bots or join an instant match.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-electric-orange gap-1">
            <span>Play Now</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>

      {/* Custom Questions Banner */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          sound.click();
          onOpenCustomQuestions();
        }}
        className="p-5 rounded-3xl bg-gradient-to-r from-electric-purple/20 via-surface to-electric-pink/20 border border-electric-pink/40 shadow-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-electric-pink to-electric-orange flex items-center justify-center text-white text-2xl shadow-glow-pink shrink-0 group-hover:rotate-6 transition-transform">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white group-hover:text-electric-pink transition-colors">
                My Custom Questions Pack
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-electric-pink/20 text-electric-pink border border-electric-pink/30">
                Custom Pack
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Add your own personal questions, inside jokes, and friend trivia to play in any room!
            </p>
          </div>
        </div>

        <button
          type="button"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-electric-pink text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-glow-pink group-hover:brightness-110 transition-all shrink-0"
        >
          <span>Manage Questions</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Game Modes Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              Game Modes
            </h2>
            <p className="text-xs text-white/60">
              7 distinct party modes designed for laughs, secrets, and banter
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_MODES_INFO.map((mode) => (
            <div
              key={mode.id}
              className="p-5 rounded-3xl bg-surface/80 border border-surface-border hover:border-white/20 transition-all flex flex-col justify-between group shadow-card-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center text-xl shadow-md`}
                    >
                      {mode.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-electric-violet transition-colors">
                        {mode.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                        {mode.vibe}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  {mode.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white/50 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {mode.players}
                </span>

                <button
                  onClick={() => {
                    sound.click();
                    onCreateRoom(mode.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-electric-purple text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  Play Mode
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social & Recent History Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Friends Quick Widget */}
        <div className="p-5 rounded-3xl bg-surface/70 border border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-electric-pink" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Friends ({friends.length})
              </h3>
            </div>
            <button
              onClick={() => {
                sound.click();
                onNavigate("friends");
              }}
              className="text-xs font-bold text-electric-violet hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {friends.slice(0, 3).map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-black/20 border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
                    style={{ backgroundColor: f.avatarColor }}
                  >
                    {f.avatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{f.name}</span>
                    <span className="text-[10px] text-white/50">{f.statusText}</span>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Games History */}
        <div className="p-5 rounded-3xl bg-surface/70 border border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-electric-orange" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Matches
              </h3>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-6">
              <Smile className="w-8 h-8 text-white/30 mx-auto mb-2" />
              <p className="text-xs text-white/50">No matches played yet.</p>
              <p className="text-[11px] text-white/40">Your match history will appear here!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-black/20 border border-white/5"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {item.gameMode} • Room {item.roomCode}
                    </span>
                    <span className="text-[10px] text-white/50">
                      Winner: {item.winnerName} ({item.winnerScore} pts)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-electric-pink block">
                      {item.myScore} pts
                    </span>
                    <span className="text-[10px] text-white/40">
                      Rank #{item.myRank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GameMode, QuestionCategory, IntensityLevel, UserProfile, Question } from "@/types/game";
import { GAME_MODES_INFO } from "./HomeScreen";
import { questionStore } from "@/lib/questionStore";
import { sound } from "@/lib/sound";
import { X, Sparkles, Sliders, Play, Check, Edit3, HelpCircle } from "lucide-react";

interface CreateRoomModalProps {
  initialMode?: GameMode;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomQuestions: () => void;
  onConfirm: (
    mode: GameMode,
    settings: {
      totalRounds: number;
      roundTimer: number;
      categories: QuestionCategory[];
      intensity: IntensityLevel;
      questionSource: "all" | "custom_only" | "standard_only";
      customQuestions: Question[];
    }
  ) => void;
}

const ALL_CATEGORIES: QuestionCategory[] = [
  "Funny",
  "Friendship",
  "Personality",
  "Embarrassing",
  "Relationships",
  "Childhood",
  "Deep",
  "Hypothetical",
  "Spicy",
  "Random",
];

export function CreateRoomModal({
  initialMode = "CLASSIC",
  profile,
  isOpen,
  onClose,
  onOpenCustomQuestions,
  onConfirm,
}: CreateRoomModalProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [roundTimer, setRoundTimer] = useState<number>(30);
  const [selectedCategories, setSelectedCategories] = useState<QuestionCategory[]>([
    "Funny",
    "Friendship",
    "Personality",
    "Deep",
  ]);
  const [intensity, setIntensity] = useState<IntensityLevel>("medium");
  const [questionSource, setQuestionSource] = useState<"all" | "custom_only" | "standard_only">("all");

  const customQuestions = questionStore.getCustomQuestions();

  if (!isOpen) return null;

  const toggleCategory = (cat: QuestionCategory) => {
    sound.click();
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleCreate = () => {
    sound.success();
    onConfirm(selectedMode, {
      totalRounds,
      roundTimer,
      categories: selectedCategories,
      intensity,
      questionSource,
      customQuestions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-surface border border-surface-border shadow-card-shadow relative my-8"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.click();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-electric-purple flex items-center justify-center text-white text-xl shadow-glow">
            🎮
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Create Private Room</h2>
            <p className="text-xs text-white/50">Configure your multiplayer game session</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
            Select Game Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GAME_MODES_INFO.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  sound.click();
                  setSelectedMode(mode.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedMode === mode.id
                    ? "bg-electric-purple/30 border-electric-violet ring-1 ring-electric-violet shadow-glow"
                    : "bg-black/30 border-white/5 hover:border-white/15"
                }`}
              >
                <div className="text-xl mb-1">{mode.icon}</div>
                <div className="text-xs font-bold text-white">{mode.name}</div>
                <div className="text-[10px] text-white/50 truncate">{mode.vibe}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Source (Custom vs Standard) */}
        <div className="mb-6 p-4 rounded-2xl bg-black/30 border border-electric-pink/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-white block">
                Question Source & Custom Pack
              </span>
              <span className="text-[11px] text-white/50">
                Choose whether to include your personal custom questions
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.click();
                onOpenCustomQuestions();
              }}
              className="px-3 py-1.5 rounded-xl bg-electric-purple/30 hover:bg-electric-purple text-electric-pink hover:text-white border border-electric-pink/40 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>My Questions ({customQuestions.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "all", label: "Standard + Custom", desc: "Best of both" },
              { id: "custom_only", label: "Custom Only", desc: `${customQuestions.length} questions` },
              { id: "standard_only", label: "Standard Bank", desc: "320+ questions" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  sound.click();
                  setQuestionSource(opt.id as "all" | "custom_only" | "standard_only");
                }}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  questionSource === opt.id
                    ? "bg-electric-pink/20 border-electric-pink text-white shadow-glow-pink"
                    : "bg-black/20 border-white/5 text-white/60 hover:text-white"
                }`}
              >
                <span className="text-xs font-extrabold block truncate">{opt.label}</span>
                <span className="text-[10px] text-white/40 block truncate">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rounds and Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Rounds */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Total Rounds
            </label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    sound.click();
                    setTotalRounds(r);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    totalRounds === r
                      ? "bg-electric-pink text-white shadow-glow-pink"
                      : "bg-black/30 text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  {r} Rounds
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Time Per Question
            </label>
            <div className="flex gap-2">
              {[15, 25, 35, 45].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    sound.click();
                    setRoundTimer(t);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    roundTimer === t
                      ? "bg-electric-orange text-white shadow-glow-orange"
                      : "bg-black/30 text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Intensity Level */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
            Question Intensity
          </label>
          <div className="flex gap-3">
            {[
              { id: "mild", label: "Mild (Family Friendly)", icon: "🌱" },
              { id: "medium", label: "Medium (Party Vibes)", icon: "🔥" },
              { id: "spicy", label: "Spicy (18+ Opt-In)", icon: "🌶️" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sound.click();
                  setIntensity(item.id as IntensityLevel);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  intensity === item.id
                    ? "bg-white/15 border-white text-white shadow-md"
                    : "bg-black/30 border-white/5 text-white/60 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
            Categories to Include
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const isSpicy = cat === "Spicy";
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? isSpicy
                        ? "bg-rose-600 text-white shadow-glow"
                        : "bg-electric-purple text-white shadow-sm"
                      : "bg-black/30 text-white/50 border border-white/5 hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{cat}</span>
                  {isSpicy && <span className="text-[10px] bg-black/40 px-1 rounded">18+</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleCreate}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-electric-violet via-pink-500 to-electric-orange text-white font-black text-base tracking-wider uppercase shadow-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Create & Open Lobby</span>
        </button>
      </motion.div>
    </div>
  );
}

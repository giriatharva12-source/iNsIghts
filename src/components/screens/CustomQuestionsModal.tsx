"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question, QuestionCategory, GameMode, IntensityLevel } from "@/types/game";
import { questionStore } from "@/lib/questionStore";
import { sound } from "@/lib/sound";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  FileQuestion,
} from "lucide-react";

interface CustomQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsUpdated?: () => void;
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

const PRESET_IDEAS = [
  "What is {target}'s biggest guilty pleasure when home alone?",
  "If {target} were arrested tomorrow, what crime would you assume they committed?",
  "What is the funniest thing you have ever seen {target} do at a party?",
  "What nickname should {target} definitely NOT be called in public?",
  "If {target} was given $1,000 to spend in 10 minutes, where are they sprinting?",
];

export function CustomQuestionsModal({
  isOpen,
  onClose,
  onQuestionsUpdated,
}: CustomQuestionsModalProps) {
  const [customList, setCustomList] = useState<Question[]>(
    questionStore.getCustomQuestions()
  );
  const [text, setText] = useState("");
  const [category, setCategory] = useState<QuestionCategory>("Funny");
  const [intensity, setIntensity] = useState<IntensityLevel>("medium");
  const [prompt, setPrompt] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 2500);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    sound.success();
    const newQ = questionStore.addQuestion({
      text: text.trim(),
      category,
      intensity,
      suitableModes: [
        "CLASSIC",
        "BLACKOUT",
        "TROUBLE",
        "HOOT",
        "TRASH",
        "DEEP",
        "BATTLE",
      ],
      targetType: "subject_based",
      language: "en",
      impostorPrompt: prompt.trim() || undefined,
    });

    const updated = questionStore.getCustomQuestions();
    setCustomList(updated);
    setText("");
    setPrompt("");
    setIsAdding(false);
    showToast("Question added to your custom pack!");
    onQuestionsUpdated?.();
  };

  const handleDelete = (id: string) => {
    sound.click();
    questionStore.deleteQuestion(id);
    const updated = questionStore.getCustomQuestions();
    setCustomList(updated);
    showToast("Question removed");
    onQuestionsUpdated?.();
  };

  const handleUsePreset = (presetText: string) => {
    setText(presetText);
    setIsAdding(true);
    sound.pop();
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

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-electric-pink to-electric-orange flex items-center justify-center text-white text-2xl shadow-glow-pink">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">My Custom Questions</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-electric-purple/30 text-electric-pink border border-electric-pink/30">
                {customList.length} Added
              </span>
            </div>
            <p className="text-xs text-white/50">
              Create personal inside jokes, friend trivia, and custom questions
            </p>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mb-4 py-2 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Add Question Toggle Button */}
        {!isAdding && (
          <button
            onClick={() => {
              sound.click();
              setIsAdding(true);
            }}
            className="w-full py-3.5 mb-6 rounded-2xl bg-gradient-to-r from-electric-violet to-electric-pink text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow hover:brightness-110 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Question</span>
          </button>
        )}

        {/* Add Question Form Drawer */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddQuestion}
              className="p-5 rounded-2xl bg-black/40 border border-electric-violet/40 shadow-glow mb-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-electric-pink">
                  New Custom Question
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Question Text (use <code className="text-electric-cyan font-mono">{`{target}`}</code> for the target player&apos;s name)
                </label>
                <textarea
                  rows={2}
                  maxLength={250}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. What is {target}'s most embarrassing middle school secret?"
                  className="w-full p-3 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-electric-violet resize-none"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Intensity
                  </label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as IntensityLevel)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="mild">Mild (All Ages)</option>
                    <option value="medium">Medium (Party Vibes)</option>
                    <option value="spicy">Spicy (18+ Opt-In)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Secret Clue for Odd One Out in Blackout Mode (Optional)
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Name an awkward childhood habit"
                  className="w-full p-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-electric-pink"
                />
              </div>

              <button
                type="submit"
                disabled={!text.trim()}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                  text.trim()
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110 active:scale-98"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                Save Question to Pack
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Preset Prompt Suggestions */}
        {customList.length === 0 && !isAdding && (
          <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>Need Inspiration? Tap any prompt below:</span>
            </div>
            <div className="space-y-1.5">
              {PRESET_IDEAS.slice(0, 3).map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleUsePreset(idea)}
                  className="w-full p-2 text-left text-[11px] font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all truncate block"
                >
                  &ldquo;{idea}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Questions List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {customList.length === 0 ? (
            <div className="text-center py-8">
              <FileQuestion className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/50">You haven&apos;t added any custom questions yet.</p>
              <p className="text-[11px] text-white/40">
                Click &ldquo;Write New Question&rdquo; above to add questions for your game rooms!
              </p>
            </div>
          ) : (
            customList.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-surface/80 border border-surface-border flex items-center justify-between gap-3 group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-electric-purple/30 text-electric-pink border border-electric-pink/30">
                      {q.category}
                    </span>
                    <span className="text-[9px] font-bold uppercase text-white/40">
                      {q.intensity}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white leading-snug">{q.text}</p>
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-white/40">
            Custom questions can be included or set as exclusive in Room Settings.
          </span>
          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}


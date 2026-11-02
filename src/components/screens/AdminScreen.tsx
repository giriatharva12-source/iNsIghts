"use client";

import React, { useState } from "react";
import { questionStore, QuestionReport } from "@/lib/questionStore";
import { Question, QuestionCategory, GameMode, IntensityLevel } from "@/types/game";
import { sound } from "@/lib/sound";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Filter,
  BarChart3,
  Layers,
} from "lucide-react";

interface AdminScreenProps {
  onBack: () => void;
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

export function AdminScreen({ onBack }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "reports" | "analytics">("questions");
  const [questions, setQuestions] = useState<Question[]>(questionStore.getAllQuestions());
  const [reports, setReports] = useState<QuestionReport[]>(questionStore.getReports());
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [isAdding, setIsAdding] = useState(false);

  // New question form state
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<QuestionCategory>("Funny");
  const [newIntensity, setNewIntensity] = useState<IntensityLevel>("medium");
  const [newPrompt, setNewPrompt] = useState("");

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "ALL" || q.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleDelete = (id: string) => {
    sound.click();
    questionStore.deleteQuestion(id);
    setQuestions(questionStore.getAllQuestions());
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    sound.success();
    const created = questionStore.addQuestion({
      text: newText.trim(),
      category: newCategory,
      suitableModes: ["CLASSIC", "TROUBLE", "TRASH"],
      intensity: newIntensity,
      targetType: "subject_based",
      language: "en",
      impostorPrompt: newPrompt.trim() || undefined,
    });

    setQuestions(questionStore.getAllQuestions());
    setNewText("");
    setNewPrompt("");
    setIsAdding(false);
  };

  const handleResolveReport = (id: string, action: "RESOLVED" | "DISMISSED") => {
    sound.click();
    questionStore.resolveReport(id, action);
    setReports(questionStore.getReports());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin & Question Bank</h1>
            <p className="text-xs text-white/50">
              Manage database questions, moderation reports, and content
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.click();
            onBack();
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Game</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-4 text-xs font-bold">
        <button
          onClick={() => {
            sound.click();
            setActiveTab("questions");
          }}
          className={`pb-3 transition-colors ${
            activeTab === "questions"
              ? "text-electric-pink border-b-2 border-electric-pink"
              : "text-white/50 hover:text-white"
          }`}
        >
          Question Bank ({questions.length})
        </button>

        <button
          onClick={() => {
            sound.click();
            setActiveTab("reports");
          }}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "reports"
              ? "text-electric-orange border-b-2 border-electric-orange"
              : "text-white/50 hover:text-white"
          }`}
        >
          <span>User Reports</span>
          {reports.filter((r) => r.status === "PENDING").length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
              {reports.filter((r) => r.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sound.click();
            setActiveTab("analytics");
          }}
          className={`pb-3 transition-colors ${
            activeTab === "analytics"
              ? "text-electric-violet border-b-2 border-electric-violet"
              : "text-white/50 hover:text-white"
          }`}
        >
          Analytics & Metrics
        </button>
      </div>

      {/* TAB 1: QUESTION BANK */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions by keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-violet"
              />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-violet"
            >
              <option value="ALL">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                sound.click();
                setIsAdding(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-electric-violet to-electric-pink text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Add Question Drawer */}
          {isAdding && (
            <form
              onSubmit={handleCreateQuestion}
              className="p-5 rounded-3xl bg-surface/90 border border-electric-violet shadow-glow space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">Add Original Question</h3>
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
                  Question Text (use {`{target}`} for focus player placeholder)
                </label>
                <textarea
                  rows={2}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. What is {target}'s biggest irrational fear?"
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-violet"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as QuestionCategory)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Intensity</label>
                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(e.target.value as IntensityLevel)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  >
                    <option value="mild">Mild (All Ages)</option>
                    <option value="medium">Medium (Party)</option>
                    <option value="spicy">Spicy (18+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Blackout Clue for Odd One Out (Optional)
                </label>
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g. Name an absurd daily pet peeve"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Save to Database
              </button>
            </form>
          )}

          {/* Questions List */}
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-surface/75 border border-surface-border flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-electric-purple/30 text-electric-pink border border-electric-pink/30">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-white/40">
                      {q.intensity}
                    </span>
                    <span className="text-[10px] font-mono text-white/30">{q.id}</span>
                  </div>
                  <p className="text-xs font-bold text-white leading-relaxed">{q.text}</p>
                  {q.impostorPrompt && (
                    <p className="text-[11px] text-amber-300/80 font-mono">
                      Clue: {q.impostorPrompt}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USER REPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-surface/70 border border-surface-border">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-white/60">No pending reports! Content is clean.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-surface/75 border border-surface-border flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-400 block mb-0.5">
                    Flagged: {rep.reason}
                  </span>
                  <p className="text-xs font-bold text-white">&ldquo;{rep.questionText}&rdquo;</p>
                  <span className="text-[10px] text-white/40">Reported on {rep.reportedAt}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolveReport(rep.id, "RESOLVED")}
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold"
                    title="Dismiss report / Keep question"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(rep.questionId);
                      handleResolveReport(rep.id, "RESOLVED");
                    }}
                    className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ANALYTICS & METRICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-surface/80 border border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
              Active Question Count
            </span>
            <span className="text-3xl font-black text-white font-mono mt-2 block">
              {questions.length}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 block">300+ Seed questions loaded</span>
          </div>

          <div className="p-5 rounded-3xl bg-surface/80 border border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
              Supported Game Modes
            </span>
            <span className="text-3xl font-black text-electric-pink font-mono mt-2 block">
              7 Modes
            </span>
            <span className="text-[11px] text-white/40 mt-1 block">Classic, Blackout, Trouble...</span>
          </div>

          <div className="p-5 rounded-3xl bg-surface/80 border border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
              Multiplayer Sync
            </span>
            <span className="text-3xl font-black text-electric-cyan font-mono mt-2 block">
              Realtime
            </span>
            <span className="text-[11px] text-white/40 mt-1 block">
              Supabase + BroadcastChannel
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


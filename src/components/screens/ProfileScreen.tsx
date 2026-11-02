"use client";

import React, { useState } from "react";
import { UserProfile, GameMode } from "@/types/game";
import { AVATAR_OPTIONS, COLOR_OPTIONS, ACHIEVEMENTS, userStore } from "@/lib/userStore";
import { sound } from "@/lib/sound";
import { Trophy, Award, Edit3, Check, ArrowLeft, Star, Flame, Sparkles } from "lucide-react";

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBack: () => void;
}

export function ProfileScreen({
  profile,
  onUpdateProfile,
  onBack,
}: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [bio, setBio] = useState(profile.bio);

  const winRate =
    profile.totalGames > 0
      ? Math.round((profile.gamesWon / profile.totalGames) * 100)
      : 0;

  const handleSave = () => {
    sound.success();
    const updated: UserProfile = {
      ...profile,
      nickname: nickname.trim() || profile.nickname,
      avatar,
      avatarColor,
      bio,
    };
    userStore.saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.click();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            isEditing
              ? "bg-emerald-500 text-white shadow-glow"
              : "bg-electric-purple text-white hover:brightness-110"
          }`}
        >
          {isEditing ? (
            <>
              <Check className="w-4 h-4" />
              <span>Save Profile</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-surface/85 border border-surface-border shadow-card-shadow flex flex-col sm:flex-row items-center gap-5">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-glow border-2 border-white/20 shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {avatar}
        </div>

        <div className="flex-1 text-center sm:text-left">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={16}
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white font-bold text-lg"
              />
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio..."
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white/80 text-xs"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-white">{profile.nickname}</h1>
              <p className="text-xs text-white/60 mt-1 max-w-sm">
                {profile.bio || "Testing friendships one honest truth at a time."}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Avatar & Color Picker while editing */}
      {isEditing && (
        <div className="p-5 rounded-3xl bg-surface/70 border border-surface-border space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
            Change Avatar & Color
          </span>

          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  avatarColor === c ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2 bg-black/30 rounded-2xl">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center ${
                  avatar === av ? "bg-white/20 ring-1 ring-white" : "hover:bg-white/10"
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface/70 border border-surface-border text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
            Games Played
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {profile.totalGames}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/70 border border-surface-border text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
            Victories
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            {profile.gamesWon}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/70 border border-surface-border text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
            Win Rate
          </span>
          <span className="text-2xl font-black text-electric-pink font-mono mt-1 block">
            {winRate}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/70 border border-surface-border text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
            Fav Mode
          </span>
          <span className="text-sm font-black text-electric-cyan truncate mt-2 block">
            {profile.favoriteMode}
          </span>
        </div>
      </div>

      {/* Achievements / Badges */}
      <div className="p-6 rounded-3xl bg-surface/85 border border-surface-border shadow-card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-electric-purple" />
          <h2 className="text-base font-black text-white uppercase tracking-wider">
            Achievements & Badges
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = profile.badges.includes(ach.id) || profile.totalGames >= 1;
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? "bg-black/30 border-white/10"
                    : "bg-black/10 border-white/5 opacity-40 grayscale"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  {ach.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{ach.title}</span>
                  <span className="text-[10px] text-white/60">{ach.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


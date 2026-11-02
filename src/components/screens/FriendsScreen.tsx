"use client";

import React, { useState } from "react";
import { userStore, Friend } from "@/lib/userStore";
import { sound } from "@/lib/sound";
import { Users, UserPlus, Share2, Copy, Check, MessageSquare } from "lucide-react";

interface FriendsScreenProps {
  onBack: () => void;
  onInviteToRoom?: (friend: Friend) => void;
}

export function FriendsScreen({ onBack, onInviteToRoom }: FriendsScreenProps) {
  const [friends, setFriends] = useState<Friend[]>(userStore.getFriends());
  const [newFriendName, setNewFriendName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    sound.success();
    const friend = userStore.addFriend(newFriendName.trim());
    setFriends([...friends, friend]);
    setNewFriendName("");
  };

  const handleInvite = (friend: Friend) => {
    sound.click();
    onInviteToRoom?.(friend);
    setCopiedId(friend.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Friends & Players</h1>
          <p className="text-xs text-white/60">Invite friends or join their private lobbies</p>
        </div>
        <button
          onClick={() => {
            sound.click();
            onBack();
          }}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
        >
          Back
        </button>
      </div>

      {/* Add Friend Input */}
      <form
        onSubmit={handleAddFriend}
        className="p-4 rounded-3xl bg-surface/85 border border-surface-border shadow-card-shadow flex items-center gap-2"
      >
        <input
          type="text"
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          placeholder="Enter friend's nickname..."
          className="flex-1 px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-electric-violet"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-electric-violet to-electric-pink text-white font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Friends List */}
      <div className="space-y-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="p-4 rounded-2xl bg-surface/70 border border-surface-border flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md"
                style={{ backgroundColor: friend.avatarColor }}
              >
                {friend.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">{friend.name}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      friend.isOnline ? "bg-emerald-400 shadow-glow" : "bg-white/30"
                    }`}
                  />
                </div>
                <span className="text-[11px] text-white/50">{friend.statusText}</span>
              </div>
            </div>

            <button
              onClick={() => handleInvite(friend)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-electric-purple text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              {copiedId === friend.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Invited!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Invite</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


import { UserProfile, GameMode } from "@/types/game";
import { supabase, isSupabaseConfigured } from "@/supabase/client";

const USER_STORAGE_KEY = "insight_user_profile";
const FRIENDS_STORAGE_KEY = "insight_friends_list";
const HISTORY_STORAGE_KEY = "insight_game_history";

export const AVATAR_OPTIONS = [
  "🦊", "🦄", "🚀", "⚡", "🔮", "🔥", "🐱", "🐶", "🐼", "🦁",
  "🐸", "🐙", "🌸", "⭐", "💎", "🎭", "🍕", "🛸", "🕶️", "👑"
];

export const COLOR_OPTIONS = [
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#eab308", // Yellow
  "#6366f1", // Indigo
  "#ef4444", // Red
];

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  isOnline: boolean;
  statusText?: string;
}

export interface GameHistoryEntry {
  id: string;
  roomCode: string;
  gameMode: GameMode;
  rounds: number;
  winnerName: string;
  winnerScore: number;
  myRank: number;
  myScore: number;
  date: string;
}

export const ACHIEVEMENTS = [
  { id: "mind_reader", title: "Mind Reader", desc: "Predicted 5 target answers correctly", icon: "🧠" },
  { id: "master_deceiver", title: "Master Deceiver", desc: "Won Blackout mode without getting caught", icon: "🎭" },
  { id: "party_legend", title: "Party Legend", desc: "Played over 10 games with friends", icon: "👑" },
  { id: "speed_demon", title: "Speed Demon", desc: "Submitted answer first in Battle mode", icon: "⚡" },
  { id: "comedian", title: "Crowd Favorite", desc: "Received most funny votes in a round", icon: "😂" },
  { id: "deep_soul", title: "Deep Soul", desc: "Shared a heartfelt answer in Deep mode", icon: "✨" },
];

class UserStore {
  private profile: UserProfile | null = null;

  public getProfile(): UserProfile {
    if (this.profile) return this.profile;

    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        try {
          this.profile = JSON.parse(raw);
          return this.profile!;
        } catch {}
      }

      // Generate default profile
      const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
      const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
      const defaultProfile: UserProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        nickname: `Player_${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: randomAvatar,
        avatarColor: randomColor,
        bio: "Ready to test friendships and tell truths!",
        totalGames: 0,
        gamesWon: 0,
        favoriteMode: "CLASSIC",
        badges: ["mind_reader"],
      };

      this.saveProfile(defaultProfile);
      return defaultProfile;
    }

    return {
      id: "usr_guest",
      nickname: "Guest",
      avatar: "🦊",
      avatarColor: "#8b5cf6",
      bio: "",
      totalGames: 0,
      gamesWon: 0,
      favoriteMode: "CLASSIC",
      badges: [],
    };
  }

  public saveProfile(profile: UserProfile) {
    this.profile = profile;
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    }

    // Sync to Supabase if logged in
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.getUser().then(({ data }) => {
        if (data.user) {
          client
            .from("profiles")
            .upsert({
              id: data.user.id,
              nickname: profile.nickname,
              avatar: profile.avatar,
              avatar_color: profile.avatarColor,
              bio: profile.bio,
              total_games: profile.totalGames,
              games_won: profile.gamesWon,
              favorite_mode: profile.favoriteMode,
              badges: profile.badges,
              updated_at: new Date().toISOString(),
            })
            .then(() => {});
        }
      });
    }
  }

  public recordGameComplete(entry: GameHistoryEntry, won: boolean) {
    const prof = this.getProfile();
    prof.totalGames += 1;
    if (won) prof.gamesWon += 1;
    this.saveProfile(prof);

    // Save to history
    if (typeof window !== "undefined") {
      const history = this.getHistory();
      history.unshift(entry);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
    }
  }

  public getHistory(): GameHistoryEntry[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public getFriends(): Friend[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!raw) {
      // Default sample friends
      const defaults: Friend[] = [
        { id: "f_1", name: "Sarah M.", avatar: "🦄", avatarColor: "#ec4899", isOnline: true, statusText: "Playing Classic" },
        { id: "f_2", name: "David K.", avatar: "⚡", avatarColor: "#f97316", isOnline: true, statusText: "In Lobby" },
        { id: "f_3", name: "Elena R.", avatar: "🔮", avatarColor: "#06b6d4", isOnline: false, statusText: "Offline" },
      ];
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public addFriend(name: string, avatar: string = "🦊", color: string = "#8b5cf6"): Friend {
    const friends = this.getFriends();
    const newFriend: Friend = {
      id: `f_${Date.now()}`,
      name,
      avatar,
      avatarColor: color,
      isOnline: true,
      statusText: "Just added",
    };
    friends.push(newFriend);
    if (typeof window !== "undefined") {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
    }
    return newFriend;
  }
}

export const userStore = new UserStore();

import {
  GameMode,
  Player,
  Question,
  RoomState,
  RoomStatus,
  Submission,
  GameSettings,
  Reaction,
} from "@/types/game";
import { pickRandomQuestions, formatQuestionText } from "@/data/questions";
import { supabase, isSupabaseConfigured } from "@/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Storage keys
const ROOM_STORAGE_PREFIX = "insight_room_";

// Helper to generate a 6-character clean room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, O, 0, 1 for legibility
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Bot personas for instant testing & solo/party filling
export const BOT_PLAYERS: Omit<Player, "id" | "sessionId">[] = [
  {
    name: "Maya",
    avatar: "🦊",
    avatarColor: "#ec4899",
    isHost: false,
    isReady: true,
    score: 0,
    roundScore: 0,
    streak: 0,
    isConnected: true,
  },
  {
    name: "Leo",
    avatar: "🚀",
    avatarColor: "#8b5cf6",
    isHost: false,
    isReady: true,
    score: 0,
    roundScore: 0,
    streak: 0,
    isConnected: true,
  },
  {
    name: "Chloe",
    avatar: "⚡",
    avatarColor: "#f97316",
    isHost: false,
    isReady: true,
    score: 0,
    roundScore: 0,
    streak: 0,
    isConnected: true,
  },
  {
    name: "Sam",
    avatar: "🔮",
    avatarColor: "#06b6d4",
    isHost: false,
    isReady: true,
    score: 0,
    roundScore: 0,
    streak: 0,
    isConnected: true,
  },
];

const BOT_QUIPS: Record<string, string[]> = {
  Funny: [
    "Stealing all the complimentary hotel soaps in broad daylight.",
    "Eating shredded cheese straight from the bag at 3:17 AM.",
    "Accidentally liking a 7-year-old Instagram vacation photo.",
    "Thinking they could beat a goose in hand-to-hand combat.",
  ],
  Friendship: [
    "Always bringing an extra iced coffee just in case.",
    "Singing terrible karaoke at maximum volume with zero shame.",
    "Being the only person who actually responds to the group chat.",
    "Giving brutally honest outfit advice before we walk out the door.",
  ],
  Personality: [
    "Setting 14 different alarms 5 minutes apart and sleeping through 12.",
    "Refusing to ask for directions even when lost in another state.",
    "Overthinking a two-word text for three consecutive hours.",
    "100% chaotic good with an obsession for thrift stores.",
  ],
  Embarrassing: [
    "Tripping over a completely flat sidewalk and turning it into a jog.",
    "Waving vigorously back at someone who was waving to their dog.",
    "Saying 'You too!' when the waiter said 'Enjoy your meal!'.",
    "Falling asleep on a public train and missing the stop by 40 miles.",
  ],
  Relationships: [
    "Judging someone solely on whether they like horror films.",
    "Writing a 5-paragraph text, deleting it, and replying 'k'.",
    "Planning our wedding after making eye contact for 2 seconds.",
    "Ordering dessert first because life is unpredictable.",
  ],
  Childhood: [
    "Believing quicksand was going to be a daily adult hazard.",
    "Wearing mismatched neon socks and thinking it was high fashion.",
    "Constructing an impenetrable living room blanket fortress.",
    "Begging for a pet raccoon for five years straight.",
  ],
  Deep: [
    "Learning to be completely at peace with outgrowing old habits.",
    "Surrounding yourself with people who make you feel safe to fail.",
    "Knowing that true happiness is having an empty schedule on Sunday.",
    "Forgiving yourself for things you didn't know back then.",
  ],
  Hypothetical: [
    "Teleportation, but only if I can bring unlimited snacks.",
    "A tiny pocket-sized pet grizzly bear that does high fives.",
    "Erasing alarm clocks from existence forever.",
    "Building an underground bunker with high-speed fiber internet.",
  ],
  Spicy: [
    "A spontaneous midnight road trip to the beach with no plans.",
    "Leaving little flirty handwritten notes in unexpected places.",
    "Confidence and a sharp sense of humor are unbeatable.",
    "The secret late-night playlist nobody is allowed to see.",
  ],
  Random: [
    "Can recite every line from Shrek 2 from memory.",
    "An unexplainable fear of revolving doors.",
    "Always eating pizza crust first because chaos rules.",
    "Believes cereal is technically cold soup.",
  ],
};

// Cross-tab and Broadcast Channel
class MultiplayerManager {
  private channels: Map<string, BroadcastChannel> = new Map();
  private subscribers: Map<string, Set<(room: RoomState) => void>> = new Map();
  private reactionSubscribers: Map<string, Set<(reaction: Reaction) => void>> = new Map();

  private getChannel(roomCode: string): BroadcastChannel | null {
    if (typeof window === "undefined") return null;
    if (!this.channels.has(roomCode)) {
      const channel = new BroadcastChannel(`insight_room_${roomCode}`);
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === "SYNC_ROOM") {
          this.notifySubscribers(payload.code, payload);
        } else if (type === "REACTION") {
          this.notifyReaction(payload.roomCode, payload.reaction);
        }
      };
      this.channels.set(roomCode, channel);
    }
    return this.channels.get(roomCode)!;
  }

  public subscribe(roomCode: string, callback: (room: RoomState) => void): () => void {
    if (!this.subscribers.has(roomCode)) {
      this.subscribers.set(roomCode, new Set());
    }
    this.subscribers.get(roomCode)!.add(callback);

    // Initial load from storage
    const room = this.getRoom(roomCode);
    if (room) {
      callback(room);
    }

    // Fetch latest room from backend
    fetch(`/api/rooms/${roomCode}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.room) {
          localStorage.setItem(`${ROOM_STORAGE_PREFIX}${roomCode}`, JSON.stringify(data.room));
          this.notifySubscribers(roomCode, data.room);
        }
      })
      .catch(() => {});

    // Fast polling fallback for cross-device synchronization over the internet
    const pollInterval = setInterval(() => {
      fetch(`/api/rooms/${roomCode}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.room) {
            const current = this.getRoom(roomCode);
            // Only update if state changed
            if (JSON.stringify(current) !== JSON.stringify(data.room)) {
              localStorage.setItem(`${ROOM_STORAGE_PREFIX}${roomCode}`, JSON.stringify(data.room));
              this.notifySubscribers(roomCode, data.room);
            }
          }
        })
        .catch(() => {});
    }, 1500);

    // Set up Supabase Realtime channel if configured
    let supabaseChannel: RealtimeChannel | null = null;
    if (isSupabaseConfigured && supabase) {
      supabaseChannel = supabase
        .channel(`room_${roomCode}`)
        .on("broadcast", { event: "SYNC_ROOM" }, ({ payload }) => {
          this.saveRoom(payload, false);
          this.notifySubscribers(roomCode, payload);
        })
        .on("broadcast", { event: "REACTION" }, ({ payload }) => {
          this.notifyReaction(roomCode, payload);
        })
        .subscribe();
    }

    return () => {
      clearInterval(pollInterval);
      this.subscribers.get(roomCode)?.delete(callback);
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }

  public subscribeReactions(roomCode: string, callback: (reaction: Reaction) => void): () => void {
    if (!this.reactionSubscribers.has(roomCode)) {
      this.reactionSubscribers.set(roomCode, new Set());
    }
    this.reactionSubscribers.get(roomCode)!.add(callback);
    return () => {
      this.reactionSubscribers.get(roomCode)?.delete(callback);
    };
  }

  private notifySubscribers(roomCode: string, room: RoomState) {
    this.subscribers.get(roomCode)?.forEach((cb) => cb(room));
  }

  private notifyReaction(roomCode: string, reaction: Reaction) {
    this.reactionSubscribers.get(roomCode)?.forEach((cb) => cb(reaction));
  }

  public getRoom(roomCode: string): RoomState | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(`${ROOM_STORAGE_PREFIX}${roomCode.toUpperCase()}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RoomState;
    } catch {
      return null;
    }
  }

  public saveRoom(room: RoomState, broadcast: boolean = true) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${ROOM_STORAGE_PREFIX}${room.code}`, JSON.stringify(room));
    
    // Sync to API / cloud backend
    fetch(`/api/rooms/${room.code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    }).catch(() => {});

    if (broadcast) {
      const channel = this.getChannel(room.code);
      channel?.postMessage({ type: "SYNC_ROOM", payload: room });

      if (isSupabaseConfigured && supabase) {
        supabase.channel(`room_${room.code}`).send({
          type: "broadcast",
          event: "SYNC_ROOM",
          payload: room,
        });
      }
    }
    this.notifySubscribers(room.code, room);
  }

  public createRoom(
    hostName: string,
    avatar: string,
    avatarColor: string,
    sessionId: string,
    mode: GameMode = "CLASSIC",
    settings?: Partial<GameSettings>
  ): RoomState {
    const code = generateRoomCode();
    const hostPlayer: Player = {
      id: `p_${sessionId}`,
      sessionId,
      name: hostName,
      avatar,
      avatarColor,
      isHost: true,
      isReady: true,
      score: 0,
      roundScore: 0,
      streak: 0,
      isConnected: true,
    };

    const initialSettings: GameSettings = {
      roundTimer: settings?.roundTimer || 30,
      totalRounds: settings?.totalRounds || 5,
      categories: settings?.categories || [
        "Funny",
        "Friendship",
        "Personality",
        "Embarrassing",
        "Deep",
      ],
      intensity: settings?.intensity || "medium",
      allowSpectators: settings?.allowSpectators ?? true,
      soundEffects: settings?.soundEffects ?? true,
    };

    const room: RoomState = {
      code,
      hostId: hostPlayer.id,
      gameMode: mode,
      status: "LOBBY",
      currentRound: 0,
      totalRounds: initialSettings.totalRounds,
      timer: initialSettings.roundTimer,
      timerRunning: false,
      players: [hostPlayer],
      submissions: [],
      votes: {},
      reactions: [],
      settings: initialSettings,
      createdAt: Date.now(),
    };

    this.saveRoom(room);
    return room;
  }

  public async joinRoom(
    roomCode: string,
    playerName: string,
    avatar: string,
    avatarColor: string,
    sessionId: string
  ): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    let room = this.getRoom(roomCode);
    if (!room) {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.room) {
            room = data.room;
          }
        }
      } catch {}
    }

    if (!room) {
      return { success: false, error: "Room not found. Check code and try again." };
    }

    if (room.status !== "LOBBY") {
      return { success: false, error: "Game is already in progress in this room." };
    }

    const playerId = `p_${sessionId}`;
    const existingIndex = room.players.findIndex((p) => p.id === playerId || p.sessionId === sessionId);

    if (existingIndex >= 0) {
      // Reconnecting existing player
      room.players[existingIndex].name = playerName;
      room.players[existingIndex].avatar = avatar;
      room.players[existingIndex].avatarColor = avatarColor;
      room.players[existingIndex].isConnected = true;
    } else {
      if (room.players.length >= 10) {
        return { success: false, error: "Room is full (maximum 10 players)." };
      }
      room.players.push({
        id: playerId,
        sessionId,
        name: playerName,
        avatar,
        avatarColor,
        isHost: false,
        isReady: false,
        score: 0,
        roundScore: 0,
        streak: 0,
        isConnected: true,
      });
    }

    this.saveRoom(room);
    return { success: true, room };
  }

  public toggleReady(roomCode: string, playerId: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;
    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.isReady = !player.isReady;
      this.saveRoom(room);
    }
    return room;
  }

  public updateSettings(
    roomCode: string,
    hostPlayerId: string,
    updates: {
      gameMode?: GameMode;
      settings?: Partial<GameSettings>;
    }
  ): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== hostPlayerId) return null;

    if (updates.gameMode) {
      room.gameMode = updates.gameMode;
    }
    if (updates.settings) {
      room.settings = { ...room.settings, ...updates.settings };
      if (updates.settings.totalRounds) {
        room.totalRounds = updates.settings.totalRounds;
      }
      if (updates.settings.roundTimer) {
        room.timer = updates.settings.roundTimer;
      }
    }

    this.saveRoom(room);
    return room;
  }

  public addBot(roomCode: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room || room.players.length >= 10) return null;

    const availableBots = BOT_PLAYERS.filter(
      (b) => !room.players.some((p) => p.name === b.name)
    );
    const botTemplate = availableBots[0] || BOT_PLAYERS[0];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const bot: Player = {
      ...botTemplate,
      id: botId,
      sessionId: botId,
      name: `${botTemplate.name} (AI)`,
    };

    room.players.push(bot);
    this.saveRoom(room);
    return room;
  }

  public removePlayer(roomCode: string, playerId: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    room.players = room.players.filter((p) => p.id !== playerId);
    // If host left, assign new host if any remain
    if (room.hostId === playerId && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
    }

    this.saveRoom(room);
    return room;
  }

  public startGame(roomCode: string, hostPlayerId: string): { success: boolean; room?: RoomState; error?: string } {
    const room = this.getRoom(roomCode);
    if (!room) return { success: false, error: "Room not found" };
    if (room.hostId !== hostPlayerId) return { success: false, error: "Only host can start the game" };
    if (room.players.length < 2) return { success: false, error: "Need at least 2 players to start" };

    // Reset scores
    room.players.forEach((p) => {
      p.score = 0;
      p.roundScore = 0;
      p.streak = 0;
      p.hasSubmitted = false;
      p.hasVoted = false;
    });

    room.currentRound = 1;
    this.setupRound(room);
    this.saveRoom(room);
    return { success: true, room };
  }

  private setupRound(room: RoomState) {
    room.status = "QUESTION";
    room.submissions = [];
    room.votes = {};
    room.timer = room.settings.roundTimer;
    room.timerRunning = true;

    // Reset player round flags
    room.players.forEach((p) => {
      p.roundScore = 0;
      p.hasSubmitted = false;
      p.hasVoted = false;
      p.role = undefined;
    });

    // 1. Classic Mode: Rotate focus player
    if (room.gameMode === "CLASSIC") {
      const targetIdx = (room.currentRound - 1) % room.players.length;
      room.targetPlayerId = room.players[targetIdx].id;
      room.players[targetIdx].role = "SUBJECT";
      room.players.forEach((p) => {
        if (p.id !== room.targetPlayerId) {
          p.role = "INQUIRER";
        }
      });
    }

    // 2. Blackout Mode: Select secret odd one out
    if (room.gameMode === "BLACKOUT") {
      const oddIdx = Math.floor(Math.random() * room.players.length);
      room.oddOneOutId = room.players[oddIdx].id;
      room.players[oddIdx].role = "ODD_ONE_OUT";
      room.players.forEach((p) => {
        if (p.id !== room.oddOneOutId) {
          p.role = "INNOCENT";
        }
      });
    }

    // Pick question
    const questions = pickRandomQuestions(1, {
      gameMode: room.gameMode,
      categories: room.settings.categories,
      intensity: room.settings.intensity,
      excludeSpicy: room.settings.intensity !== "spicy",
      questionSource: room.settings.questionSource,
      customQuestions: room.settings.customQuestions,
    });

    const targetPlayer = room.players.find((p) => p.id === room.targetPlayerId);
    if (questions[0]) {
      const rawQ = questions[0];
      room.currentQuestion = {
        ...rawQ,
        text: formatQuestionText(rawQ.text, targetPlayer?.name),
      };
    }

    // Automatically trigger bot answers after realistic delay
    this.scheduleBotAnswers(room.code);
  }

  private scheduleBotAnswers(roomCode: string) {
    setTimeout(() => {
      const room = this.getRoom(roomCode);
      if (!room || room.status !== "ANSWERING") return;

      const bots = room.players.filter((p) => p.id.startsWith("bot_") && !p.hasSubmitted);
      bots.forEach((bot, idx) => {
        setTimeout(() => {
          const cat = room.currentQuestion?.category || "Funny";
          const pool = BOT_QUIPS[cat] || BOT_QUIPS.Funny;
          const randomAnswer = pool[Math.floor(Math.random() * pool.length)];
          this.submitAnswer(room.code, bot.id, randomAnswer);
        }, 1200 + idx * 1000);
      });
    }, 2500);
  }

  public setAnsweringPhase(roomCode: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;
    room.status = "ANSWERING";
    room.timer = room.settings.roundTimer;
    this.saveRoom(room);
    this.scheduleBotAnswers(roomCode);
    return room;
  }

  public submitAnswer(roomCode: string, playerId: string, answer: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return null;

    // Prevent duplicate answer
    const existing = room.submissions.find((s) => s.playerId === playerId);
    if (existing) {
      existing.answer = answer.trim();
    } else {
      room.submissions.push({
        id: `sub_${Date.now()}_${playerId}`,
        playerId,
        playerName: player.name,
        playerAvatar: player.avatar,
        answer: answer.trim(),
        isSubjectAnswer: player.id === room.targetPlayerId,
        revealed: false,
        votesCount: 0,
        votedBy: [],
      });
    }

    player.hasSubmitted = true;

    // Check if all players submitted
    const allSubmitted = room.players.every((p) => p.hasSubmitted);
    if (allSubmitted) {
      room.status = "REVEAL";
      room.timerRunning = false;
    }

    this.saveRoom(room);
    return room;
  }

  public advanceToVoting(roomCode: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    room.status = "VOTING";
    room.timer = 25;
    room.timerRunning = true;

    // Bot automatic voting
    setTimeout(() => {
      const current = this.getRoom(roomCode);
      if (!current || current.status !== "VOTING") return;
      const bots = current.players.filter((p) => p.id.startsWith("bot_") && !p.hasVoted);

      bots.forEach((bot, idx) => {
        setTimeout(() => {
          let targetId = "";
          if (current.gameMode === "BLACKOUT") {
            // Vote for random non-bot or odd-one-out
            const nonBots = current.players.filter((p) => p.id !== bot.id);
            const pick = nonBots[Math.floor(Math.random() * nonBots.length)];
            targetId = pick?.id || "";
          } else {
            // Vote for an answer that is not their own
            const validSubs = current.submissions.filter((s) => s.playerId !== bot.id);
            const pick = validSubs[Math.floor(Math.random() * validSubs.length)];
            targetId = pick?.id || "";
          }
          if (targetId) {
            this.submitVote(roomCode, bot.id, targetId);
          }
        }, 1000 + idx * 800);
      });
    }, 1500);

    this.saveRoom(room);
    return room;
  }

  public submitVote(roomCode: string, voterId: string, targetId: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    const voter = room.players.find((p) => p.id === voterId);
    if (!voter) return null;

    room.votes[voterId] = targetId;
    voter.hasVoted = true;

    // Tally vote on submission if applicable
    const sub = room.submissions.find((s) => s.id === targetId || s.playerId === targetId);
    if (sub) {
      sub.votesCount = (sub.votesCount || 0) + 1;
      if (!sub.votedBy) sub.votedBy = [];
      if (!sub.votedBy.includes(voterId)) {
        sub.votedBy.push(voterId);
      }
    }

    // Check if all players (or all eligible voters) have voted
    let eligibleVoters = room.players;
    if (room.gameMode === "CLASSIC" && room.targetPlayerId) {
      // In Classic, target player votes on which prediction was closest/funniest!
    }

    const allVoted = eligibleVoters.every((p) => p.hasVoted);
    if (allVoted) {
      this.calculateRoundScores(room);
      room.status = "ROUND_RESULT";
      room.timerRunning = false;
    }

    this.saveRoom(room);
    return room;
  }

  public calculateRoundScores(room: RoomState) {
    // Reset round scores
    room.players.forEach((p) => {
      p.roundScore = 0;
    });

    if (room.gameMode === "CLASSIC") {
      // Predictions about target player:
      // If target player picked a prediction as "Closest" or "Correct", that player earns 150 pts.
      const targetPlayerVote = room.votes[room.targetPlayerId || ""];
      room.players.forEach((player) => {
        if (player.id !== room.targetPlayerId) {
          const playerSub = room.submissions.find((s) => s.playerId === player.id);
          if (playerSub && targetPlayerVote === playerSub.id) {
            player.roundScore += 150;
            player.streak += 1;
          } else {
            // Check community votes
            const votesForMe = (playerSub?.votesCount || 0);
            if (votesForMe > 0) {
              player.roundScore += votesForMe * 50;
            }
          }
        }
      });
      // Target player gets points for engaging
      const targetPlayer = room.players.find((p) => p.id === room.targetPlayerId);
      if (targetPlayer) {
        targetPlayer.roundScore += 100;
      }
    } else if (room.gameMode === "BLACKOUT") {
      // Blackout mode:
      // Innocent players vote on who they think is Odd One Out
      let caughtCount = 0;
      room.players.forEach((player) => {
        if (player.id !== room.oddOneOutId) {
          const vote = room.votes[player.id];
          if (vote === room.oddOneOutId) {
            player.roundScore += 120;
            player.streak += 1;
            caughtCount++;
          } else {
            player.streak = 0;
          }
        }
      });

      const oddPlayer = room.players.find((p) => p.id === room.oddOneOutId);
      if (oddPlayer) {
        // If the odd one out fooled majority or all players
        const innocentCount = room.players.length - 1;
        if (caughtCount === 0) {
          oddPlayer.roundScore += 250; // Flawless deception!
          oddPlayer.streak += 2;
        } else if (caughtCount <= Math.floor(innocentCount / 2)) {
          oddPlayer.roundScore += 150; // Partial deception
        }
      }
    } else if (room.gameMode === "BATTLE") {
      // Speed and vote bonuses
      room.submissions.forEach((sub, idx) => {
        const player = room.players.find((p) => p.id === sub.playerId);
        if (player) {
          // Speed order points
          const speedBonus = Math.max(20, 100 - idx * 25);
          const voteBonus = (sub.votesCount || 0) * 60;
          player.roundScore += speedBonus + voteBonus;
          if (sub.votesCount && sub.votesCount >= 2) {
            player.streak += 1;
          }
        }
      });
    } else {
      // TROUBLE, HOOT, TRASH, DEEP
      room.submissions.forEach((sub) => {
        const player = room.players.find((p) => p.id === sub.playerId);
        if (player) {
          const votePoints = (sub.votesCount || 0) * 80;
          player.roundScore += votePoints + 50; // Participation + votes
          if (sub.votesCount && sub.votesCount >= 2) {
            player.streak += 1;
          }
        }
      });
    }

    // Apply round scores to cumulative score
    room.players.forEach((p) => {
      p.score += p.roundScore;
    });

    // Sort players by score descending
    room.players.sort((a, b) => b.score - a.score);
  }

  public nextRound(roomCode: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    if (room.currentRound >= room.totalRounds) {
      room.status = "FINAL_RESULTS";
      room.timerRunning = false;
      this.saveRoom(room);
      return room;
    }

    room.currentRound += 1;
    this.setupRound(room);
    this.saveRoom(room);
    return room;
  }

  public sendReaction(roomCode: string, playerId: string, playerName: string, emoji: string) {
    const reaction: Reaction = {
      id: `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      playerId,
      playerName,
      emoji,
      timestamp: Date.now(),
    };

    const channel = this.getChannel(roomCode);
    channel?.postMessage({
      type: "REACTION",
      payload: { roomCode, reaction },
    });

    if (isSupabaseConfigured && supabase) {
      supabase.channel(`room_${roomCode}`).send({
        type: "broadcast",
        event: "REACTION",
        payload: reaction,
      });
    }

    this.notifyReaction(roomCode, reaction);
  }

  public rematch(roomCode: string): RoomState | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    room.status = "LOBBY";
    room.currentRound = 0;
    room.submissions = [];
    room.votes = {};
    room.players.forEach((p) => {
      p.score = 0;
      p.roundScore = 0;
      p.streak = 0;
      p.isReady = p.isHost;
      p.hasSubmitted = false;
      p.hasVoted = false;
    });

    this.saveRoom(room);
    return room;
  }
}

export const roomEngine = new MultiplayerManager();

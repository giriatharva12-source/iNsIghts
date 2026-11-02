import { z } from "zod";

export type GameMode =
  | "CLASSIC"
  | "BLACKOUT"
  | "TROUBLE"
  | "HOOT"
  | "TRASH"
  | "DEEP"
  | "BATTLE";

export type QuestionCategory =
  | "Funny"
  | "Friendship"
  | "Personality"
  | "Embarrassing"
  | "Relationships"
  | "Childhood"
  | "Deep"
  | "Hypothetical"
  | "Spicy"
  | "Random";

export type IntensityLevel = "mild" | "medium" | "spicy";

export type RoomStatus =
  | "LOBBY"
  | "QUESTION"
  | "ANSWERING"
  | "REVEAL"
  | "VOTING"
  | "ROUND_RESULT"
  | "FINAL_RESULTS";

export interface Player {
  id: string;
  sessionId: string;
  name: string;
  avatar: string;
  avatarColor: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  roundScore: number;
  streak: number;
  isConnected: boolean;
  role?: "SUBJECT" | "INQUIRER" | "ODD_ONE_OUT" | "INNOCENT";
  hasSubmitted?: boolean;
  hasVoted?: boolean;
}

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  suitableModes: GameMode[];
  intensity: IntensityLevel;
  targetType: "subject_based" | "all_players";
  language: string;
  impostorPrompt?: string; // Clue provided to odd one out in Blackout mode
}

export interface Submission {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  answer: string;
  isSubjectAnswer?: boolean;
  revealed?: boolean;
  votesCount?: number;
  votedBy?: string[]; // Player IDs who voted/predicted this answer
}

export interface Vote {
  voterId: string;
  targetId: string; // playerId or submissionId voted for
  round: number;
  voteType: "PREDICTION" | "BLACKOUT_GUESS" | "FUNNY_VOTE" | "RESONATE";
}

export interface Reaction {
  id: string;
  playerId: string;
  playerName: string;
  emoji: string;
  timestamp: number;
}

export interface GameSettings {
  roundTimer: number; // in seconds, e.g. 25
  totalRounds: number; // 3, 5, 7, 10
  categories: QuestionCategory[];
  intensity: IntensityLevel;
  allowSpectators: boolean;
  soundEffects: boolean;
}

export interface RoomState {
  code: string;
  hostId: string;
  gameMode: GameMode;
  status: RoomStatus;
  currentRound: number;
  totalRounds: number;
  timer: number;
  timerRunning: boolean;
  players: Player[];
  targetPlayerId?: string; // Focus player in Classic mode
  oddOneOutId?: string; // Odd one out in Blackout mode
  currentQuestion?: Question;
  submissions: Submission[];
  votes: Record<string, string>; // voterId -> targetId
  reactions: Reaction[];
  settings: GameSettings;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  avatarColor: string;
  bio: string;
  totalGames: number;
  gamesWon: number;
  favoriteMode: GameMode;
  badges: string[];
}

// Zod Validation Schemas
export const NicknameSchema = z
  .string()
  .min(2, "Nickname must be at least 2 characters")
  .max(16, "Nickname must be at most 16 characters")
  .regex(/^[a-zA-Z0-9_\-\s]+$/, "Only letters, numbers, spaces, and hyphens/underscores allowed");

export const RoomCodeSchema = z
  .string()
  .length(6, "Room code must be exactly 6 characters")
  .regex(/^[A-Z0-9]+$/, "Room code must consist of uppercase letters and numbers");

export const AnswerSubmissionSchema = z
  .string()
  .min(1, "Answer cannot be empty")
  .max(280, "Answer cannot exceed 280 characters");

export const QuestionCreateSchema = z.object({
  text: z.string().min(5, "Question must be at least 5 characters").max(300),
  category: z.enum([
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
  ]),
  suitableModes: z.array(
    z.enum(["CLASSIC", "BLACKOUT", "TROUBLE", "HOOT", "TRASH", "DEEP", "BATTLE"])
  ).min(1),
  intensity: z.enum(["mild", "medium", "spicy"]),
  targetType: z.enum(["subject_based", "all_players"]),
  language: z.string().default("en"),
  impostorPrompt: z.string().optional(),
});


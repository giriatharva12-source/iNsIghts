import { NextRequest, NextResponse } from "next/server";
import { RoomState } from "@/types/game";
import { supabase, isSupabaseConfigured } from "@/supabase/client";

// Global in-memory cache on the server (persists across requests on the same instance)
declare global {
  // eslint-disable-next-line no-var
  var __INSIGHT_ROOMS: Map<string, RoomState> | undefined;
}

if (!global.__INSIGHT_ROOMS) {
  global.__INSIGHT_ROOMS = new Map<string, RoomState>();
}

const memoryRooms = global.__INSIGHT_ROOMS;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  // 1. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", roomCode)
        .single();

      if (data && !error && data.settings) {
        const fullRoom: RoomState = {
          code: data.code,
          hostId: data.host_id || `p_${data.host_name}`,
          gameMode: data.game_mode,
          status: data.status,
          currentRound: data.current_round,
          totalRounds: data.total_rounds,
          timer: data.round_timer,
          timerRunning: data.status === "ANSWERING" || data.status === "VOTING",
          players: data.settings.players || [],
          submissions: data.settings.submissions || [],
          votes: data.settings.votes || {},
          reactions: [],
          settings: {
            roundTimer: data.round_timer,
            totalRounds: data.total_rounds,
            categories: data.categories || ["Funny", "Friendship", "Personality"],
            intensity: data.intensity_level || "medium",
            allowSpectators: true,
            soundEffects: true,
          },
          currentQuestion: data.current_question,
          targetPlayerId: data.target_player_id,
          oddOneOutId: data.odd_one_out_id,
          createdAt: new Date(data.created_at).getTime(),
        };
        memoryRooms.set(roomCode, fullRoom);
        return NextResponse.json({ success: true, room: fullRoom });
      }
    } catch {
      // Fallback to memory
    }
  }

  // 2. Check in-memory rooms
  const room = memoryRooms.get(roomCode);
  if (room) {
    return NextResponse.json({ success: true, room });
  }

  return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const body = (await req.json()) as RoomState;

  if (!body || body.code !== roomCode) {
    return NextResponse.json({ success: false, error: "Invalid room payload" }, { status: 400 });
  }

  // Save to memory
  memoryRooms.set(roomCode, body);

  // Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("rooms").upsert(
        {
          code: roomCode,
          host_name: body.players.find((p) => p.isHost)?.name || "Host",
          game_mode: body.gameMode,
          status: body.status,
          total_rounds: body.totalRounds,
          current_round: body.currentRound,
          round_timer: body.timer,
          categories: body.settings.categories,
          intensity_level: body.settings.intensity,
          current_question: body.currentQuestion,
          target_player_id: body.targetPlayerId,
          odd_one_out_id: body.oddOneOutId,
          settings: {
            players: body.players,
            submissions: body.submissions,
            votes: body.votes,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "code" }
      );
    } catch {
      // Supabase error ignored in fallback
    }
  }

  return NextResponse.json({ success: true, room: body });
}


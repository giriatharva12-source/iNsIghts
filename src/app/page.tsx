"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserProfile, RoomState, GameMode, Player, GameSettings, IntensityLevel, QuestionCategory } from "@/types/game";
import { userStore } from "@/lib/userStore";
import { roomEngine } from "@/lib/multiplayer/roomEngine";
import { Header } from "@/components/ui/Header";
import { ReactionLayer } from "@/components/ui/ReactionLayer";
import { SplashOnboardingScreen } from "@/components/screens/SplashOnboardingScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { CreateRoomModal } from "@/components/screens/CreateRoomModal";
import { JoinRoomModal } from "@/components/screens/JoinRoomModal";
import { LobbyScreen } from "@/components/screens/LobbyScreen";
import { QuestionScreen } from "@/components/screens/QuestionScreen";
import { AnswerScreen } from "@/components/screens/AnswerScreen";
import { RevealScreen } from "@/components/screens/RevealScreen";
import { VotingScreen } from "@/components/screens/VotingScreen";
import { RoundResultsScreen } from "@/components/screens/RoundResultsScreen";
import { FinalResultsScreen } from "@/components/screens/FinalResultsScreen";
import { FriendsScreen } from "@/components/screens/FriendsScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { AdminScreen } from "@/components/screens/AdminScreen";
import { sound } from "@/lib/sound";

export default function GameApp() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<string>("home");

  // Room state
  const [room, setRoom] = useState<RoomState | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedInitialMode, setSelectedInitialMode] = useState<GameMode>("CLASSIC");
  const [errorToast, setErrorToast] = useState<string>("");

  // Initialize Profile and check URL join params
  useEffect(() => {
    const prof = userStore.getProfile();
    setProfile(prof);

    // If nickname is default, ask for onboarding
    const isDefault = prof.nickname.startsWith("Player_") && prof.totalGames === 0;
    setHasOnboarded(!isDefault);

    // Check if invite link was opened with ?join=CODE
    const searchParams = new URLSearchParams(window.location.search);
    const joinCode = searchParams.get("join");
    if (joinCode) {
      handleJoinRoom(joinCode.toUpperCase());
    }
  }, []);

  // Room synchronization hook
  useEffect(() => {
    if (!room?.code) return;

    const unsubscribe = roomEngine.subscribe(room.code, (updatedRoom) => {
      setRoom({ ...updatedRoom });

      // Synchronize screen with room status
      if (updatedRoom.status === "LOBBY") {
        setCurrentScreen("lobby");
      } else if (updatedRoom.status === "QUESTION") {
        setCurrentScreen("question");
      } else if (updatedRoom.status === "ANSWERING") {
        setCurrentScreen("answering");
      } else if (updatedRoom.status === "REVEAL") {
        setCurrentScreen("reveal");
      } else if (updatedRoom.status === "VOTING") {
        setCurrentScreen("voting");
      } else if (updatedRoom.status === "ROUND_RESULT") {
        setCurrentScreen("round_result");
      } else if (updatedRoom.status === "FINAL_RESULTS") {
        setCurrentScreen("final_results");
      }
    });

    return () => unsubscribe();
  }, [room?.code]);

  const showToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 3500);
  };

  // Find current player in the room
  const currentPlayer = room?.players.find(
    (p) => p.sessionId === profile?.id || p.id === `p_${profile?.id}`
  ) || {
    id: `p_${profile?.id || "guest"}`,
    sessionId: profile?.id || "guest",
    name: profile?.nickname || "Player",
    avatar: profile?.avatar || "🦊",
    avatarColor: profile?.avatarColor || "#8b5cf6",
    isHost: room?.hostId === `p_${profile?.id || "guest"}`,
    isReady: false,
    score: 0,
    roundScore: 0,
    streak: 0,
    isConnected: true,
  };

  // 1. Create Room
  const handleOpenCreateRoom = (mode: GameMode = "CLASSIC") => {
    setSelectedInitialMode(mode);
    setIsCreateOpen(true);
  };

  const handleConfirmCreateRoom = (
    mode: GameMode,
    settings: {
      totalRounds: number;
      roundTimer: number;
      categories: QuestionCategory[];
      intensity: IntensityLevel;
    }
  ) => {
    if (!profile) return;
    const newRoom = roomEngine.createRoom(
      profile.nickname,
      profile.avatar,
      profile.avatarColor,
      profile.id,
      mode,
      settings
    );
    setRoom(newRoom);
    setIsCreateOpen(false);
    setCurrentScreen("lobby");
  };

  // 2. Join Room
  const handleJoinRoom = async (code: string) => {
    if (!profile) return;
    const res = await roomEngine.joinRoom(
      code,
      profile.nickname,
      profile.avatar,
      profile.avatarColor,
      profile.id
    );
    if (res.success && res.room) {
      setRoom(res.room);
      setIsJoinOpen(false);
      setCurrentScreen("lobby");
      sound.success();
    } else {
      showToast(res.error || "Could not join room.");
      sound.buzzer();
    }
  };

  // 3. Quick Play
  const handleQuickPlay = () => {
    if (!profile) return;
    sound.click();
    // Instantly generate a room and populate with 2 AI companions so solo user can test immediately!
    const newRoom = roomEngine.createRoom(
      profile.nickname,
      profile.avatar,
      profile.avatarColor,
      profile.id,
      "CLASSIC",
      {
        roundTimer: 25,
        totalRounds: 3,
        categories: ["Funny", "Personality", "Friendship"],
        intensity: "medium",
      }
    );

    // Add 2 AI bots
    roomEngine.addBot(newRoom.code);
    roomEngine.addBot(newRoom.code);

    const loaded = roomEngine.getRoom(newRoom.code);
    setRoom(loaded || newRoom);
    setCurrentScreen("lobby");
  };

  // Lobby actions
  const handleToggleReady = () => {
    if (!room) return;
    const updated = roomEngine.toggleReady(room.code, currentPlayer.id);
    if (updated) setRoom({ ...updated });
  };

  const handleStartGame = () => {
    if (!room) return;
    const res = roomEngine.startGame(room.code, currentPlayer.id);
    if (res.success && res.room) {
      setRoom({ ...res.room });
      setCurrentScreen("question");
    } else {
      showToast(res.error || "Cannot start game");
    }
  };

  const handleAddBot = () => {
    if (!room) return;
    const updated = roomEngine.addBot(room.code);
    if (updated) setRoom({ ...updated });
  };

  const handleLeaveRoom = () => {
    if (room) {
      roomEngine.removePlayer(room.code, currentPlayer.id);
    }
    setRoom(null);
    setCurrentScreen("home");
  };

  // Game Arena Transitions
  const handleProceedToAnswer = () => {
    if (!room) return;
    const updated = roomEngine.setAnsweringPhase(room.code);
    if (updated) {
      setRoom({ ...updated });
      setCurrentScreen("answering");
    }
  };

  const handleSubmitAnswer = (answerText: string) => {
    if (!room) return;
    const updated = roomEngine.submitAnswer(room.code, currentPlayer.id, answerText);
    if (updated) {
      setRoom({ ...updated });
      if (updated.status === "REVEAL") {
        setCurrentScreen("reveal");
      }
    }
  };

  const handleAdvanceToVoting = () => {
    if (!room) return;
    const updated = roomEngine.advanceToVoting(room.code);
    if (updated) {
      setRoom({ ...updated });
      setCurrentScreen("voting");
    }
  };

  const handleSubmitVote = (targetId: string) => {
    if (!room) return;
    const updated = roomEngine.submitVote(room.code, currentPlayer.id, targetId);
    if (updated) {
      setRoom({ ...updated });
      if (updated.status === "ROUND_RESULT") {
        setCurrentScreen("round_result");
      }
    }
  };

  const handleNextRound = () => {
    if (!room) return;
    const updated = roomEngine.nextRound(room.code);
    if (updated) {
      setRoom({ ...updated });
      if (updated.status === "FINAL_RESULTS") {
        setCurrentScreen("final_results");
      } else {
        setCurrentScreen("question");
      }
    }
  };

  const handleRematch = () => {
    if (!room) return;
    const updated = roomEngine.rematch(room.code);
    if (updated) {
      setRoom({ ...updated });
      setCurrentScreen("lobby");
    }
  };

  if (!profile) return null;

  // If user hasn't chosen their identity, show Onboarding
  if (!hasOnboarded) {
    return (
      <SplashOnboardingScreen
        onComplete={(newProf) => {
          setProfile(newProf);
          setHasOnboarded(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-white relative">
      {/* Top Navigation Header */}
      <Header
        profile={profile}
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        roomCode={room?.code}
      />

      {/* Floating Reaction Layer (Active during game rooms) */}
      {room && (
        <ReactionLayer
          roomCode={room.code}
          playerId={currentPlayer.id}
          playerName={currentPlayer.name}
        />
      )}

      {/* Error / Alert Toast */}
      {errorToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-2xl shadow-glow text-xs font-bold animate-bounce">
          {errorToast}
        </div>
      )}

      {/* Main Screen Router */}
      <main className="flex-1 w-full">
        {currentScreen === "home" && (
          <HomeScreen
            profile={profile}
            onCreateRoom={(mode) => handleOpenCreateRoom(mode)}
            onJoinRoom={() => setIsJoinOpen(true)}
            onQuickPlay={handleQuickPlay}
            onSelectModeInfo={(mode) => handleOpenCreateRoom(mode)}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {currentScreen === "lobby" && room && (
          <LobbyScreen
            room={room}
            currentPlayer={currentPlayer}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onAddBot={handleAddBot}
            onLeaveRoom={handleLeaveRoom}
            onKickPlayer={(targetId) => {
              const updated = roomEngine.removePlayer(room.code, targetId);
              if (updated) setRoom({ ...updated });
            }}
          />
        )}

        {currentScreen === "question" && room && (
          <QuestionScreen
            room={room}
            currentPlayer={currentPlayer}
            onProceedToAnswer={handleProceedToAnswer}
          />
        )}

        {currentScreen === "answering" && room && (
          <AnswerScreen
            room={room}
            currentPlayer={currentPlayer}
            onSubmitAnswer={handleSubmitAnswer}
            onTimeUp={() => {
              // When time is up, advance
              if (room.hostId === currentPlayer.id) {
                const updated = roomEngine.getRoom(room.code);
                if (updated && updated.status !== "REVEAL") {
                  updated.status = "REVEAL";
                  roomEngine.saveRoom(updated);
                  setRoom({ ...updated });
                  setCurrentScreen("reveal");
                }
              }
            }}
          />
        )}

        {currentScreen === "reveal" && room && (
          <RevealScreen
            room={room}
            currentPlayer={currentPlayer}
            onAdvanceToVoting={handleAdvanceToVoting}
          />
        )}

        {currentScreen === "voting" && room && (
          <VotingScreen
            room={room}
            currentPlayer={currentPlayer}
            onSubmitVote={handleSubmitVote}
          />
        )}

        {currentScreen === "round_result" && room && (
          <RoundResultsScreen
            room={room}
            currentPlayer={currentPlayer}
            onNextRound={handleNextRound}
          />
        )}

        {currentScreen === "final_results" && room && (
          <FinalResultsScreen
            room={room}
            currentPlayer={currentPlayer}
            onRematch={handleRematch}
            onExitHome={() => {
              setRoom(null);
              setCurrentScreen("home");
            }}
          />
        )}

        {currentScreen === "friends" && (
          <FriendsScreen
            onBack={() => setCurrentScreen(room ? "lobby" : "home")}
            onInviteToRoom={(friend) => {
              if (room) {
                navigator.clipboard.writeText(
                  `${window.location.origin}/?join=${room.code}`
                );
                showToast(`Invite link copied for ${friend.name}!`);
              } else {
                showToast(`Invite created for ${friend.name}!`);
              }
            }}
          />
        )}

        {currentScreen === "profile" && (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
            onBack={() => setCurrentScreen(room ? "lobby" : "home")}
          />
        )}

        {currentScreen === "admin" && (
          <AdminScreen
            onBack={() => setCurrentScreen(room ? "lobby" : "home")}
          />
        )}
      </main>

      {/* Modals */}
      <CreateRoomModal
        initialMode={selectedInitialMode}
        profile={profile}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleConfirmCreateRoom}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoinRoom}
      />
    </div>
  );
}


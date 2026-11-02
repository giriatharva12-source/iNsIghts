"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RoomState, Player, UserProfile } from "@/types/game";
import { AvatarBadge } from "../ui/AvatarBadge";
import { sound } from "@/lib/sound";
import { GAME_MODES_INFO } from "./HomeScreen";
import QRCode from "qrcode";
import {
  Copy,
  Check,
  QrCode,
  Bot,
  Play,
  LogOut,
  Users,
  Settings,
  Share2,
  X,
  AlertCircle,
} from "lucide-react";

interface LobbyScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onToggleReady: () => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onLeaveRoom: () => void;
  onKickPlayer?: (playerId: string) => void;
  onOpenSettings?: () => void;
}

export function LobbyScreen({
  room,
  currentPlayer,
  onToggleReady,
  onStartGame,
  onAddBot,
  onLeaveRoom,
  onKickPlayer,
  onOpenSettings,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const currentModeInfo = GAME_MODES_INFO.find((m) => m.id === room.gameMode) || GAME_MODES_INFO[0];
  const isHost = currentPlayer.isHost;
  const canStart = room.players.length >= 2;

  const handleCopyLink = () => {
    sound.click();
    const url = typeof window !== "undefined" ? `${window.location.origin}/?join=${room.code}` : room.code;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowQR = () => {
    sound.click();
    const url = typeof window !== "undefined" ? `${window.location.origin}/?join=${room.code}` : room.code;
    QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: "#0c0a14", light: "#ffffff" } })
      .then((data) => {
        setQrDataUrl(data);
        setShowQR(true);
      })
      .catch(() => {});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Room Code & Header Bar */}
      <div className="p-6 rounded-3xl bg-surface/85 border border-surface-border shadow-card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-white/50 block mb-1">
            Private Game Room
          </span>
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-electric-violet via-pink-400 to-electric-orange">
              {room.code}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all shadow-sm active:scale-95"
              title="Copy room invite link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={handleShowQR}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all shadow-sm active:scale-95"
              title="Show QR code for mobile join"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Mode Summary */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 border border-white/5">
          <div className="text-2xl">{currentModeInfo.icon}</div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white">{currentModeInfo.name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-electric-purple/30 text-electric-pink uppercase">
                {room.totalRounds} Rds
              </span>
            </div>
            <span className="text-[11px] text-white/50">{room.settings.roundTimer}s timer</span>
          </div>
        </div>
      </div>

      {/* Players Grid Section */}
      <div className="p-6 rounded-3xl bg-surface/70 border border-surface-border shadow-card-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-electric-violet" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Players ({room.players.length} / 10)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Bot button for instant play/testing */}
            {room.players.length < 10 && (
              <button
                onClick={() => {
                  sound.pop();
                  onAddBot();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                title="Add simulated AI player for testing"
              >
                <Bot className="w-4 h-4 text-electric-cyan" />
                <span>+ Add Bot</span>
              </button>
            )}
          </div>
        </div>

        {/* Player Avatars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6 justify-items-center py-2">
          {room.players.map((player) => (
            <div key={player.id} className="relative group">
              <AvatarBadge
                avatar={player.avatar}
                color={player.avatarColor}
                name={player.name}
                size="lg"
                isHost={player.isHost}
                isReady={player.isReady}
              />

              {/* Host kick player option */}
              {isHost && !player.isHost && onKickPlayer && (
                <button
                  onClick={() => onKickPlayer(player.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Kick player"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Empty slot placeholders */}
          {Array.from({ length: Math.max(0, 4 - room.players.length) }).map((_, i) => (
            <div
              key={`empty_${i}`}
              className="flex flex-col items-center gap-2 opacity-30 select-none"
            >
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/40 flex items-center justify-center text-xl text-white/40">
                +
              </div>
              <span className="text-[11px] font-medium text-white/40">Waiting...</span>
            </div>
          ))}
        </div>

        {!canStart && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 py-2.5 px-4 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            <span>Need at least 2 players to start the game. Click &quot;+ Add Bot&quot; to test immediately!</span>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Leave Room Button */}
        <button
          onClick={() => {
            sound.click();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-white/70 hover:text-rose-300 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Room</span>
        </button>

        {/* Ready toggle (for non-host) */}
        {!isHost && (
          <button
            onClick={() => {
              sound.click();
              onToggleReady();
            }}
            className={`flex-1 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
              currentPlayer.isReady
                ? "bg-emerald-500 text-white shadow-glow"
                : "bg-surface border border-white/20 text-white hover:bg-white/10"
            }`}
          >
            <Check className="w-5 h-5" />
            <span>{currentPlayer.isReady ? "Ready to Play!" : "Click to Ready Up"}</span>
          </button>
        )}

        {/* Host Start Game Button */}
        {isHost && (
          <button
            onClick={() => {
              if (canStart) {
                sound.fanfare();
                onStartGame();
              } else {
                sound.buzzer();
              }
            }}
            disabled={!canStart}
            className={`flex-1 w-full py-4 rounded-2xl font-black text-base tracking-wider uppercase transition-all shadow-glow flex items-center justify-center gap-2 active:scale-98 ${
              canStart
                ? "bg-gradient-to-r from-electric-violet via-pink-500 to-electric-orange text-white hover:brightness-110"
                : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Game</span>
          </button>
        )}
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-3xl bg-surface border border-surface-border text-center relative shadow-card-shadow"
          >
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">Scan to Join</h3>
            <p className="text-xs text-white/60 mb-4 font-mono font-bold text-electric-pink">
              ROOM: {room.code}
            </p>

            {qrDataUrl && (
              <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="Room QR Code" className="w-48 h-48 mx-auto" />
              </div>
            )}

            <p className="text-[11px] text-white/50">
              Open your phone camera to scan and join instantly
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}


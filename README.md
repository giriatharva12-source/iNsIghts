# INSIGHT - Multiplayer Social Party Game

> **Tagline:** *How well do your friends really know you?*

A complete, production-grade multiplayer social party game built with **Next.js + React + TypeScript + Tailwind CSS + Supabase + Framer Motion**.

---

## 🎮 Game Concept

Friends join private party rooms using a 6-character room code or shareable invite link, answer personal, entertaining, embarrassing, and deep questions, predict each other's answers, vote on impostors, and score points based on how accurately they understand one another.

---

## ✨ Features & Architecture

### 1. 7 Distinct Game Modes
- 🎯 **Classic:** Players receive questions about a rotating focus player. Everyone predicts what that player will answer. The focus player reveals their truth and awards points to the best predictions.
- 🕵️ **Blackout:** One player is secretly selected as the Odd One Out. Innocent players receive the real question; the impostor receives only a thematic clue. Everyone submits answers anonymously. Players vote to catch the impostor; the impostor scores bonus points for successful deception.
- 💣 **Trouble:** Awkward, chaotic dilemmas and funny questions. Answers are revealed with suspense animations, followed by voting for the funniest / wildest response.
- 🦉 **Hoot:** Bold, playful, and personal questions with configurable content intensity (Mild, Medium, Spicy 18+).
- 🗑️ **Trash:** Absurd, surreal, and hilarious hypothetical questions.
- 🌊 **Deep:** Heartwarming, philosophical, and introspective questions about life lessons, friendship, and ambition.
- ⚡ **Battle:** Rapid-fire 15-second countdown timer with speed bonuses for quick submissions and dynamic live leaderboards.

---

### 2. Question Engine (320+ Original Seed Questions)
- **10 Rich Categories:** Funny, Friendship, Personality, Embarrassing, Relationships, Childhood, Deep, Hypothetical, Spicy (18+ opt-in), Random.
- **Dynamic Subject Templating:** Questions automatically interpolate `{target}` with the focus player's nickname.
- **Impostor Prompts:** Built-in secret clues for Blackout mode.
- **Admin Question Bank:** Search, category filters, question authoring, deletion, and user report moderation.

---

### 3. Realtime Multiplayer Engine
- **Dual-Sync Architecture:**
  1. **Supabase Realtime:** Built-in hooks and channels for cloud PostgreSQL multi-device synchronization.
  2. **BroadcastChannel Engine:** Enables cross-tab and cross-window real-time multiplayer out-of-the-box in development and testing.
- **Single-Player Testing & AI Companions:** Includes "+ Add Bot" and "Quick Play" to populate rooms with simulated AI players (Maya, Leo, Chloe, Sam) who submit hilarious answers and cast votes realistically.
- **Server-Authoritative State Machine:** `LOBBY` ➔ `QUESTION` ➔ `ANSWERING` ➔ `REVEAL` ➔ `VOTING` ➔ `ROUND_RESULT` ➔ `FINAL_RESULTS`.

---

### 4. Interactive UX, Sound & Design
- **Electric Aesthetic:** Dark charcoal background (`#0c0a14`), electric violet (`#a855f7`), hot pink (`#ec4899`), and vibrant orange (`#f97316`) accents.
- **Web Audio API Synthesizer:** Instant chimes, ticks, buzzers, pops, reveals, and victory fanfares without external audio dependencies.
- **Live Floating Emoji Reactions:** Tap ❤️, 😂, 💀, 🔥, 👏, 😱 to float animated emojis across all players' screens in real time.
- **Confetti Victory Podium:** 1st, 2nd, and 3rd place pedestals with crowns, shareable result cards, and rematch support.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Connect Supabase (Optional)
1. Run the SQL schema found in `src/supabase/schema.sql` in your Supabase SQL editor.
2. Add your credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
*(If credentials are not supplied, INSIGHT operates seamlessly via the local/broadcast real-time engine)*.

---

## 🧪 Testing Multiplayer
1. Open [http://localhost:3000](http://localhost:3000) in Tab 1 (Player 1 / Host).
2. Click **Create Room** or **Quick Play**.
3. In Tab 2 (or on your phone/incognito window), visit [http://localhost:3000](http://localhost:3000).
4. Enter the 6-character room code or scan the in-lobby QR code.
5. Click **Ready Up** and have the host press **Start Game**!


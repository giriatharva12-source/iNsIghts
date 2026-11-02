-- INSIGHT: Multiplayer Social Party Game Database Schema
-- Run this in your Supabase SQL Editor to set up all tables and Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🦊',
    avatar_color TEXT NOT NULL DEFAULT '#8b5cf6',
    bio TEXT DEFAULT '',
    total_games INT NOT NULL DEFAULT 0,
    games_won INT NOT NULL DEFAULT 0,
    favorite_mode TEXT DEFAULT 'CLASSIC',
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID,
    host_name TEXT NOT NULL,
    game_mode TEXT NOT NULL DEFAULT 'CLASSIC',
    status TEXT NOT NULL DEFAULT 'LOBBY', -- LOBBY, QUESTION, ANSWERING, REVEAL, VOTING, ROUND_RESULT, FINAL_RESULTS
    total_rounds INT NOT NULL DEFAULT 5,
    current_round INT NOT NULL DEFAULT 0,
    round_timer INT NOT NULL DEFAULT 30,
    timer_expires_at TIMESTAMPTZ,
    target_player_id TEXT, -- ID of player who is the subject (in Classic mode)
    odd_one_out_id TEXT,   -- ID of odd one out player (in Blackout mode)
    categories JSONB DEFAULT '["Funny", "Friendship", "Personality", "Deep"]'::jsonb,
    intensity_level TEXT NOT NULL DEFAULT 'medium', -- mild, medium, spicy
    current_question JSONB,
    settings JSONB DEFAULT '{"allowSpectators": true, "showPointsImmediately": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ROOM PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.room_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID,
    session_id TEXT NOT NULL, -- Supports guest players without auth account
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🦊',
    avatar_color TEXT NOT NULL DEFAULT '#8b5cf6',
    is_host BOOLEAN NOT NULL DEFAULT false,
    is_ready BOOLEAN NOT NULL DEFAULT false,
    score INT NOT NULL DEFAULT 0,
    round_score INT NOT NULL DEFAULT 0,
    streak INT NOT NULL DEFAULT 0,
    is_connected BOOLEAN NOT NULL DEFAULT true,
    last_active TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(room_id, session_id)
);

-- 4. ROUND SUBMISSIONS (Answers)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    round INT NOT NULL,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_subject_answer BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(room_id, round, player_id)
);

-- 5. ROUND VOTES (Predictions / Guessing / Funny votes)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    round INT NOT NULL,
    voter_id TEXT NOT NULL,
    target_id TEXT NOT NULL, -- Target player or submission voted for
    vote_type TEXT NOT NULL DEFAULT 'PREDICTION', -- PREDICTION, BLACKOUT_GUESS, FUNNY_VOTE
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(room_id, round, voter_id)
);

-- 6. QUESTIONS BANK
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    suitable_modes JSONB NOT NULL DEFAULT '["CLASSIC", "TROUBLE"]'::jsonb,
    intensity TEXT NOT NULL DEFAULT 'medium',
    target_type TEXT NOT NULL DEFAULT 'subject_based', -- 'subject_based' or 'all_players'
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. GAME HISTORY
CREATE TABLE IF NOT EXISTS public.game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(6) NOT NULL,
    game_mode TEXT NOT NULL,
    total_rounds INT NOT NULL,
    winner_name TEXT NOT NULL,
    winner_score INT NOT NULL,
    leaderboard JSONB NOT NULL,
    played_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. FRIENDS RELATIONSHIPS
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACCEPTED', -- PENDING, ACCEPTED
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, friend_id)
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Public & Authenticated Read/Write Access for Party Rooms (so Guests and Auth users can play seamlessly)
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public access to rooms" ON public.rooms FOR ALL USING (true);
CREATE POLICY "Public access to room_players" ON public.room_players FOR ALL USING (true);
CREATE POLICY "Public access to submissions" ON public.submissions FOR ALL USING (true);
CREATE POLICY "Public access to votes" ON public.votes FOR ALL USING (true);
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public access to game_history" ON public.game_history FOR ALL USING (true);
CREATE POLICY "Public access to friends" ON public.friends FOR ALL USING (true);

-- Enable Realtime for multiplayer sync tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;


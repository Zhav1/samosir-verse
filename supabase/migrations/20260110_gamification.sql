-- ============================================================
-- SAMOSIR 360 - User Progress & Achievements Schema
-- Created: 2026-01-10
-- Version: 2 (No auth dependency)
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: user_progress
-- Tracks user exploration progress (anonymous-first design)
-- Note: user_id is optional - only used if auth is enabled later
-- ============================================================

CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- User identification
    -- user_id: Optional, only set if user signs up (no FK constraint for flexibility)
    user_id UUID,
    -- anonymous_id: Always set for anonymous users
    anonymous_id TEXT,
    
    -- Progress data
    visited_landmarks TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}', -- Array of achievement IDs
    quiz_scores JSONB DEFAULT '[]',
    opung_chat_count INT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_or_anonymous CHECK (
        user_id IS NOT NULL OR anonymous_id IS NOT NULL
    ),
    CONSTRAINT unique_user UNIQUE (user_id),
    CONSTRAINT unique_anonymous UNIQUE (anonymous_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_anonymous_id ON user_progress(anonymous_id);

-- ============================================================
-- TABLE: achievements
-- Master list of all available achievements
-- ============================================================

CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    
    -- Display info (English)
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Display info (Indonesian)
    title_id TEXT NOT NULL,
    description_id TEXT NOT NULL,
    
    -- Visual
    icon TEXT NOT NULL, -- Emoji or icon name
    
    -- Classification
    category TEXT NOT NULL CHECK (category IN ('exploration', 'category', 'quiz', 'special')),
    
    -- Unlock requirements (JSON structure)
    requirement JSONB NOT NULL
    -- Example: {"type": "visit_count", "value": 5}
    -- Example: {"type": "visit_category", "category": "folklore", "value": 5}
    -- Example: {"type": "opung_chat", "value": 10}
);

-- ============================================================
-- SEED DATA: Achievements
-- ============================================================

INSERT INTO achievements (id, title, description, title_id, description_id, icon, category, requirement) VALUES
-- Exploration achievements
('first_step', 'First Step', 'Visit your first landmark', 'Langkah Pertama', 'Kunjungi landmark pertamamu', '👣', 'exploration', '{"type": "visit_count", "value": 1}'),
('explorer_5', 'Young Explorer', 'Visit 5 landmarks', 'Penjelajah Muda', 'Kunjungi 5 landmark', '🗺️', 'exploration', '{"type": "visit_count", "value": 5}'),
('explorer_15', 'Experienced Explorer', 'Visit 15 landmarks', 'Penjelajah Berpengalaman', 'Kunjungi 15 landmark', '🧭', 'exploration', '{"type": "visit_count", "value": 15}'),
('explorer_25', 'Samosir Master', 'Visit all 25 landmarks', 'Master Samosir', 'Kunjungi semua 25 landmark', '🏆', 'exploration', '{"type": "visit_count", "value": 25}'),

-- Category mastery achievements
('folklore_master', 'Folklore Lover', 'Visit all 5 folklore landmarks', 'Pecinta Cerita Rakyat', 'Kunjungi semua 5 landmark cerita rakyat', '📜', 'category', '{"type": "visit_category", "category": "folklore", "value": 5}'),
('music_lover', 'Batak Music Lover', 'Visit all 5 music landmarks', 'Pecinta Musik Batak', 'Kunjungi semua 5 landmark musik', '🎵', 'category', '{"type": "visit_category", "category": "music", "value": 5}'),
('foodie', 'Batak Foodie', 'Visit all 5 food landmarks', 'Kuliner Batak', 'Kunjungi semua 5 landmark kuliner', '🍲', 'category', '{"type": "visit_category", "category": "food", "value": 5}'),
('historian', 'Samosir Historian', 'Visit all 5 history landmarks', 'Sejarawan Samosir', 'Kunjungi semua 5 landmark sejarah', '📚', 'category', '{"type": "visit_category", "category": "history", "value": 5}'),
('nature_explorer', 'Nature Explorer', 'Visit all 5 nature landmarks', 'Penjelajah Alam', 'Kunjungi semua 5 landmark alam', '🌿', 'category', '{"type": "visit_category", "category": "nature", "value": 5}'),

-- Opung interaction achievements
('opung_friend', 'Opung''s Friend', 'Chat with Opung 10 times', 'Sahabat Opung', 'Ngobrol dengan Opung 10 kali', '👴', 'special', '{"type": "opung_chat", "value": 10}'),

-- Quiz achievements
('quiz_starter', 'New Student', 'Complete your first quiz', 'Murid Baru', 'Selesaikan kuis pertamamu', '🎓', 'quiz', '{"type": "quiz_complete", "value": 1}'),
('quiz_master', 'Cultural Genius', 'Score 100% on any quiz', 'Cerdas Budaya', 'Raih skor 100% di kuis manapun', '🧠', 'quiz', '{"type": "quiz_perfect", "value": 1}')

ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    title_id = EXCLUDED.title_id,
    description_id = EXCLUDED.description_id,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    requirement = EXCLUDED.requirement;

-- ============================================================
-- ROW LEVEL SECURITY (Simplified - No Auth Required)
-- ============================================================

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Anyone can read achievements (they're public data)
DROP POLICY IF EXISTS "Public read access on achievements" ON achievements;
CREATE POLICY "Public read access on achievements"
    ON achievements FOR SELECT
    USING (true);

-- Allow anonymous access to user_progress (for anonymous users)
-- This is safe because anonymous_id is a random UUID that only the client knows
DROP POLICY IF EXISTS "Allow all operations for development" ON user_progress;
CREATE POLICY "Allow all operations for development"
    ON user_progress FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to merge anonymous progress into authenticated user
CREATE OR REPLACE FUNCTION merge_anonymous_progress(
    p_anonymous_id TEXT,
    p_user_id UUID
) RETURNS void AS $$
DECLARE
    v_anon_record user_progress%ROWTYPE;
    v_user_record user_progress%ROWTYPE;
BEGIN
    -- Get anonymous progress
    SELECT * INTO v_anon_record 
    FROM user_progress 
    WHERE anonymous_id = p_anonymous_id;
    
    IF NOT FOUND THEN
        RETURN; -- No anonymous progress to merge
    END IF;
    
    -- Get or create user progress
    SELECT * INTO v_user_record 
    FROM user_progress 
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        -- Simply update the anonymous record to be owned by the user
        UPDATE user_progress
        SET user_id = p_user_id,
            anonymous_id = NULL,
            updated_at = NOW()
        WHERE anonymous_id = p_anonymous_id;
    ELSE
        -- Merge the records (combine arrays, take max counts)
        UPDATE user_progress
        SET 
            visited_landmarks = ARRAY(
                SELECT DISTINCT unnest(
                    v_user_record.visited_landmarks || v_anon_record.visited_landmarks
                )
            ),
            achievements = ARRAY(
                SELECT DISTINCT unnest(
                    v_user_record.achievements || v_anon_record.achievements
                )
            ),
            opung_chat_count = GREATEST(
                v_user_record.opung_chat_count, 
                v_anon_record.opung_chat_count
            ),
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Delete the anonymous record
        DELETE FROM user_progress WHERE anonymous_id = p_anonymous_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

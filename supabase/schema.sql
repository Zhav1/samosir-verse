-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  panorama_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  default_yaw FLOAT DEFAULT 0,
  default_pitch FLOAT DEFAULT 0,
  links JSONB DEFAULT '[]'::jsonb
);

-- Create landmarks table
CREATE TABLE IF NOT EXISTS landmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id TEXT REFERENCES nodes(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('folklore', 'music', 'food', 'history', 'nature')),
  title TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- { yaw: number, pitch: number }
  lore_context TEXT NOT NULL,
  image_asset TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE landmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on nodes"
  ON nodes FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on landmarks"
  ON landmarks FOR SELECT
  USING (true);

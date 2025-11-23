-- Phase 5: Add 3D position support to landmarks table
-- This enables landmarks to appear as interactive markers in the 3D island view

ALTER TABLE landmarks ADD COLUMN IF NOT EXISTS position_3d JSONB;

COMMENT ON COLUMN landmarks.position_3d IS 'Optional 3D position relative to island center: {"x": -2.5, "y": 0.3, "z": 1.2}. Used for rendering landmarks in the 3D sky view.';s

-- Tomok Harbor landmarks
UPDATE landmarks
SET position_3d = '{"x": -2.5, "y": 0.5, "z": 1.8}'::jsonb
WHERE id = (
  SELECT id FROM landmarks
  WHERE node_id = 'tomok-harbor'
    AND category = 'folklore'
    AND position_3d IS NULL
  ORDER BY id
  LIMIT 1
);

UPDATE landmarks
SET position_3d = '{"x": 1.8, "y": 0.4, "z": -2.2}'::jsonb
WHERE id = (
  SELECT id FROM landmarks
  WHERE node_id = 'tomok-harbor'
    AND category = 'food'
    AND position_3d IS NULL
  ORDER BY id
  LIMIT 1
);

-- Ambarita Stone Chairs landmarks
UPDATE landmarks
SET position_3d = '{"x": 0.5, "y": 0.6, "z": 2.5}'::jsonb
WHERE id = (
  SELECT id FROM landmarks
  WHERE node_id = 'ambarita-stone-chairs'
    AND category = 'history'
    AND position_3d IS NULL
  ORDER BY id
  LIMIT 1
);

-- Verify the migration
SELECT id, title, category, node_id, position_3d
FROM landmarks
WHERE position_3d IS NOT NULL
ORDER BY node_id, category;
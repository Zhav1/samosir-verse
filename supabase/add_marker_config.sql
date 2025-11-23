-- Add marker_config column to landmarks table for marketplace support
-- Run this in Supabase SQL Editor

ALTER TABLE landmarks 
ADD COLUMN IF NOT EXISTS marker_config JSONB;

COMMENT ON COLUMN landmarks.marker_config IS 'Marketplace configuration: {"image": "url.jpg", "is_for_sale": true, "price": 50000}';

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'landmarks' 
AND column_name = 'marker_config';

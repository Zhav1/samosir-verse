-- Update Sigale-gale landmark with the image asset
UPDATE landmarks 
SET image_asset = '/images/sigale-gale.jpg'
WHERE title = 'Sigale-gale';

-- Verify it was updated
SELECT id, title, image_asset 
FROM landmarks 
WHERE title = 'Sigale-gale';

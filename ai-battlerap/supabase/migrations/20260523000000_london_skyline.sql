-- London was the only city without a skyline sprite. Generated
-- /sprites/cities/europe/london-night.png (PixelLab, NYC-night style ref).
UPDATE cities
SET skyline_url = '/sprites/cities/europe/london-night.png',
    background_url = '/sprites/cities/europe/london-night.png'
WHERE name = 'London'
  AND (skyline_url IS NULL OR background_url IS NULL);

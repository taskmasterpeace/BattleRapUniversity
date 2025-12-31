-- Add attribute contribution tracking to battle_rounds
-- These fields show what percentage of a battler's round score came from writing vs performance

ALTER TABLE battle_rounds
ADD COLUMN writing_contribution NUMERIC CHECK (writing_contribution >= 0 AND writing_contribution <= 1),
ADD COLUMN performance_contribution NUMERIC CHECK (performance_contribution >= 0 AND performance_contribution <= 1);

COMMENT ON COLUMN battle_rounds.writing_contribution IS 'Percentage (0-1) of round score from writing attributes (lyricism, wordplay, creativity). Used for blog generation and player insights.';
COMMENT ON COLUMN battle_rounds.performance_contribution IS 'Percentage (0-1) of round score from performance attributes (stage presence, crowd control, delivery). Sum with writing_contribution should equal 1.0.';

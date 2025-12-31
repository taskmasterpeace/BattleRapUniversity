-- Adjust league weights for better balance
-- Previous weights were too extreme (0.65/0.35), causing 100% win rates based on league alone
-- New weights (0.55/0.45) maintain league identity while allowing skill to matter

UPDATE leagues
SET
  writing_weight = 0.55,
  performance_weight = 0.45
WHERE name = 'Small Room Circuit';

UPDATE leagues
SET
  writing_weight = 0.45,
  performance_weight = 0.55
WHERE name = 'Main Stage Arena';

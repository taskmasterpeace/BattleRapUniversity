-- Historic press articles were generated while battle_rounds.won was always
-- false, producing headlines like "Takes 0-0 Victory". The generator reads
-- real round wins now; repair the published record with each battle's verdict.
UPDATE news_articles n
SET title = REPLACE(n.title, '0-0', b.verdict)
FROM battles b
WHERE n.battle_id = b.id
  AND n.title LIKE '%0-0%'
  AND b.verdict IS NOT NULL;

-- Any leftovers without a verdict just lose the broken score
UPDATE news_articles
SET title = TRIM(REPLACE(REPLACE(title, ' 0-0 ', ' '), ' 0-0', ''))
WHERE title LIKE '%0-0%';

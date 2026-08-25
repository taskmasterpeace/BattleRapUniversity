-- London and Toronto were seeded with country 'USA' (the column default).
-- Everybody's from somewhere — and it's not always the States.
UPDATE cities SET country = 'UK',     state = 'ENG' WHERE name = 'London';
UPDATE cities SET country = 'Canada', state = 'ON'  WHERE name = 'Toronto';

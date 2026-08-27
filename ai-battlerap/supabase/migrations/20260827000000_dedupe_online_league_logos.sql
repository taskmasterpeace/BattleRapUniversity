-- Dedupe league logos: two online leagues were seeded with logos already in use
-- by other active leagues, so the roster rendered the identical badge twice.
--   Text Wars (TXW) reused league_053 ("THE BATTLEGROUND CIRCUIT"), which Small
--     Room Circuit (SRC) already displays.
--   The App (APP) reused league_104 ("GET IT, GET IT"), which is Get It Get It's
--     (GIG) own rightful logo.
-- Reassign the two borrowed online leagues to distinct, unused, cipher-themed
-- sprites (fitting the pen-driven online/forum scene) so no two leagues share art.
UPDATE leagues SET logo_url = '/sprites/leagues/image_1764196076327/league_052.png' WHERE short_code = 'TXW';
UPDATE leagues SET logo_url = '/sprites/leagues/image_1764196239271/league_007.png' WHERE short_code = 'APP';

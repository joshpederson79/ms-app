-- Duets need a second singer (songs.is_duet already exists).
ALTER TABLE songs ADD COLUMN IF NOT EXISTS second_singer_id INT REFERENCES users(id);

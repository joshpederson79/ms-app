-- A thread can optionally be about one song or one gig.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS song_id INT REFERENCES songs(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS gig_id INT REFERENCES gigs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_messages_song_id ON messages(song_id);
CREATE INDEX IF NOT EXISTS idx_messages_gig_id ON messages(gig_id);

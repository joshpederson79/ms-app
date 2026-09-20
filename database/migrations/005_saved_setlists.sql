-- Standalone setlists. Their songs live in setlist_items, owned by either a gig or a saved setlist.
CREATE TABLE IF NOT EXISTS setlists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE setlist_items ALTER COLUMN gig_id DROP NOT NULL;
ALTER TABLE setlist_items ADD COLUMN IF NOT EXISTS setlist_id INT REFERENCES setlists(id) ON DELETE CASCADE;
ALTER TABLE setlist_items DROP CONSTRAINT IF EXISTS setlist_items_one_owner;
ALTER TABLE setlist_items ADD CONSTRAINT setlist_items_one_owner CHECK ((gig_id IS NULL) <> (setlist_id IS NULL));
CREATE INDEX IF NOT EXISTS idx_setlist_items_setlist_id ON setlist_items(setlist_id);

-- Gigs are identified by venue + date; the name is an optional label.
ALTER TABLE gigs ALTER COLUMN name DROP NOT NULL;

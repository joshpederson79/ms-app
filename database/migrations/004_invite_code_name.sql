-- Lets an admin pre-fill the member's name on the sign-up form.
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS name TEXT;

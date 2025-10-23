-- Add JSON column to store branch meta (names/addresses)
ALTER TABLE pharmacies
  ADD COLUMN IF NOT EXISTS branches JSON NULL;

-- Optional: create a functional index if needed later (MySQL 8 supports JSON extraction indexes)
-- Example: CREATE INDEX idx_ph_branches_count ON pharmacies ((JSON_LENGTH(branches)));

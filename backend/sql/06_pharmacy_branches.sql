-- Add branches_count to pharmacies
ALTER TABLE pharmacies
  ADD COLUMN IF NOT EXISTS branches_count INT NOT NULL DEFAULT 1;

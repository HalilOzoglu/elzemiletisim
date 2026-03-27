-- 003_add_suggested_price.sql
-- devices tablosuna önerilen satış fiyatı kolonu ekleniyor

ALTER TABLE devices ADD COLUMN IF NOT EXISTS suggested_price NUMERIC(12, 2);

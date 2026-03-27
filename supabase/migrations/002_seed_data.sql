-- ============================================================
-- 002_seed_data.sql
-- Cep Telefonu Muhasebe Sistemi - Başlangıç Seed Verileri
-- ============================================================

-- ============================================================
-- HAFIZA SEÇENEKLERİ
-- ============================================================

INSERT INTO list_items (category_id, value)
SELECT id, unnest(ARRAY['64GB', '128GB', '256GB', '512GB', '1TB'])
FROM list_categories WHERE slug = 'storage';

-- ============================================================
-- RENK SEÇENEKLERİ
-- ============================================================

INSERT INTO list_items (category_id, value)
SELECT id, unnest(ARRAY['Siyah', 'Beyaz', 'Mavi', 'Kırmızı', 'Yeşil', 'Sarı', 'Mor', 'Gri', 'Gümüş', 'Altın'])
FROM list_categories WHERE slug = 'color';

-- ============================================================
-- YD DURUMU
-- ============================================================

INSERT INTO list_items (category_id, value)
SELECT id, unnest(ARRAY['Yurt İçi', 'Yurt Dışı'])
FROM list_categories WHERE slug = 'yd_status';

-- ============================================================
-- ALIM ŞEKLİ
-- ============================================================

INSERT INTO list_items (category_id, value)
SELECT id, unnest(ARRAY['Kasadan Nakit', 'İbandan Havale', 'Kredi Kartı'])
FROM list_categories WHERE slug = 'purchase_type';

-- ============================================================
-- MARKALAR
-- ============================================================

INSERT INTO list_items (category_id, value)
SELECT id, unnest(ARRAY['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo'])
FROM list_categories WHERE slug = 'brand';

-- ============================================================
-- MODELLER (marka parent_id ile ilişkili)
-- ============================================================

-- Apple modelleri
INSERT INTO list_items (category_id, parent_id, value)
SELECT
  (SELECT id FROM list_categories WHERE slug = 'model'),
  (SELECT id FROM list_items WHERE value = 'Apple' AND category_id = (SELECT id FROM list_categories WHERE slug = 'brand')),
  unnest(ARRAY[
    'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max'
  ]);

-- Samsung modelleri
INSERT INTO list_items (category_id, parent_id, value)
SELECT
  (SELECT id FROM list_categories WHERE slug = 'model'),
  (SELECT id FROM list_items WHERE value = 'Samsung' AND category_id = (SELECT id FROM list_categories WHERE slug = 'brand')),
  unnest(ARRAY[
    'Galaxy A14', 'Galaxy A34', 'Galaxy A54',
    'Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra',
    'Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra',
    'Galaxy Z Fold 5', 'Galaxy Z Flip 5'
  ]);

-- Xiaomi modelleri
INSERT INTO list_items (category_id, parent_id, value)
SELECT
  (SELECT id FROM list_categories WHERE slug = 'model'),
  (SELECT id FROM list_items WHERE value = 'Xiaomi' AND category_id = (SELECT id FROM list_categories WHERE slug = 'brand')),
  unnest(ARRAY[
    'Redmi Note 12', 'Redmi Note 13', 'Redmi Note 13 Pro',
    'Xiaomi 13', 'Xiaomi 13T', 'Xiaomi 14', 'Xiaomi 14T'
  ]);

-- Huawei modelleri
INSERT INTO list_items (category_id, parent_id, value)
SELECT
  (SELECT id FROM list_categories WHERE slug = 'model'),
  (SELECT id FROM list_items WHERE value = 'Huawei' AND category_id = (SELECT id FROM list_categories WHERE slug = 'brand')),
  unnest(ARRAY[
    'P50', 'P50 Pro', 'P60', 'P60 Pro',
    'Mate 50', 'Mate 50 Pro', 'Mate 60', 'Mate 60 Pro'
  ]);

-- Oppo modelleri
INSERT INTO list_items (category_id, parent_id, value)
SELECT
  (SELECT id FROM list_categories WHERE slug = 'model'),
  (SELECT id FROM list_items WHERE value = 'Oppo' AND category_id = (SELECT id FROM list_categories WHERE slug = 'brand')),
  unnest(ARRAY[
    'A78', 'A98', 'Reno 10', 'Reno 10 Pro',
    'Find X6', 'Find X6 Pro', 'Find X7', 'Find X7 Ultra'
  ]);

-- ============================================================
-- 001_initial_schema.sql
-- Cep Telefonu Muhasebe Sistemi - Başlangıç Şeması
-- ============================================================

-- ============================================================
-- TABLOLAR
-- ============================================================

-- Liste Kategorileri
CREATE TABLE list_categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

-- Liste Öğeleri
CREATE TABLE list_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES list_categories(id) NOT NULL,
  parent_id   UUID REFERENCES list_items(id),
  value       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Cihazlar
CREATE TABLE devices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode          TEXT UNIQUE,
  brand_id         UUID REFERENCES list_items(id) NOT NULL,
  model_id         UUID REFERENCES list_items(id) NOT NULL,
  storage_id       UUID REFERENCES list_items(id) NOT NULL,
  color_id         UUID REFERENCES list_items(id) NOT NULL,
  yd_status_id     UUID REFERENCES list_items(id) NOT NULL,
  purchase_type_id UUID REFERENCES list_items(id) NOT NULL,
  invoice_type     TEXT CHECK (invoice_type IN ('AF', 'MF')) NOT NULL,
  condition        TEXT CHECK (condition IN ('sifir', 'ikinci_el')) NOT NULL,
  warranty_months  INT,
  purchase_date    DATE,
  purchase_price   NUMERIC(12, 2),
  supplier_type    TEXT CHECK (supplier_type IN ('musteri', 'firma')),
  supplier_name    TEXT,
  supplier_surname TEXT,
  supplier_phone   TEXT,
  supplier_company TEXT,
  is_sold          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Satışlar
CREATE TABLE sales (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id        UUID REFERENCES devices(id) NOT NULL UNIQUE,
  customer_name    TEXT NOT NULL,
  customer_surname TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  sale_method      TEXT CHECK (sale_method IN ('nakit', 'havale', 'kredi_karti')) NOT NULL,
  invoice_status   TEXT CHECK (invoice_status IN ('AF', 'MF')) NOT NULL,
  af_sub_status    TEXT CHECK (af_sub_status IN ('kesildi', 'bekliyor')),
  sale_price       NUMERIC(12, 2) NOT NULL,
  gross_price      NUMERIC(12, 2),
  commission_rate  NUMERIC(5, 2),
  sale_date        DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Masraflar
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id   UUID REFERENCES devices(id) ON DELETE CASCADE NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT OTOMATİK GÜNCELLEME
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE list_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses        ENABLE ROW LEVEL SECURITY;

-- list_categories
CREATE POLICY "authenticated_select_list_categories" ON list_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_list_categories" ON list_categories
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_list_categories" ON list_categories
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_list_categories" ON list_categories
  FOR DELETE TO authenticated USING (true);

-- list_items
CREATE POLICY "authenticated_select_list_items" ON list_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_list_items" ON list_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_list_items" ON list_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_list_items" ON list_items
  FOR DELETE TO authenticated USING (true);

-- devices
CREATE POLICY "authenticated_select_devices" ON devices
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_devices" ON devices
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_devices" ON devices
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_devices" ON devices
  FOR DELETE TO authenticated USING (true);

-- sales
CREATE POLICY "authenticated_select_sales" ON sales
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_sales" ON sales
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_sales" ON sales
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_sales" ON sales
  FOR DELETE TO authenticated USING (true);

-- expenses
CREATE POLICY "authenticated_select_expenses" ON expenses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_expenses" ON expenses
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_expenses" ON expenses
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_expenses" ON expenses
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- BAŞLANGIÇ VERİLERİ: list_categories
-- ============================================================

INSERT INTO list_categories (slug, name) VALUES
  ('brand',         'Marka'),
  ('model',         'Model'),
  ('storage',       'Hafıza'),
  ('color',         'Renk'),
  ('yd_status',     'YD Durumu'),
  ('purchase_type', 'Alım Şekli'),
  ('sale_method',   'Satış Yöntemi');

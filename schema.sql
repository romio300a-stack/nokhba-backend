-- ==========================================================
-- Schema لجدول الروابط الخاص بمواقع سنتر النخبة (site1 / site2 / site3)
-- نفّذ هذا الملف مرة واحدة على قاعدة بيانات Neon الخاصة بك.
-- ==========================================================

CREATE TABLE IF NOT EXISTS links (
  id          TEXT PRIMARY KEY,
  site_id     TEXT NOT NULL CHECK (site_id IN ('site1', 'site2', 'site3')),
  platform    TEXT NOT NULL,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- index يسرّع جلب روابط كل موقع على حدة (عزل البيانات)
CREATE INDEX IF NOT EXISTS idx_links_site_id ON links (site_id);

-- ترتيب الروابط في الواجهة يعتمد على وقت الإضافة (created_at ASC)
CREATE INDEX IF NOT EXISTS idx_links_site_created ON links (site_id, created_at);

-- تحديث updated_at تلقائيًا عند أي UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_links_updated_at ON links;
CREATE TRIGGER trg_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

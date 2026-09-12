const { handlePreflight } = require("../../lib/cors");
const { verifyRequest, VALID_SITES } = require("../../lib/auth");
const { getPool } = require("../../lib/db");
const { readJsonBody } = require("../../lib/body");

function makeId() {
  return "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  const pool = getPool();

  // ---------- GET: قراءة عامة (بدون تسجيل دخول) لروابط موقع واحد فقط ----------
  if (req.method === "GET") {
    const site = req.query.site;
    if (!site || !VALID_SITES.includes(site)) {
      return res.status(400).json({ error: "site غير صحيح" });
    }
    try {
      const { rows } = await pool.query(
        "SELECT id, platform, label, url FROM links WHERE site_id = $1 ORDER BY created_at ASC",
        [site]
      );
      return res.status(200).json({ links: rows });
    } catch (e) {
      console.error("GET /api/links error:", e);
      return res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }

  // ---------- POST: إضافة رابط جديد (لازم تسجيل دخول) ----------
  if (req.method === "POST") {
    const payload = verifyRequest(req);
    if (!payload) {
      return res.status(401).json({ error: "غير مصرح، سجّل دخول الأدمن الأول" });
    }

    const { platform, label, url } = readJsonBody(req);
    if (!platform || !label || !url) {
      return res.status(400).json({ error: "من فضلك اكتب الاسم والرابط" });
    }
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: "الرابط لازم يبدأ بـ https:// وميكونش فيه أخطاء" });
    }

    const id = makeId();
    try {
      await pool.query(
        "INSERT INTO links (id, site_id, platform, label, url) VALUES ($1, $2, $3, $4, $5)",
        [id, payload.site, platform, label, url]
      );
      return res.status(201).json({ ok: true, link: { id, platform, label, url } });
    } catch (e) {
      console.error("POST /api/links error:", e);
      return res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

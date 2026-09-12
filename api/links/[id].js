const { handlePreflight } = require("../../lib/cors");
const { verifyRequest } = require("../../lib/auth");
const { getPool } = require("../../lib/db");
const { readJsonBody } = require("../../lib/body");

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  // كل عمليات التعديل/الحذف لازم تسجيل دخول
  const payload = verifyRequest(req);
  if (!payload) {
    return res.status(401).json({ error: "غير مصرح، سجّل دخول الأدمن الأول" });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "id ناقص" });
  }

  const pool = getPool();

  // تأكيد إن الرابط ده فعلاً بتاع نفس الـ site الخاص بالجلسة قبل أي تعديل/حذف
  // ده اللي بيمنع أدمن site1 من لمس بيانات site2 أو site3
  const { rows: existing } = await pool.query(
    "SELECT id FROM links WHERE id = $1 AND site_id = $2",
    [id, payload.site]
  );
  if (existing.length === 0) {
    return res.status(404).json({ error: "الرابط مش موجود" });
  }

  if (req.method === "PUT") {
    const { platform, label, url } = readJsonBody(req);
    if (!platform || !label || !url) {
      return res.status(400).json({ error: "من فضلك اكتب الاسم والرابط" });
    }
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: "الرابط لازم يبدأ بـ https:// وميكونش فيه أخطاء" });
    }

    try {
      await pool.query(
        "UPDATE links SET platform = $1, label = $2, url = $3 WHERE id = $4 AND site_id = $5",
        [platform, label, url, id, payload.site]
      );
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("PUT /api/links/:id error:", e);
      return res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM links WHERE id = $1 AND site_id = $2", [id, payload.site]);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("DELETE /api/links/:id error:", e);
      return res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

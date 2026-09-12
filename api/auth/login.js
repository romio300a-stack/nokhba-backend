const { handlePreflight } = require("../../lib/cors");
const { signToken, setAuthCookie, VALID_SITES } = require("../../lib/auth");
const { readJsonBody } = require("../../lib/body");

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { site, password } = readJsonBody(req);

  if (!site || !VALID_SITES.includes(site)) {
    return res.status(400).json({ error: "site غير صحيح" });
  }
  if (!password) {
    return res.status(400).json({ error: "من فضلك اكتب كلمة المرور" });
  }

  // كل موقع له كلمة مرور مستقلة في الـ Environment Variables: SITE1_PASSWORD / SITE2_PASSWORD / SITE3_PASSWORD
  const envKey = site.toUpperCase() + "_PASSWORD";
  const expected = process.env[envKey];

  if (!expected) {
    return res.status(500).json({ error: "السيرفر مش مضبوط صح (كلمة مرور الموقع مش موجودة)" });
  }

  if (password !== expected) {
    return res.status(401).json({ error: "كلمة المرور غلط، جرّب تاني." });
  }

  const token = signToken(site);
  setAuthCookie(res, token);

  return res.status(200).json({ ok: true, site });
};

function getAllowedOrigins() {
  return (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/**
 * يضبط هيدرز الـ CORS. بيسمح فقط للأوريجينز الموجودة في FRONTEND_ORIGINS
 * ولازم credentials:true عشان الكوكي (الجلسة) تتبعت وتتقرا بين المواقع.
 */
function applyCors(req, res) {
  const allowed = getAllowedOrigins();
  const origin = (req.headers.origin || "").replace(/\/$/, "");

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/**
 * يرجع true لو الطلب كان preflight (OPTIONS) وتم الرد عليه، عشان الـ handler يوقف هناك.
 */
function handlePreflight(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { applyCors, handlePreflight, getAllowedOrigins };

const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const COOKIE_NAME = "nokhba_token";
const VALID_SITES = ["site1", "site2", "site3", "site4"];
const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 ساعة

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET مش متضبط في الـ Environment Variables");
  return secret;
}

function signToken(site) {
  return jwt.sign({ site }, getJwtSecret(), { expiresIn: TOKEN_TTL_SECONDS });
}

function setAuthCookie(res, token) {
  const serialized = cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true, // لازم true عشان SameSite=None يشتغل (HTTPS فقط، Vercel بيوفرها تلقائيًا)
    sameSite: "none", // مطلوب لأن الـ Backend على دومين مختلف عن كل Frontend
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
  res.setHeader("Set-Cookie", serialized);
}

function clearAuthCookie(res) {
  const serialized = cookie.serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0,
  });
  res.setHeader("Set-Cookie", serialized);
}

function getTokenFromReq(req) {
  const parsed = cookie.parse(req.headers.cookie || "");
  return parsed[COOKIE_NAME];
}

/**
 * يتحقق من الجلسة. يرجع { site } لو صحيحة، أو null لو مفيش جلسة/الجلسة منتهية.
 */
function verifyRequest(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (!payload || !VALID_SITES.includes(payload.site)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

module.exports = {
  COOKIE_NAME,
  VALID_SITES,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  verifyRequest,
};

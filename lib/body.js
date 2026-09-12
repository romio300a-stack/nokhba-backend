/**
 * Vercel بيعمل parse تلقائي لو Content-Type: application/json،
 * لكن ده احتياط لو وصل الـ body كـ string.
 */
function readJsonBody(req) {
  const body = req.body;
  if (body == null) return {};
  if (typeof body === "object") return body;
  if (typeof body === "string") {
    try {
      return JSON.parse(body || "{}");
    } catch (e) {
      return {};
    }
  }
  return {};
}

module.exports = { readJsonBody };

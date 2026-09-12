const { handlePreflight } = require("../../lib/cors");
const { verifyRequest } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = verifyRequest(req);
  if (!payload) {
    return res.status(200).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true, site: payload.site });
};

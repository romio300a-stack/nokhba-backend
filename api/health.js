const { handlePreflight } = require("../lib/cors");
const { getPool } = require("../lib/db");

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    return res.status(200).json({ ok: true, db: "connected" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

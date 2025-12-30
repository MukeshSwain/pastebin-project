import { nanoid } from "nanoid";
import { pool } from "../db.js";
import { now } from "../utils/time.js";
const url = `https://pastebin-project.onrender.com`;
export async function createPaste(req, res) {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds !== undefined && ttl_seconds < 1) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views !== undefined && max_views < 1) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid(8);
  const expiresAt = ttl_seconds
    ? new Date(now(req).getTime() + ttl_seconds * 1000)
    : null;

  await pool.query(
    `INSERT INTO pastes (id, content, expires_at, remaining_views)
     VALUES ($1, $2, $3, $4)`,
    [id, content, expiresAt, max_views ?? null]
  );

  res.status(201).json({
    id,
    url: `${url}/p/${id}`,
  });
}

export async function fetchPaste(req, res) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT * FROM pastes WHERE id = $1 FOR UPDATE`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }

    const paste = rows[0];
    const currentTime = now(req);

    // TTL check
    if (paste.expires_at && currentTime > paste.expires_at) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Expired" });
    }

    // View limit check
    if (paste.remaining_views !== null) {
      if (paste.remaining_views <= 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "View limit exceeded" });
      }

      await client.query(
        `UPDATE pastes
         SET remaining_views = remaining_views - 1
         WHERE id = $1`,
        [paste.id]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      content: paste.content,
      remaining_views:
        paste.remaining_views !== null
          ? Math.max(paste.remaining_views - 1, 0)
          : null,
      expires_at: paste.expires_at,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
}

export async function viewPasteHtml(req, res) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT * FROM pastes WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Not Found");
    }

    const paste = rows[0];
    const currentTime = now(req);

    // TTL check
    if (paste.expires_at && currentTime > paste.expires_at) {
      await client.query("ROLLBACK");
      return res.status(404).send("Not Found");
    }

    // View limit check
    if (paste.remaining_views !== null) {
      if (paste.remaining_views <= 0) {
        await client.query("ROLLBACK");
        return res.status(404).send("Not Found");
      }

      await client.query(
        "UPDATE pastes SET remaining_views = remaining_views - 1 WHERE id = $1",
        [paste.id]
      );
    }

    await client.query("COMMIT");

    // Escape HTML (XSS protection)
    const escapedContent = paste.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Paste ${paste.id}</title>
          <style>
            body {
              font-family: monospace;
              padding: 20px;
              background: #f7f7f7;
            }
            pre {
              background: #ffffff;
              padding: 16px;
              border-radius: 6px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <pre>${escapedContent}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
}

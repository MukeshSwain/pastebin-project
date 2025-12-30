import { useState } from "react";
import { createPaste } from "../api";

export default function CreatePaste() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [views, setViews] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setUrl("");
    setLoading(true);

    try {
      const payload = { content };
      if (ttl) payload.ttl_seconds = Number(ttl);
      if (views) payload.max_views = Number(views);

      const res = await createPaste(payload);
      setUrl(res.url);
      setContent("");
      setTtl("");
      setViews("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="container">
      <div className="card vstack">
        <div className="hstack">
          <h2 style={{ margin: 0 }}>Pastebin Lite</h2>
          <span className="badge">Secure · Expiring · Simple</span>
        </div>

        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Create a text paste and share a read-only link.
        </p>

        <form onSubmit={handleSubmit} className="vstack">
          <textarea
            placeholder="Paste your text here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="hstack">
            <input
              type="number"
              placeholder="TTL (seconds)"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              min={1}
            />
            <input
              type="number"
              placeholder="Max views"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              min={1}
            />
          </div>

          <div className="hstack">
            <button disabled={loading}>
              {loading ? "Creating…" : "Create Paste"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setContent("");
                setTtl("");
                setViews("");
              }}
            >
              Clear
            </button>
          </div>
        </form>

        {error && <div className="alert error">{error}</div>}

        {url && (
          <div className="alert success vstack">
            <div>Shareable link:</div>
            <div className="hstack">
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
              <button className="secondary" onClick={copy}>
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

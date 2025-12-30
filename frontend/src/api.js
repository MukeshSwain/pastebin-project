const BASE_URL = "https://pastebin-project.onrender.com";

export async function createPaste(payload) {
  const res = await fetch(`${BASE_URL}/api/pastes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create paste");
  }

  return res.json();
}

export type ClientResult = { ok: true } | { ok: false; message: string };

// Calls the entries API from the browser and turns every failure into a plain message the person can read.
async function send(url: string, method: string, body?: unknown): Promise<ClientResult> {
  try {
    const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    if (response.ok) return { ok: true };
    const data = await response.json().catch(() => ({ error: "Something went wrong." }));
    return { ok: false, message: data.error };
  } catch {
    // fetch itself failed: the network dropped or the server is down.
    return { ok: false, message: "Could not reach the server. Check your connection and try again." };
  }
}

export const addEntry = (monthId: string, payload: unknown) => send(`/api/months/${monthId}/entries`, "POST", payload);
export const updateEntry = (monthId: string, entryId: string, payload: unknown) => send(`/api/months/${monthId}/entries/${entryId}`, "PUT", payload);
export const removeEntry = (monthId: string, entryId: string) => send(`/api/months/${monthId}/entries/${entryId}`, "DELETE");
export const answerSuggestion = (monthId: string, action: "add" | "dismiss", suggestion: { date: string; title: string }) =>
  send(`/api/months/${monthId}/suggestions`, "POST", { action, date: suggestion.date, title: suggestion.title });
export const startPlanning = (monthId: string) => send(`/api/months/${monthId}/plan`, "POST");

// Uploads one image to the library and returns it (used for the event logo / photo of a post).
export async function uploadLibraryImage(file: File, kind: "event_logo" | "photo"): Promise<{ ok: true; image: { id: string; url: string; name: string } } | { ok: false; message: string }> {
  const body = new FormData();
  body.append("files", file);
  body.set("kind", kind);
  if (kind === "photo") body.set("people_ok", "on"); // the team chose this photo for a post on purpose
  try {
    const response = await fetch("/api/library", { method: "POST", body });
    const data = await response.json().catch(() => ({ error: "Something went wrong." }));
    if (data.created?.length) return { ok: true, image: data.created[0] };
    return { ok: false, message: data.errors?.[0] ?? data.error ?? "The image could not be saved." };
  } catch {
    return { ok: false, message: "Could not reach the server. Check your connection and try again." };
  }
}

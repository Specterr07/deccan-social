export type ClientResult = { ok: true } | { ok: false; message: string };

// Calls the review API from the browser and turns every failure into a plain message the person can read.
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

export const approve = (postId: string) => send(`/api/posts/${postId}/approve`, "POST");
export const undoApproval = (postId: string) => send(`/api/posts/${postId}/approve`, "DELETE");
export const saveEdit = (postId: string, edit: unknown) => send(`/api/posts/${postId}`, "PATCH", edit);

export const requestChanges = (postId: string, note: string) => send(`/api/posts/${postId}/changes`, "POST", { note });
export const swapPicture = (slideId: string, assetId: string) => send(`/api/slides/${slideId}/picture`, "POST", { assetId });
export const regenerateArtwork = (slideId: string) => send(`/api/slides/${slideId}/artwork`, "POST");

// Approves every ready post of a month; returns how many were approved and how many were skipped for a missing image.
export async function approveAllPosts(monthId: string): Promise<{ ok: true; approved: number; skippedNeedImage: number } | { ok: false; message: string }> {
  try {
    const response = await fetch(`/api/months/${monthId}/approve-all`, { method: "POST" });
    const data = await response.json().catch(() => ({ error: "Something went wrong." }));
    return response.ok ? { ok: true, approved: data.approved, skippedNeedImage: data.skippedNeedImage } : { ok: false, message: data.error };
  } catch {
    // fetch itself failed: the network dropped or the server is down.
    return { ok: false, message: "Could not reach the server. Check your connection and try again." };
  }
}

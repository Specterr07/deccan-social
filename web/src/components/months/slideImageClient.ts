export type SlideImageResult = { ok: true } | { ok: false; message: string };

// Calls the slide-image API from the browser (upload a file, pick a library image, or remove) and
// turns every failure into a plain message the person can read.
export async function sendSlideImage(slideId: string, method: "POST" | "DELETE", body?: FormData): Promise<SlideImageResult> {
  try {
    const response = await fetch(`/api/slides/${slideId}/image`, { method, body });
    if (response.ok) return { ok: true };
    const data = await response.json().catch(() => ({ error: "Something went wrong." }));
    return { ok: false, message: data.error };
  } catch {
    // fetch itself failed: the network dropped or the server is down.
    return { ok: false, message: "Could not reach the server. Check your connection and try again." };
  }
}

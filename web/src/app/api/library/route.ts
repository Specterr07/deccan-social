import { createAssetFromFile } from "@/lib/library/createAsset";
import { UPLOAD_KINDS, parseTags, type UploadKind } from "@/lib/library/assetRules";
import { listAssets } from "@/lib/library/queries";

// GET /api/library?kind=&tag=&q= — library images for the picker dialog.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    const items = await listAssets({ kind: params.get("kind") ?? undefined, tag: params.get("tag") ?? undefined, search: params.get("q") ?? undefined });
    return Response.json({ items });
  } catch (error) {
    console.error("Could not list the library:", error);
    return Response.json({ error: "We could not load the library. Please try again." }, { status: 500 });
  }
}

// POST /api/library — upload one or many images (form fields: files, kind, tags "a, b", people_ok).
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    // The body was not a form upload (or was cut off).
    return Response.json({ error: "The upload did not arrive properly. Please try again." }, { status: 400 });
  }

  const kind = String(formData.get("kind") ?? "photo") as UploadKind;
  if (!UPLOAD_KINDS.includes(kind)) return Response.json({ error: "Choose what kind of image this is." }, { status: 400 });
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return Response.json({ error: "Please choose at least one image." }, { status: 400 });

  const tags = parseTags(String(formData.get("tags") ?? ""));
  const peopleOk = formData.get("people_ok") === "on";
  const created: { name: string; url: string }[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const result = await createAssetFromFile({ file, kind, tags, peopleOk });
    if (result.ok) created.push({ name: result.name, url: result.url });
    else errors.push(result.message);
  }
  return Response.json({ created, errors }, { status: created.length > 0 ? 201 : 400 });
}

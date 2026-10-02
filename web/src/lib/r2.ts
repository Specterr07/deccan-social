import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

// Cloudflare R2 speaks the S3 protocol; "auto" is the region name R2 expects.
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});

// The public address of a stored file (needs the bucket's public access / r2.dev URL).
export function publicUrlFor(key: string): string {
  return `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
}

// Saves a file to R2 and returns its public URL.
export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<string> {
  try {
    await r2.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Body: body, ContentType: contentType }));
    return publicUrlFor(key);
  } catch (error) {
    // Fails on wrong R2 keys, a missing bucket, or a network drop.
    throw new Error(`Could not save ${key} to storage: ${(error as Error).message}`);
  }
}

// Reads a file back from R2 (used to re-plan from the stored calendar PDF).
export async function downloadObject(key: string): Promise<Buffer> {
  try {
    const result = await r2.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
    if (!result.Body) throw new Error("the file is empty");
    return Buffer.from(await result.Body.transformToByteArray());
  } catch (error) {
    // Fails if the key does not exist (NoSuchKey) or storage is unreachable.
    throw new Error(`Could not read ${key} from storage: ${(error as Error).message}`);
  }
}

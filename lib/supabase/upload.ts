import { createAdminClient } from "./admin";

const BUCKET = "portfolio-media";
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function extFor(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

/** Upload an image to Supabase Storage. Returns the storage path. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (file.size === 0) throw new Error("Empty file.");
  if (file.size > MAX_BYTES) {
    throw new Error("Image is larger than 4 MB.");
  }
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or AVIF.");
  }

  const client = createAdminClient();
  const path = `${folder}/${crypto.randomUUID()}.${extFor(file.type)}`;
  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function removeImage(path: string): Promise<void> {
  const client = createAdminClient();
  await client.storage.from(BUCKET).remove([path]);
}

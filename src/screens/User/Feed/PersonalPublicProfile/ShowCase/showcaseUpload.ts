import { supabase } from "../../../../../services/supabase";

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/^data:image\/\w+;base64,/, "").replace(/[^A-Za-z0-9+/=]/g, "");
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  const byteLength = (clean.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);

  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const e1 = B64_CHARS.indexOf(clean[i]);
    const e2 = B64_CHARS.indexOf(clean[i + 1]);
    const e3 = B64_CHARS.indexOf(clean[i + 2]);
    const e4 = B64_CHARS.indexOf(clean[i + 3]);

    const c1 = (e1 << 2) | (e2 >> 4);
    const c2 = ((e2 & 15) << 4) | (e3 >> 2);
    const c3 = ((e3 & 3) << 6) | e4;

    bytes[p++] = c1;
    if (e3 !== -1 && clean[i + 2] !== "=") bytes[p++] = c2;
    if (e4 !== -1 && clean[i + 3] !== "=") bytes[p++] = c3;
  }

  return bytes;
}

export async function uploadImagemVitrine(
  userId: string,
  pasta: "capa" | "avatar" | "feed",
  base64: string
): Promise<string> {
  const bytes = base64ToUint8Array(base64);
  const filePath = `${userId}/${pasta}-${Date.now()}.jpg`;

  const { error } = await supabase.storage.from("vitrine-personal").upload(filePath, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("vitrine-personal").getPublicUrl(filePath);
  return data.publicUrl;
}
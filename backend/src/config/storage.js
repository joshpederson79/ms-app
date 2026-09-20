import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { HttpError } from '../middleware/errorHandler.js';

// Created on first use so the API still boots (and everything except recording uploads works)
// before Supabase Storage is configured.
let client;
const bucket = () => {
  if (!env.supabase.url || !env.supabase.key) {
    throw new HttpError(503, 'File storage is not configured', 'storage_unavailable');
  }
  client ??= createClient(env.supabase.url, env.supabase.key, { auth: { persistSession: false } });
  return client.storage.from(env.supabase.bucket);
};

// Uploads an in-memory file (multer) and returns its storage path and public URL.
export async function uploadRecording({ buffer, fileName, contentType }) {
  // Timestamp prefix avoids collisions; stripping odd characters keeps the storage key URL-safe.
  const path = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await bucket().upload(path, buffer, { contentType, upsert: false });
  if (error) throw new HttpError(502, `Upload failed: ${error.message}`, 'storage_error');
  return { path, url: getPublicUrl(path) };
}

export async function deleteRecording(path) {
  const { error } = await bucket().remove([path]);
  if (error) throw new HttpError(502, `Delete failed: ${error.message}`, 'storage_error');
}

export const getPublicUrl = (path) => bucket().getPublicUrl(path).data.publicUrl;

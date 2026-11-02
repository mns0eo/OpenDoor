"use client";

// DEMO MODE video storage. Videos are too large for localStorage, so they are kept in
// this browser's IndexedDB and referenced by id. In production, upload to Supabase Storage
// (bucket "intro-videos") and store the public URL instead.

const DB_NAME = "opendoor-media";
const STORE = "videos";

export const MAX_VIDEO_MB = 100;
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const r = fn(t.objectStore(STORE));
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      }),
  );
}

export function validateVideo(file: File): string | null {
  if (!VIDEO_TYPES.includes(file.type)) return "Please upload an MP4, WebM, or MOV video.";
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) return `Video must be ${MAX_VIDEO_MB} MB or smaller.`;
  return null;
}

export async function saveVideo(file: File): Promise<string> {
  const id = `vid_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  await tx("readwrite", (s) => s.put(file, id));
  return id;
}

export async function loadVideo(id: string): Promise<Blob | null> {
  try {
    return ((await tx("readonly", (s) => s.get(id))) as Blob | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function deleteVideo(id: string) {
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}

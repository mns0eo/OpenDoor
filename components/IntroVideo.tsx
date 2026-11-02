"use client";

import { useEffect, useRef, useState } from "react";
import { Film, Loader2, PlayCircle, Trash2, Upload } from "lucide-react";
import { deleteVideo, loadVideo, MAX_VIDEO_MB, saveVideo, validateVideo } from "@/lib/videoStore";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

/** Loads a stored intro video and returns an object URL for it (or null). */
function useVideoUrl(id: string | null) {
  const [state, setState] = useState<{ url: string | null; loading: boolean }>({ url: null, loading: !!id });
  useEffect(() => {
    if (!id) return setState({ url: null, loading: false });
    let url: string | null = null;
    let alive = true;
    setState({ url: null, loading: true });
    loadVideo(id).then((blob) => {
      if (!alive) return;
      url = blob ? URL.createObjectURL(blob) : null;
      setState({ url, loading: false });
    });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return state;
}

/** Read-only player for a mentor's intro video. */
export function IntroVideoPlayer({ videoId, name, className }: { videoId: string | null; name: string; className?: string }) {
  const { url, loading } = useVideoUrl(videoId);
  if (loading) {
    return (
      <div className={cn("flex aspect-video items-center justify-center rounded-xl bg-paper", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-teal" />
      </div>
    );
  }
  if (!url) {
    return (
      <div className={cn("flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper px-4 text-center text-ink-faint", className)}>
        <PlayCircle className="h-7 w-7" />
        <p className="mt-2 text-sm font-medium text-ink-muted">{videoId ? "Video not available on this device" : "No intro video yet"}</p>
        <p className="text-xs">
          {videoId ? "In demo mode, videos are saved only in the browser they were uploaded from." : `${name.split(" ")[0]} hasn't uploaded an introduction video.`}
        </p>
      </div>
    );
  }
  return (
    <video src={url} controls playsInline preload="metadata" className={cn("aspect-video w-full rounded-xl bg-black", className)} aria-label={`Introduction video from ${name}`} />
  );
}

/** Upload / replace / remove an intro video. Calls onChange with the new video id (or null). */
export function IntroVideoUpload({ value, onChange, name }: { value: string | null; onChange: (id: string | null) => void; name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    const err = validateVideo(file);
    if (err) return setError(err);
    setError(null);
    setBusy(true);
    try {
      const id = await saveVideo(file);
      if (value) await deleteVideo(value);
      onChange(id);
    } catch {
      setError("Couldn't save the video in this browser. Try a smaller file.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    if (value) await deleteVideo(value);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      {value && <IntroVideoPlayer videoId={value} name={name} />}
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
          busy ? "border-teal bg-teal-50" : "border-line bg-paper",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files[0]);
        }}
      >
        <Film className="h-6 w-6 text-teal" aria-hidden />
        <div className="text-sm text-ink-muted">
          <p className="font-medium text-navy">{value ? "Replace your intro video" : "Upload a short introduction video"}</p>
          <p className="text-xs">MP4, WebM or MOV · up to {MAX_VIDEO_MB} MB · 1–2 minutes recommended</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" loading={busy} onClick={() => input.current?.click()}>
            <Upload className="h-4 w-4" /> {value ? "Choose new video" : "Choose video"}
          </Button>
          {value && (
            <Button size="sm" variant="ghost" onClick={remove}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
        <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Upload intro video" />
      </div>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <p className="text-xs text-ink-faint">Demo mode: the video is stored only in this browser. In production it would be uploaded to secure cloud storage.</p>
    </div>
  );
}

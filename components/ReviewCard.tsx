"use client";

import { useState } from "react";
import { CornerDownRight, Globe, Lock } from "lucide-react";
import { shortName } from "@/lib/sessions";
import { useStore } from "@/lib/store";
import type { Feedback } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { validateReply } from "@/lib/validation";
import { useToast } from "./Toast";
import { Avatar, Badge, Button, Card, Stars, Textarea } from "./ui";

/** A mentee's review of a mentor, with the mentor's reply. `canReply` shows the reply form. */
export function ReviewCard({ f, menteeName, mentorName, canReply, showVisibility }: { f: Feedback; menteeName: string; mentorName: string; canReply?: boolean; showVisibility?: boolean }) {
  const { actions } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [reply, setReply] = useState(f.mentorReply);
  const [error, setError] = useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateReply(reply);
    if (err) return setError(err);
    const res = actions.replyToReview(f.id, reply);
    if (!res.ok) return setError(res.error);
    setEditing(false);
    setError(null);
    toast("Reply posted");
  };

  return (
    <Card as="li" className="list-none p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={menteeName} seed={f.menteeId} size="sm" />
          <div>
            <p className="font-medium text-navy">{shortName(menteeName)}</p>
            <p className="text-xs text-ink-faint">{formatDate(f.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Stars value={f.rating} />
          {showVisibility && (
            f.consentToShare
              ? <Badge tone="teal"><Globe className="h-3 w-3" /> Public</Badge>
              : <Badge><Lock className="h-3 w-3" /> Private</Badge>
          )}
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">{f.review || <span className="italic text-ink-faint">No written review.</span>}</p>

      {f.mentorReply && !editing && (
        <div className="mt-4 flex gap-2 rounded-xl bg-paper p-3">
          <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
          <div className="text-sm">
            <p className="font-medium text-navy">Reply from {mentorName.split(" ")[0]}</p>
            <p className="mt-0.5 text-ink-muted">{f.mentorReply}</p>
          </div>
        </div>
      )}

      {canReply && !editing && (
        <Button size="sm" variant="ghost" className="mt-3" onClick={() => setEditing(true)}>
          <CornerDownRight className="h-4 w-4" /> {f.mentorReply ? "Edit reply" : "Reply"}
        </Button>
      )}
      {canReply && editing && (
        <form onSubmit={save} className="mt-4 space-y-2" noValidate>
          <label htmlFor={`reply-${f.id}`} className="text-sm font-medium text-navy">Your reply{f.consentToShare ? " (shown publicly under the review)" : ""}</label>
          <Textarea id={`reply-${f.id}`} rows={2} maxLength={600} value={reply} invalid={!!error} onChange={(e) => { setReply(e.target.value); setError(null); }} placeholder="Thank them, or share a tip to keep going." />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setReply(f.mentorReply); setError(null); }}>Cancel</Button>
            <Button size="sm" type="submit">Post reply</Button>
          </div>
        </form>
      )}
    </Card>
  );
}

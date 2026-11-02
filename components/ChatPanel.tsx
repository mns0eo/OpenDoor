"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Send, ShieldCheck } from "lucide-react";
import { chatState, CHAT_DAYS_AFTER } from "@/lib/sessions";
import { useStore } from "@/lib/store";
import type { MentoringRequest, User } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { Avatar, Button } from "./ui";

/** Mentor ⇄ mentee chat for one session. Admins can read (not write) for safety review. */
export function ChatPanel({ request: r, user, mentorName }: { request: MentoringRequest; user: User; mentorName: string }) {
  const { db, actions } = useStore();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const messages = (db?.messages ?? []).filter((m) => m.requestId === r.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const state = chatState(r);
  const isParticipant = user.id === r.menteeId || user.id === r.mentorUserId;
  const canWrite = state.kind === "open" && isParticipant;

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const nameOf = (id: string) => (id === r.mentorUserId ? mentorName : r.menteeName);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const res = actions.sendMessage(r.id, text);
    if (!res.ok) return setError(res.error);
    setText("");
    setError(null);
  };

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-semibold text-navy">Session chat</p>
        {state.kind === "open" ? (
          <span className="text-xs text-ink-muted">Open until {formatDateTime(state.closesAt.toISOString())}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-ink-faint"><Lock className="h-3 w-3" /> {state.kind === "not-yet" ? "Not open yet" : "Closed"}</span>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-paper/60 px-4 py-4" aria-live="polite">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-faint">
            {state.kind === "open" ? "No messages yet. Say hi and confirm the details!" : "No messages."}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div key={m.id} className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
                <Avatar name={nameOf(m.senderId)} seed={m.senderId === r.mentorUserId ? r.mentorId : r.menteeId} size="sm" className="h-7 w-7 text-[10px]" />
                <div className={cn("max-w-[75%]", mine && "text-right")}>
                  <div className={cn("inline-block whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-left text-sm", mine ? "rounded-br-md bg-navy text-white" : "rounded-bl-md border border-line bg-white text-ink")}>
                    {m.body}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    {!mine && <>{nameOf(m.senderId).split(" ")[0]} · </>}
                    {new Date(m.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottom} />
      </div>

      {canWrite ? (
        <form onSubmit={send} className="border-t border-line p-3">
          <div className="flex items-end gap-2">
            <label htmlFor="chat-input" className="sr-only">Message</label>
            <textarea
              id="chat-input"
              rows={1}
              maxLength={1000}
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.currentTarget.form as HTMLFormElement).requestSubmit();
                }
              }}
              placeholder="Write a message… (Enter to send)"
              className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/40"
            />
            <Button type="submit" className="h-11 w-11 shrink-0 px-0" aria-label="Send message" disabled={!text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="mt-1.5 text-xs text-red-700" role="alert">{error}</p>}
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-faint">
            <ShieldCheck className="h-3 w-3" /> Be kind and keep it about the session. Messages may be reviewed by school administrators for safety.
          </p>
        </form>
      ) : (
        <div className="border-t border-line bg-paper px-4 py-3 text-center text-xs text-ink-muted">
          {!isParticipant ? "Read-only (administrator view)." : state.kind === "open" ? "" : state.reason}
          {isParticipant && state.kind !== "open" && state.kind !== "not-yet" && ` Chat is available until ${CHAT_DAYS_AFTER} days after a session.`}
        </div>
      )}
    </div>
  );
}

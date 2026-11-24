"use client";

import { Flag } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { addCommentAction, createPostAction, postProjectUpdateAction, reportAction, type FormState } from "@/app/actions/community";
import { PendingButton } from "../pending-button";
import { Notice, Textarea } from "../ui";

function useResetOnOk(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function PostComposer({ circleId, circleName }: { circleId: string; circleName: string }) {
  const [state, action] = useActionState<FormState, FormData>(createPostAction, undefined);
  const ref = useResetOnOk(state);
  return (
    <form ref={ref} action={action} className="space-y-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="circleId" value={circleId} />
      <label htmlFor="post-body" className="sr-only">
        Share with {circleName}
      </label>
      <Textarea
        id="post-body"
        name="body"
        rows={3}
        maxLength={5000}
        required
        placeholder={`Share a reflection, question or discovery with ${circleName}…`}
        className="border-0 bg-transparent px-1 focus:ring-0"
      />
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">Speak from your own experience, and be kind.</p>
        <PendingButton size="sm" pendingLabel="Posting…">
          Post
        </PendingButton>
      </div>
    </form>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const [state, action] = useActionState<FormState, FormData>(addCommentAction, undefined);
  const ref = useResetOnOk(state);
  return (
    <form ref={ref} action={action} className="flex items-start gap-2">
      <input type="hidden" name="postId" value={postId} />
      <label htmlFor={`c-${postId}`} className="sr-only">
        Reply
      </label>
      <textarea
        id={`c-${postId}`}
        name="body"
        rows={1}
        maxLength={2000}
        required
        placeholder="Write a reply…"
        className="field-sizing-content min-h-9 flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none"
      />
      <PendingButton size="sm" variant="secondary" pendingLabel="…">
        Reply
      </PendingButton>
      {state?.error ? <p className="sr-only" role="alert">{state.error}</p> : null}
    </form>
  );
}

export function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const [state, action] = useActionState<FormState, FormData>(postProjectUpdateAction, undefined);
  const ref = useResetOnOk(state);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <Textarea name="body" rows={3} maxLength={3000} required placeholder="Share progress, a need, or something you learned…" aria-label="Project update" />
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <PendingButton size="sm" pendingLabel="Posting…">
        Post update
      </PendingButton>
    </form>
  );
}

export function ReportButton({ targetType, targetId }: { targetType: "post" | "comment" | "project_update"; targetId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(reportAction, undefined);
  if (state?.ok) return <span className="text-xs text-muted">Reported. Thank you.</span>;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-ink"
        aria-expanded={open}
      >
        <Flag className="size-3" /> Report
      </button>
      {open ? (
        <form action={action} className="absolute right-0 z-10 mt-1 w-72 space-y-2 rounded-xl border border-line bg-surface p-3 shadow-soft">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <label htmlFor={`r-${targetId}`} className="text-xs font-medium text-ink">
            What&rsquo;s the concern?
          </label>
          <Textarea id={`r-${targetId}`} name="reason" rows={2} maxLength={500} required className="text-sm" />
          {state?.error ? <p className="text-xs text-rose">{state.error}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-ink">
              Cancel
            </button>
            <PendingButton size="sm" variant="secondary" pendingLabel="Sending…">
              Send to moderators
            </PendingButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}

/** Renders a time in the viewer's own time zone (server renders a UTC fallback first). */
export function LocalTime({ iso, withDay = true }: { iso: string; withDay?: boolean }) {
  const [text, setText] = useState(() => new Date(iso).toUTCString().slice(0, 22) + " UTC");
  useEffect(() => {
    setText(
      new Date(iso).toLocaleString(undefined, {
        weekday: withDay ? "short" : undefined,
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
    );
  }, [iso, withDay]);
  return <time dateTime={iso}>{text}</time>;
}

export function TzOffsetInput() {
  const [offset, setOffset] = useState(0);
  useEffect(() => setOffset(new Date().getTimezoneOffset()), []);
  return <input type="hidden" name="tzOffset" value={offset} />;
}

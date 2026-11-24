import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteOwnCommentAction, deleteOwnPostAction, toggleResonateAction } from "@/app/actions/community";
import type { FeedPost } from "@/lib/community";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { Initials } from "../ui";
import { CommentForm, ReportButton } from "./forms";

export function PostCard({ post, viewerId, showCircle }: { post: FeedPost; viewerId?: string; showCircle?: boolean }) {
  return (
    <article id={post.id} className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5">
      <header className="flex items-start gap-3">
        <Initials name={post.author.name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <Link href={`/members/${post.author.id}`} className="font-medium text-ink hover:underline">
              {post.author.name}
            </Link>
            {showCircle ? (
              <>
                <span className="text-muted"> in </span>
                <Link href={`/community/circles/${post.circle.slug}`} className="text-ink-2 hover:underline">
                  {post.circle.name}
                </Link>
              </>
            ) : null}
          </p>
          <p className="text-xs text-muted">{relativeTime(post.createdAt)}</p>
        </div>
      </header>

      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink">{post.body}</p>

      <div className="mt-4 flex items-center gap-1">
        {viewerId ? (
          <form action={toggleResonateAction}>
            <input type="hidden" name="postId" value={post.id} />
            <button
              aria-pressed={post.resonated}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors",
                post.resonated ? "bg-gold-soft text-gold-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Heart className={cn("size-3.5", post.resonated && "fill-current")} />
              {post.resonates > 0 ? post.resonates : null} <span className="sr-only sm:not-sr-only">Resonates</span>
            </button>
          </form>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm text-muted">
            <Heart className="size-3.5" /> {post.resonates}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          {viewerId && viewerId === post.author.id ? (
            <form action={deleteOwnPostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <button className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-rose">
                <Trash2 className="size-3" /> Delete
              </button>
            </form>
          ) : viewerId ? (
            <ReportButton targetType="post" targetId={post.id} />
          ) : null}
        </span>
      </div>

      {post.comments.length || viewerId ? (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          {post.comments.map((c) => (
            <div key={c.id} className="group flex gap-2.5">
              <Initials name={c.author.name} className="size-7 text-[0.7rem]" />
              <div className="min-w-0 flex-1 rounded-xl bg-surface-2/70 px-3 py-2">
                <p className="text-xs">
                  <Link href={`/members/${c.author.id}`} className="font-medium text-ink hover:underline">
                    {c.author.name}
                  </Link>{" "}
                  <span className="text-muted">· {relativeTime(c.createdAt)}</span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{c.body}</p>
              </div>
              {viewerId === c.author.id ? (
                <form action={deleteOwnCommentAction} className="self-center">
                  <input type="hidden" name="commentId" value={c.id} />
                  <button className="rounded-full p-1 text-muted opacity-0 hover:text-rose focus:opacity-100 group-hover:opacity-100" aria-label="Delete reply">
                    <Trash2 className="size-3" />
                  </button>
                </form>
              ) : viewerId ? (
                <div className="self-center opacity-0 focus-within:opacity-100 group-hover:opacity-100">
                  <ReportButton targetType="comment" targetId={c.id} />
                </div>
              ) : null}
            </div>
          ))}
          {viewerId ? <CommentForm postId={post.id} /> : null}
        </div>
      ) : null}
    </article>
  );
}

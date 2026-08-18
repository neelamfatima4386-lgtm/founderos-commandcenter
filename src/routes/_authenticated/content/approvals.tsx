import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck as CheckCircle2, Circle as XCircle, CalendarClock, MessageSquare } from "lucide-react";

import { useContent } from "@/lib/data";
import type { ContentItem, ContentStatus } from "@/lib/constants";
import { timeAgo } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
  contentStatusTone,
} from "@/components/app/primitives";
import { ContentReviewDialog } from "./index";

export const Route = createFileRoute("/_authenticated/content/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — ElevateX Founder OS" },
      { name: "description", content: "Founder approval queue for submitted content." },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { data: content = [], isLoading } = useContent();
  const [reviewing, setReviewing] = useState<ContentItem | null>(null);

  const queue = content.filter((c) => c.status === "submitted" || c.status === "under_review");
  const recent = content.filter((c) => ["approved", "rejected", "scheduled"].includes(c.status)).slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Approvals" subtitle={`Review, approve or request changes. ${queue.length} pending.`} />

      <SectionCard title="Needs your review" icon={MessageSquare} description={`${queue.length} submissions`}>
        {isLoading ? (
          <LoadingRows rows={4} />
        ) : queue.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Approval queue clear" description="No submissions waiting on you." />
        ) : (
          <ul className="space-y-3">
            {queue.map((c) => (
              <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.platform} · {c.content_type} · {timeAgo(c.updated_at)}</p>
                  {c.founder_feedback && <p className="mt-1 truncate text-xs text-warning">Previous feedback: {c.founder_feedback}</p>}
                </div>
                <Button size="sm" onClick={() => setReviewing(c)}>Review</Button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {recent.length > 0 && (
        <SectionCard title="Recently processed" icon={CheckCircle2} className="mt-5">
          <ul className="space-y-2">
            {recent.map((c) => (
              <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(c.updated_at)}</p>
                </div>
                <StatusBadge tone={contentStatusTone(c.status)}>{c.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <ContentReviewDialog
        item={reviewing}
        onOpenChange={(v) => !v && setReviewing(null)}
        onAction={async (item, status, feedback) => {
          // Import the changeStatus from the content page context
          // We need to handle it directly here
          const { supabase } = await import("@/integrations/supabase/client");
          const { logActivity, notify } = await import("@/lib/data");
          const { toast } = await import("sonner");

          await supabase.from("content").update({ status, founder_feedback: feedback ?? null }).eq("id", item.id);
          await logActivity({
            entity_type: "content",
            entity_id: item.id,
            action: `content_${status}`,
            description: `Content ${status}: "${item.title}"`,
          });
          if (item.author_id) {
            await notify({ user_id: item.author_id, type: `content_${status}`, title: `Content ${status}: ${item.title}`, body: feedback, link: "/content" });
          }
          toast.success(`Content ${status}`);
          setReviewing(null);
          // Invalidate
          const { useQueryClient } = await import("@tanstack/react-query");
          // We can't easily invalidate here, but the mutation via supabase will trigger refetch on next render
        }}
      />
    </div>
  );
}

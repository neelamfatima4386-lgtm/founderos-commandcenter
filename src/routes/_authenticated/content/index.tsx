import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Plus, CircleCheck as CheckCircle2, Circle as XCircle, MessageSquare, CalendarClock, Send } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  useContent,
  useContentFeedback,
  useUpsert,
  logActivity,
  notify,
} from "@/lib/data";
import {
  CONTENT_PLATFORMS,
  CONTENT_KINDS,
  CONTENT_STATUSES,
  type ContentItem,
  type ContentStatus,
  type ContentPlatform,
  type ContentKind,
} from "@/lib/constants";
import { fmtDate, fmtDateTime, timeAgo } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  KpiCard,
  LoadingCards,
  PageHeader,
  SectionCard,
  StatusBadge,
  contentStatusTone,
} from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";

export const Route = createFileRoute("/_authenticated/content/")({
  head: () => ({
    meta: [
      { title: "Content — ElevateX Founder OS" },
      { name: "description", content: "Content pipeline and approval workflow." },
    ],
  }),
  component: ContentPage,
});

function ContentPage() {
  const { user, profile, isFounder } = useAuth();
  const navigate = useNavigate();
  const { data: content = [], isLoading } = useContent();
  const contentUpsert = useUpsert("content", "Content saved");
  const feedbackUpsert = useUpsert("content_feedback");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [reviewing, setReviewing] = useState<ContentItem | null>(null);

  const pending = content.filter((c) => c.status === "submitted" || c.status === "under_review");
  const approved = content.filter((c) => c.status === "approved");
  const scheduled = content.filter((c) => c.status === "scheduled");
  const published = content.filter((c) => c.status === "published");

  async function changeStatus(item: ContentItem, status: ContentStatus, feedback?: string) {
    await contentUpsert.mutateAsync({ id: item.id, status, founder_feedback: feedback ?? null });
    if (user) {
      await logActivity({
        entity_type: "content",
        entity_id: item.id,
        action: `content_${status}`,
        description: `${profile?.full_name ?? "Someone"} ${status} "${item.title}"`,
      });
      // Notify the author
      if (item.author_id && item.author_id !== user.id) {
        await notify({
          user_id: item.author_id,
          type: `content_${status}`,
          title: `Content ${status}: ${item.title}`,
          body: feedback ?? undefined,
          link: "/content",
        });
      }
    }
    toast.success(`Content ${status}`);
    setReviewing(null);
  }

  const columns: Column<ContentItem>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (c) => c.title,
      render: (c) => (
        <button onClick={() => setReviewing(c)} className="truncate font-medium hover:text-primary">{c.title}</button>
      ),
    },
    {
      key: "platform",
      header: "Platform",
      sortValue: (c) => c.platform,
      render: (c) => <span className="text-muted-foreground">{CONTENT_PLATFORMS.find((p) => p.value === c.platform)?.label ?? c.platform}</span>,
    },
    {
      key: "content_type",
      header: "Type",
      sortValue: (c) => c.content_type,
      render: (c) => <span className="text-muted-foreground">{CONTENT_KINDS.find((k) => k.value === c.content_type)?.label ?? c.content_type}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (c) => c.status,
      render: (c) => (
        <Select value={c.status} onValueChange={(v) => changeStatus(c, v as ContentStatus)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CONTENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "scheduled_at",
      header: "Scheduled",
      sortValue: (c) => c.scheduled_at ?? "",
      render: (c) => <span className="text-muted-foreground">{c.scheduled_at ? fmtDate(c.scheduled_at) : "—"}</span>,
    },
    {
      key: "updated_at",
      header: "Updated",
      sortValue: (c) => c.updated_at,
      render: (c) => <span className="text-muted-foreground">{timeAgo(c.updated_at)}</span>,
    },
  ];

  const filters: FilterDef[] = [
    {
      key: "status",
      placeholder: "Status",
      options: CONTENT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
      match: (row, value) => (row.status as string) === value,
    },
    {
      key: "platform",
      placeholder: "Platform",
      options: CONTENT_PLATFORMS.map((p) => ({ value: p.value, label: p.label })),
      match: (row, value) => (row.platform as string) === value,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Content"
        subtitle="Draft, submit, approve and schedule content."
        actions={<Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="mr-1.5 size-4" /> Add Content</Button>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Needs approval" value={pending.length} icon={MessageSquare} tone="warning" onClick={() => void navigate({ to: "/content/approvals" })} />
        <KpiCard label="Approved" value={approved.length} icon={CheckCircle2} tone="success" />
        <KpiCard label="Scheduled" value={scheduled.length} icon={CalendarClock} tone="info" />
        <KpiCard label="Published" value={published.length} icon={Send} tone="success" />
      </div>

      {isFounder && pending.length > 0 && (
        <SectionCard title="Needs your review" icon={MessageSquare} description={`${pending.length} submissions`} className="mb-5"
          action={<Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/content/approvals" })}>Review all</Button>}>
          <ul className="space-y-2">
            {pending.slice(0, 4).map((c) => (
              <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.platform} · {c.content_type}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setReviewing(c)}>Review</Button>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="All content" icon={FileText} description={`${content.length} items`}>
        {isLoading ? (
          <LoadingCards cards={4} />
        ) : (
          <DataTable
            data={content}
            columns={columns}
            searchKeys={(c) => `${c.title} ${c.idea ?? ""} ${c.draft ?? ""} ${c.caption ?? ""} ${c.hashtags ?? ""}`}
            filters={filters}
            onRowClick={(c) => setReviewing(c)}
            emptyState={
              <EmptyState
                icon={FileText}
                title="No content yet"
                description="Add your first content piece to start the pipeline."
                action={<Button onClick={() => setFormOpen(true)}><Plus className="mr-1.5 size-4" /> Add Content</Button>}
              />
            }
          />
        )}
      </SectionCard>

      <ContentFormDialog open={formOpen} onOpenChange={setFormOpen} content={editing} userId={user?.id} />
      <ContentReviewDialog
        item={reviewing}
        onOpenChange={(v) => !v && setReviewing(null)}
        onAction={changeStatus}
      />
    </div>
  );
}

export function ContentFormDialog({
  open,
  onOpenChange,
  content,
  userId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content?: ContentItem | null;
  userId?: string;
}) {
  const upsert = useUpsert("content", content ? "Content updated" : "Content created");
  const [values, setValues] = useState({
    title: content?.title ?? "",
    platform: content?.platform ?? ("linkedin" as ContentPlatform),
    content_type: content?.content_type ?? ("post" as ContentKind),
    idea: content?.idea ?? "",
    draft: content?.draft ?? "",
    caption: content?.caption ?? "",
    hashtags: content?.hashtags ?? "",
    status: content?.status ?? ("idea" as ContentStatus),
    scheduled_at: content?.scheduled_at ? content.scheduled_at.slice(0, 16) : "",
  });

  function set<K extends keyof typeof values>(key: K, val: typeof values[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function save() {
    if (!values.title.trim()) return;
    await upsert.mutateAsync({
      ...(content ? { id: content.id } : {}),
      title: values.title.trim(),
      platform: values.platform,
      content_type: values.content_type,
      idea: values.idea || null,
      draft: values.draft || null,
      caption: values.caption || null,
      hashtags: values.hashtags || null,
      status: values.status,
      scheduled_at: values.scheduled_at ? new Date(values.scheduled_at).toISOString() : null,
      ...(content ? {} : { author_id: userId ?? null }),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{content ? "Edit Content" : "Add Content"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div><Label className="mb-1.5 block text-xs">Title *</Label><Input value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="How we ship a client demo" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs">Platform</Label>
              <Select value={values.platform} onValueChange={(v) => set("platform", v as ContentPlatform)}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  {CONTENT_PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Type</Label>
              <Select value={values.content_type} onValueChange={(v) => set("content_type", v as ContentKind)}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  {CONTENT_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v as ContentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  {CONTENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="mb-1.5 block text-xs">Schedule</Label><Input type="datetime-local" value={values.scheduled_at} onChange={(e) => set("scheduled_at", e.target.value)} /></div>
          </div>
          <div><Label className="mb-1.5 block text-xs">Idea</Label><Textarea value={values.idea} onChange={(e) => set("idea", e.target.value)} rows={2} /></div>
          <div><Label className="mb-1.5 block text-xs">Draft</Label><Textarea value={values.draft} onChange={(e) => set("draft", e.target.value)} rows={4} /></div>
          <div><Label className="mb-1.5 block text-xs">Caption</Label><Textarea value={values.caption} onChange={(e) => set("caption", e.target.value)} rows={2} /></div>
          <div><Label className="mb-1.5 block text-xs">Hashtags</Label><Input value={values.hashtags} onChange={(e) => set("hashtags", e.target.value)} placeholder="#agency #webdesign" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={upsert.isPending || !values.title.trim()}>{upsert.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ContentReviewDialog({
  item,
  onOpenChange,
  onAction,
}: {
  item: ContentItem | null;
  onOpenChange: (v: boolean) => void;
  onAction: (item: ContentItem, status: ContentStatus, feedback?: string) => void;
}) {
  const { data: feedback = [] } = useContentFeedback(item?.id);
  const [feedbackText, setFeedbackText] = useState("");
  if (!item) return null;

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{item.title}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StatusBadge tone={contentStatusTone(item.status)}>{item.status}</StatusBadge>
            <span className="text-xs text-muted-foreground">{item.platform} · {item.content_type}</span>
          </div>
          {item.idea && <div><p className="text-xs font-medium text-muted-foreground">Idea</p><p className="text-sm">{item.idea}</p></div>}
          {item.draft && <div><p className="text-xs font-medium text-muted-foreground">Draft</p><p className="mt-1 rounded-lg bg-muted/30 p-3 text-sm">{item.draft}</p></div>}
          {item.caption && <div><p className="text-xs font-medium text-muted-foreground">Caption</p><p className="text-sm">{item.caption}</p></div>}
          {item.hashtags && <div><p className="text-xs font-medium text-muted-foreground">Hashtags</p><p className="text-sm text-primary">{item.hashtags}</p></div>}
          {item.founder_feedback && <div className="rounded-lg border border-warning/30 bg-warning/10 p-3"><p className="text-xs font-medium text-warning">Founder feedback</p><p className="mt-1 text-sm">{item.founder_feedback}</p></div>}

          {feedback.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Feedback history</p>
              {feedback.map((f) => (
                <div key={f.id} className="rounded-lg border border-border/60 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{f.action} · {timeAgo(f.created_at)}</p>
                  <p className="text-sm">{f.body}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label className="mb-1 block text-xs">Add feedback</Label>
            <Textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Write feedback for the co-founder…" rows={2} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onAction(item, "approved", feedbackText || undefined)}><CheckCircle2 className="mr-1 size-3.5" /> Approve</Button>
            <Button size="sm" variant="destructive" onClick={() => onAction(item, "rejected", feedbackText || undefined)}><XCircle className="mr-1 size-3.5" /> Reject</Button>
            <Button size="sm" variant="secondary" onClick={() => onAction(item, "under_review", feedbackText || undefined)}>Request changes</Button>
            <Button size="sm" variant="secondary" onClick={() => onAction(item, "scheduled", feedbackText || undefined)}><CalendarClock className="mr-1 size-3.5" /> Schedule</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

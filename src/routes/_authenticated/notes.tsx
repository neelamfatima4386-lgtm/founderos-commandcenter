import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StickyNote, Plus, Pin, Trash2, Pencil, Search } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  useNotes,
  useLeads,
  useTasks,
  useContent,
  useUpsert,
  useRemove,
} from "@/lib/data";
import { fmtDate, timeAgo } from "@/lib/app-utils";
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
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/app/primitives";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes — ElevateX Founder OS" },
      { name: "description", content: "Create, pin, tag and link notes to leads, tasks and content." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { user } = useAuth();
  const { data: notes = [], isLoading } = useNotes();
  const { data: leads = [] } = useLeads();
  const { data: tasks = [] } = useTasks();
  const { data: content = [] } = useContent();
  const noteUpsert = useUpsert("notes", "Note saved");
  const noteRemove = useRemove("notes", "Note deleted");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof notes)[number] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = notes.filter((n) =>
    !search.trim() ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body?.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  async function togglePin(note: (typeof notes)[number]) {
    await noteUpsert.mutateAsync({ id: note.id, pinned: !note.pinned });
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Notes"
        subtitle="Capture ideas, link them to leads, tasks and content."
        actions={<Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="mr-1.5 size-4" /> Add Note</Button>}
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      {isLoading ? (
        <LoadingRows rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={StickyNote} title="No notes yet" description="Create your first note to get started." action={<Button onClick={() => setFormOpen(true)}><Plus className="mr-1.5 size-4" /> Add Note</Button>} />
      ) : (
        <div className="space-y-5">
          {pinned.length > 0 && (
            <SectionCard title="Pinned" icon={Pin} description={`${pinned.length} pinned`}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pinned.map((n) => <NoteCard key={n.id} note={n} leads={leads} onEdit={() => { setEditing(n); setFormOpen(true); }} onDelete={() => setDeleteId(n.id)} onPin={() => togglePin(n)} />)}
              </div>
            </SectionCard>
          )}
          {unpinned.length > 0 && (
            <SectionCard title="All notes" description={`${unpinned.length} notes`}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unpinned.map((n) => <NoteCard key={n.id} note={n} leads={leads} onEdit={() => { setEditing(n); setFormOpen(true); }} onDelete={() => setDeleteId(n.id)} onPin={() => togglePin(n)} />)}
              </div>
            </SectionCard>
          )}
        </div>
      )}

      <NoteFormDialog open={formOpen} onOpenChange={setFormOpen} note={editing} leads={leads} tasks={tasks} content={content} userId={user?.id} />
      <ConfirmDialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)} title="Delete this note?" description="This action cannot be undone." onConfirm={async () => { if (deleteId) await noteRemove.mutateAsync(deleteId); setDeleteId(null); }} />
    </div>
  );
}

type NoteRow = {
  id: string;
  title: string;
  body: string | null;
  tags: string[];
  pinned: boolean;
  lead_id: string | null;
  task_id: string | null;
  content_id: string | null;
  updated_at: string;
};

function NoteCard({ note, leads, onEdit, onDelete, onPin }: {
  note: NoteRow;
  leads: { id: string; business_name: string }[];
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const linkedLead = leads.find((l) => l.id === note.lead_id);
  return (
    <div className={cn("clay-card rounded-xl p-4", note.pinned && "border-primary/30")}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{note.title}</h3>
        <div className="flex shrink-0 gap-0.5">
          <Button size="icon" variant="ghost" onClick={onPin}><Pin className={cn("size-3.5", note.pinned ? "text-primary" : "text-muted-foreground")} /></Button>
          <Button size="icon" variant="ghost" onClick={onEdit}><Pencil className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" onClick={onDelete}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      </div>
      {note.body && <p className="mb-2 line-clamp-3 text-sm text-muted-foreground">{note.body}</p>}
      {note.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {note.tags.map((t) => <StatusBadge key={t} tone="neutral">{t}</StatusBadge>)}
        </div>
      )}
      {linkedLead && <p className="text-xs text-primary">Linked to: {linkedLead.business_name}</p>}
      <p className="mt-2 text-xs text-muted-foreground">{timeAgo(note.updated_at)}</p>
    </div>
  );
}

function NoteFormDialog({ open, onOpenChange, note, leads, tasks, content, userId }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  note: { id: string; title: string; body: string | null; tags: string[]; pinned: boolean; lead_id: string | null; task_id: string | null; content_id: string | null } | null;
  leads: { id: string; business_name: string }[];
  tasks: { id: string; title: string }[];
  content: { id: string; title: string }[];
  userId?: string;
}) {
  const upsert = useUpsert("notes", note ? "Note updated" : "Note created");
  const [values, setValues] = useState({
    title: note?.title ?? "",
    body: note?.body ?? "",
    tags: note?.tags.join(", ") ?? "",
    lead_id: note?.lead_id ?? "none",
    task_id: note?.task_id ?? "none",
    content_id: note?.content_id ?? "none",
  });

  async function save() {
    if (!values.title.trim()) return;
    await upsert.mutateAsync({
      ...(note ? { id: note.id } : {}),
      title: values.title.trim(),
      body: values.body || null,
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
      lead_id: values.lead_id === "none" ? null : values.lead_id,
      task_id: values.task_id === "none" ? null : values.task_id,
      content_id: values.content_id === "none" ? null : values.content_id,
      ...(note ? {} : { author_id: userId ?? null }),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{note ? "Edit Note" : "Add Note"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="mb-1.5 block text-xs">Title *</Label><Input value={values.title} onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))} /></div>
          <div><Label className="mb-1.5 block text-xs">Body</Label><Textarea value={values.body} onChange={(e) => setValues((p) => ({ ...p, body: e.target.value }))} rows={4} /></div>
          <div><Label className="mb-1.5 block text-xs">Tags (comma separated)</Label><Input value={values.tags} onChange={(e) => setValues((p) => ({ ...p, tags: e.target.value }))} placeholder="outreach, demo" /></div>
          <div className="grid grid-cols-3 gap-2">
            <Select value={values.lead_id} onValueChange={(v) => setValues((p) => ({ ...p, lead_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Lead" /></SelectTrigger><SelectContent>
                <SelectItem value="none">No lead</SelectItem>
                {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.business_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={values.task_id} onValueChange={(v) => setValues((p) => ({ ...p, task_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Task" /></SelectTrigger><SelectContent>
                <SelectItem value="none">No task</SelectItem>
                {tasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.title.slice(0, 30)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={values.content_id} onValueChange={(v) => setValues((p) => ({ ...p, content_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Content" /></SelectTrigger><SelectContent>
                <SelectItem value="none">No content</SelectItem>
                {content.map((c) => <SelectItem key={c.id} value={c.id}>{c.title.slice(0, 30)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={upsert.isPending || !values.title.trim()}>{upsert.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

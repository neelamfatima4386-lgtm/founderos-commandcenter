import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  RECURRENCES,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type RecurrenceType,
} from "@/lib/constants";
import { useUpsert } from "@/lib/data";

type TaskFormValues = {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string;
  recurrence: RecurrenceType;
  assigned_to: string | null;
  lead_id: string | null;
  daily_target: number | null;
};

const EMPTY: TaskFormValues = {
  title: "",
  description: "",
  category: "",
  priority: "medium",
  status: "pending",
  due_at: "",
  recurrence: "none",
  assigned_to: null,
  lead_id: null,
  daily_target: null,
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  leads = [],
  profiles = [],
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task | null;
  leads?: { id: string; business_name: string }[];
  profiles?: { id: string; full_name: string }[];
  currentUserId?: string;
}) {
  const upsert = useUpsert("tasks", task ? "Task updated" : "Task created");
  const [values, setValues] = useState<TaskFormValues>(
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          category: task.category ?? "",
          priority: task.priority,
          status: task.status,
          due_at: task.due_at ? task.due_at.slice(0, 16) : "",
          recurrence: task.recurrence,
          assigned_to: task.assigned_to ?? null,
          lead_id: task.lead_id ?? null,
          daily_target: task.daily_target ?? null,
        }
      : EMPTY,
  );

  function set<K extends keyof TaskFormValues>(key: K, val: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function save() {
    if (!values.title.trim()) return;
    const payload: Record<string, unknown> = {
      ...(task ? { id: task.id } : {}),
      title: values.title.trim(),
      description: values.description || null,
      category: values.category || null,
      priority: values.priority,
      status: values.status,
      due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
      recurrence: values.recurrence,
      assigned_to: values.assigned_to || null,
      lead_id: values.lead_id || null,
      daily_target: values.daily_target ?? null,
      ...(task ? {} : { created_by: currentUserId ?? null }),
    };
    await upsert.mutateAsync(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Title" required>
            <Input value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="Build demo for Acme" />
          </Field>
          <Field label="Description">
            <Textarea value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="Details about this task" rows={2} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <Select value={values.priority} onValueChange={(v) => set("priority", v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={values.status} onValueChange={(v) => set("status", v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category">
              <Input value={values.category} onChange={(e) => set("category", e.target.value)} placeholder="Demo" />
            </Field>
            <Field label="Due date">
              <Input type="datetime-local" value={values.due_at} onChange={(e) => set("due_at", e.target.value)} />
            </Field>
            <Field label="Recurrence">
              <Select value={values.recurrence} onValueChange={(v) => set("recurrence", v as RecurrenceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RECURRENCES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Daily target">
              <Input type="number" min={0} value={values.daily_target ?? ""} onChange={(e) => set("daily_target", e.target.value ? Number(e.target.value) : null)} placeholder="—" />
            </Field>
            <Field label="Assign to">
              <Select value={values.assigned_to ?? "unassigned"} onValueChange={(v) => set("assigned_to", v === "unassigned" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Link to lead">
              <Select value={values.lead_id ?? "none"} onValueChange={(v) => set("lead_id", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No lead</SelectItem>
                  {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.business_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={upsert.isPending || !values.title.trim()}>
            {upsert.isPending ? "Saving…" : task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}{required && " *"}</Label>
      {children}
    </div>
  );
}

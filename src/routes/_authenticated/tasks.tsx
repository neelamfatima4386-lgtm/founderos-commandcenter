import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardList, CircleCheck as CheckCircle2, Clock, Pause, Play, Plus, Square, Timer, Trash2, Pencil } from "lucide-react";
import { format, isToday, isPast } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  useTasks,
  useProfiles,
  useLeads,
  useSubtasks,
  useTimeEntries,
  useUpsert,
  useRemove,
  logActivity,
} from "@/lib/data";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@/lib/constants";
import { fmtDate, fmtDateTime, formatDuration } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
  priorityTone,
  taskStatusTone,
} from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { TaskFormDialog } from "@/components/app/task-form";
import { useTaskTimer } from "@/hooks/use-timer";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — ElevateX Founder OS" },
      { name: "description", content: "Full task management with timer, subtasks and lead linking." },
    ],
  }),
  component: TasksPage,
});

type ViewKey = "all" | "today" | "upcoming" | "overdue" | "completed";

function TasksPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: profiles = [] } = useProfiles();
  const { data: leads = [] } = useLeads();
  const { data: timeEntries = [] } = useTimeEntries();
  const taskUpsert = useUpsert("tasks", "Task updated");
  const taskRemove = useRemove("tasks", "Task deleted");
  const subtaskUpsert = useUpsert("task_subtasks");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<ViewKey>("all");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  function filteredTasks() {
    switch (view) {
      case "today":
        return tasks.filter((t) => t.due_at && isToday(new Date(t.due_at)) && t.status !== "completed");
      case "upcoming":
        return tasks.filter((t) => t.due_at && !isPast(new Date(t.due_at)) && t.status !== "completed");
      case "overdue":
        return tasks.filter((t) => t.due_at && isPast(new Date(t.due_at)) && t.status !== "completed");
      case "completed":
        return tasks.filter((t) => t.status === "completed");
      default:
        return tasks;
    }
  }

  async function toggleComplete(task: Task) {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await taskUpsert.mutateAsync({
      id: task.id,
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    });
    if (user) {
      await logActivity({
        entity_type: "task",
        entity_id: task.id,
        action: newStatus === "completed" ? "task_completed" : "task_reopened",
        description: `${profile?.full_name ?? "Someone"} ${newStatus === "completed" ? "completed" : "reopened"} "${task.title}"`,
      });
    }
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    await taskUpsert.mutateAsync({
      id: task.id,
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    });
  }

  async function addSubtask(taskId: string, title: string) {
    await subtaskUpsert.mutateAsync({ task_id: taskId, title });
  }

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Task",
      sortValue: (t) => t.title,
      render: (t) => (
        <div className="flex items-start gap-2.5">
          <Checkbox checked={t.status === "completed"} onCheckedChange={() => toggleComplete(t)} onClick={(e) => e.stopPropagation()} className="mt-0.5" />
          <div className="min-w-0">
            <p className={`truncate font-medium ${t.status === "completed" ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
            {t.description && <p className="truncate text-xs text-muted-foreground">{t.description}</p>}
            {t.lead_id && <button onClick={(e) => { e.stopPropagation(); void navigate({ to: "/leads/$leadId", params: { leadId: t.lead_id! } }); }} className="text-xs text-primary hover:underline">{leads.find((l) => l.id === t.lead_id)?.business_name}</button>}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (t) => t.status,
      render: (t) => (
        <Select value={t.status} onValueChange={(v) => changeStatus(t, v as TaskStatus)}>
          <SelectTrigger className="w-[130px]" onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortValue: (t) => t.priority,
      render: (t) => <StatusBadge tone={priorityTone(t.priority)}>{t.priority}</StatusBadge>,
    },
    {
      key: "due_at",
      header: "Due",
      sortValue: (t) => t.due_at ?? "",
      render: (t) => {
        if (!t.due_at) return <span className="text-muted-foreground">—</span>;
        const overdue = isPast(new Date(t.due_at)) && t.status !== "completed";
        return <span className={overdue ? "text-destructive" : "text-muted-foreground"}>{fmtDateTime(t.due_at)}</span>;
      },
    },
    {
      key: "assigned_to",
      header: "Assigned",
      sortValue: (t) => t.assigned_to ?? "",
      render: (t) => <span className="text-muted-foreground">{profiles.find((p) => p.id === t.assigned_to)?.full_name ?? "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setExpandedTask(expandedTask === t.id ? null : t.id); }}>
            <Timer className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(t); }}>
            <Pencil className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}>
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterDef[] = [
    {
      key: "status",
      placeholder: "Status",
      options: TASK_STATUSES.map((s) => ({ value: s.value, label: s.label })),
      match: (row, value) => (row.status as string) === value,
    },
    {
      key: "priority",
      placeholder: "Priority",
      options: TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label })),
      match: (row, value) => (row.priority as string) === value,
    },
  ];

  const viewTabs: { key: ViewKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "overdue", label: "Overdue" },
    { key: "completed", label: "Completed" },
  ];

  const viewData = filteredTasks();
  const expandedTaskData = expandedTask ? tasks.find((t) => t.id === expandedTask) : null;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Tasks"
        subtitle="Manage your work, track time and stay on schedule."
        actions={<Button size="sm" onClick={openAdd}><Plus className="mr-1.5 size-4" /> Create Task</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {viewTabs.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === v.key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <SectionCard title="Task list" icon={ClipboardList} description={`${viewData.length} tasks`}>
        {isLoading ? (
          <LoadingRows rows={6} />
        ) : (
          <DataTable
            data={viewData}
            columns={columns}
            searchKeys={(t) => `${t.title} ${t.description ?? ""} ${t.category ?? ""}`}
            filters={filters}
            emptyState={
              <EmptyState
                icon={ClipboardList}
                title="No tasks here"
                description="Create a task to start tracking your work."
                action={<Button onClick={openAdd}><Plus className="mr-1.5 size-4" /> Create Task</Button>}
              />
            }
          />
        )}
      </SectionCard>

      {expandedTaskData && (
        <TaskTimerPanel
          task={expandedTaskData}
          timeEntries={timeEntries.filter((te) => te.task_id === expandedTaskData.id)}
          subtasks={[]}
          onClose={() => setExpandedTask(null)}
          onAddSubtask={(title) => addSubtask(expandedTaskData.id, title)}
          userId={user?.id}
        />
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        leads={leads.map((l) => ({ id: l.id, business_name: l.business_name }))}
        profiles={profiles.map((p) => ({ id: p.id, full_name: p.full_name }))}
        currentUserId={user?.id}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete this task?"
        description="This action cannot be undone."
        onConfirm={async () => { if (deleteId) await taskRemove.mutateAsync(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}

function TaskTimerPanel({
  task,
  timeEntries,
  subtasks,
  onClose,
  onAddSubtask,
  userId,
}: {
  task: Task;
  timeEntries: { id: string; seconds: number; started_at: string }[];
  subtasks: { id: string; title: string; done: boolean }[];
  onClose: () => void;
  onAddSubtask: (title: string) => void;
  userId?: string;
}) {
  const timer = useTaskTimer(task.id, userId);
  const [newSubtask, setNewSubtask] = useState("");
  const totalSeconds = timeEntries.reduce((sum, te) => sum + te.seconds, 0);
  const todaySeconds = timeEntries
    .filter((te) => isToday(new Date(te.started_at)))
    .reduce((sum, te) => sum + te.seconds, 0);

  async function handleStop() {
    const secs = await timer.stop();
    if (secs > 0) toast.success(`Tracked ${formatDuration(secs)}`);
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 w-80 clay-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="truncate text-sm font-semibold">{task.title}</span>
        <Button size="icon" variant="ghost" onClick={onClose}><Square className="size-3.5" /></Button>
      </div>
      <div className="mb-3 text-center">
        <span className="font-mono text-2xl font-bold tabular-nums">{formatDuration(timer.running ? timer.elapsed : 0)}</span>
      </div>
      <div className="mb-3 flex items-center justify-center gap-2">
        {!timer.running ? (
          <Button size="sm" onClick={timer.start}><Play className="mr-1 size-3.5" /> Start</Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={timer.pause}><Pause className="mr-1 size-3.5" /> Pause</Button>
        )}
        {timer.running && <Button size="sm" variant="destructive" onClick={handleStop}><Square className="mr-1 size-3.5" /> Stop</Button>}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Today</p>
          <p className="font-medium">{formatDuration(todaySeconds)}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Total</p>
          <p className="font-medium">{formatDuration(totalSeconds)}</p>
        </div>
      </div>
      <div className="mt-3 border-t border-border/60 pt-3">
        <div className="flex gap-2">
          <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add subtask…" className="h-8 text-sm" />
          <Button size="sm" variant="secondary" onClick={() => { if (newSubtask.trim()) { onAddSubtask(newSubtask.trim()); setNewSubtask(""); } }}>+</Button>
        </div>
      </div>
    </div>
  );
}

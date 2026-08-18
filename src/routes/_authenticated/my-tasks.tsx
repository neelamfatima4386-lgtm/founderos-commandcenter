import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, CircleCheck as CheckCircle2, Plus, Pencil, Trash2, Timer } from "lucide-react";
import { isToday, isPast } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  useTasks,
  useProfiles,
  useLeads,
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
import { fmtDateTime, formatDuration } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/_authenticated/my-tasks")({
  head: () => ({
    meta: [
      { title: "My tasks — ElevateX Founder OS" },
      { name: "description", content: "Tasks assigned to you." },
      { property: "og:title", content: "My tasks — ElevateX Founder OS" },
      { property: "og:description", content: "Tasks assigned to you." },
    ],
  }),
  component: MyTasksPage,
});

type ViewKey = "all" | "today" | "overdue" | "completed";

function MyTasksPage() {
  const { user, profile } = useAuth();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: profiles = [] } = useProfiles();
  const { data: leads = [] } = useLeads();
  const { data: timeEntries = [] } = useTimeEntries();
  const taskUpsert = useUpsert("tasks", "Task updated");
  const taskRemove = useRemove("tasks", "Task deleted");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<ViewKey>("all");
  const [timerTaskId, setTimerTaskId] = useState<string | null>(null);

  const myTasks = tasks.filter((t) => t.assigned_to === user?.id || t.created_by === user?.id);

  function filteredTasks() {
    switch (view) {
      case "today":
        return myTasks.filter((t) => t.due_at && isToday(new Date(t.due_at)) && t.status !== "completed");
      case "overdue":
        return myTasks.filter((t) => t.due_at && isPast(new Date(t.due_at)) && t.status !== "completed");
      case "completed":
        return myTasks.filter((t) => t.status === "completed");
      default:
        return myTasks;
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

  const viewData = filteredTasks();
  const timerTask = timerTaskId ? tasks.find((t) => t.id === timerTaskId) : null;

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
      key: "actions",
      header: "",
      className: "w-20",
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setTimerTaskId(t.id); }}>
            <Timer className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditing(t); setFormOpen(true); }}>
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
      match: (row, value) => (row as Task).status === value,
    },
    {
      key: "priority",
      placeholder: "Priority",
      options: TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label })),
      match: (row, value) => (row as Task).priority === value,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="My tasks"
        subtitle="Tasks assigned to you by the founder."
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="mr-1.5 size-4" /> New Task
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {([
          { key: "all", label: "All" },
          { key: "today", label: "Today" },
          { key: "overdue", label: "Overdue" },
          { key: "completed", label: "Completed" },
        ] as { key: ViewKey; label: string }[]).map((v) => (
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
          <LoadingRows rows={5} />
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
                description="You have no tasks in this view."
              />
            }
          />
        )}
      </SectionCard>

      {timerTask && (
        <TimerPanel
          task={timerTask}
          timeEntries={timeEntries.filter((te) => te.task_id === timerTask.id)}
          userId={user?.id}
          onClose={() => setTimerTaskId(null)}
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
        onConfirm={async () => { if (deleteId) await taskRemove.mutateAsync(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}

function TimerPanel({
  task,
  timeEntries,
  userId,
  onClose,
}: {
  task: Task;
  timeEntries: { id: string; seconds: number; started_at: string }[];
  userId?: string;
  onClose: () => void;
}) {
  const timer = useTaskTimer(task.id, userId);
  const totalSeconds = timeEntries.reduce((sum, te) => sum + te.seconds, 0);
  const todaySeconds = timeEntries
    .filter((te) => isToday(new Date(te.started_at)))
    .reduce((sum, te) => sum + te.seconds, 0);

  async function handleStop() {
    const secs = await timer.stop();
    if (secs > 0) toast.success(`Tracked ${formatDuration(secs)}`);
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 w-72 clay-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="truncate text-sm font-semibold">{task.title}</span>
        <Button size="icon" variant="ghost" onClick={onClose}>×</Button>
      </div>
      <div className="mb-3 text-center">
        <span className="font-mono text-2xl font-bold tabular-nums">{formatDuration(timer.running ? timer.elapsed : 0)}</span>
      </div>
      <div className="mb-3 flex items-center justify-center gap-2">
        {!timer.running ? (
          <Button size="sm" onClick={timer.start}>Start</Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={timer.pause}>Pause</Button>
        )}
        {timer.running && <Button size="sm" variant="destructive" onClick={handleStop}>Stop</Button>}
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
    </div>
  );
}

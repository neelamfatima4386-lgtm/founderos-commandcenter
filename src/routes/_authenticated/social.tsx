import { createFileRoute } from "@tanstack/react-router";
import { Share2, CircleCheck as CheckCircle2 } from "lucide-react";
import { isToday, isPast } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useTasks, useUpsert, logActivity } from "@/lib/data";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/constants";
import { fmtDateTime } from "@/lib/app-utils";
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

export const Route = createFileRoute("/_authenticated/social")({
  head: () => ({
    meta: [
      { title: "Social — ElevateX Founder OS" },
      { name: "description", content: "Social media engagement and content tasks." },
      { property: "og:title", content: "Social — ElevateX Founder OS" },
      { property: "og:description", content: "Social media engagement and content tasks." },
    ],
  }),
  component: SocialPage,
});

const CATEGORIES = [
  { key: "LinkedIn", icon: "in" },
  { key: "X", icon: "X" },
  { key: "Instagram", icon: "ig" },
  { key: "Content", icon: "C" },
];

function SocialPage() {
  const { user, profile } = useAuth();
  const { data: tasks = [], isLoading } = useTasks();
  const taskUpsert = useUpsert("tasks", "Task updated");

  const mySocialTasks = tasks.filter(
    (t) =>
      t.assigned_to === user?.id &&
      ["LinkedIn", "X", "Instagram", "Content"].includes(t.category ?? ""),
  );

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
    toast.success(newStatus === "completed" ? "Task completed" : "Task reopened");
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    await taskUpsert.mutateAsync({
      id: task.id,
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    });
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Social activity" subtitle="Engagement, posting and content tasks by platform." />

      {isLoading ? (
        <LoadingRows rows={4} />
      ) : mySocialTasks.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No social tasks"
          description="Social media tasks assigned to you will appear here."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const catTasks = mySocialTasks.filter((t) => t.category === cat.key);
            if (catTasks.length === 0) return null;
            const completed = catTasks.filter((t) => t.status === "completed").length;
            const overdue = catTasks.filter((t) => t.due_at && isPast(new Date(t.due_at)) && t.status !== "completed").length;

            return (
              <SectionCard
                key={cat.key}
                title={cat.key}
                icon={Share2}
                description={`${completed}/${catTasks.length} completed${overdue > 0 ? ` · ${overdue} overdue` : ""}`}
              >
                <ul className="space-y-2">
                  {catTasks.map((t) => (
                    <li key={t.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
                      <Checkbox
                        checked={t.status === "completed"}
                        onCheckedChange={() => toggleComplete(t)}
                      />
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-medium ${t.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <StatusBadge tone={taskStatusTone(t.status)}>{t.status}</StatusBadge>
                          <StatusBadge tone={priorityTone(t.priority)}>{t.priority}</StatusBadge>
                          {t.due_at && (
                            <span className={`text-xs ${isPast(new Date(t.due_at)) && t.status !== "completed" ? "text-destructive" : "text-muted-foreground"}`}>
                              {fmtDateTime(t.due_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Select value={t.status} onValueChange={(v) => changeStatus(t, v as TaskStatus)}>
                        <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TASK_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

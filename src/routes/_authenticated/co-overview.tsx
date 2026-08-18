import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardList, CircleCheck as CheckCircle2, Clock, FileText, Plus } from "lucide-react";
import { isToday, isPast } from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import { useTasks, useContent, useActivity } from "@/lib/data";
import { greeting, timeAgo } from "@/lib/overview-utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  KpiCard,
  LoadingCards,
  PageHeader,
  SectionCard,
  StatusBadge,
  priorityTone,
  taskStatusTone,
} from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/co-overview")({
  head: () => ({
    meta: [
      { title: "Overview — ElevateX Founder OS" },
      { name: "description", content: "Your daily work summary." },
      { property: "og:title", content: "Overview — ElevateX Founder OS" },
      { property: "og:description", content: "Your daily work summary." },
    ],
  }),
  component: CoOverviewPage,
});

function CoOverviewPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: content = [] } = useContent();
  const { data: activity = [] } = useActivity();

  const myTasks = tasks.filter((t) => t.assigned_to === user?.id);
  const myContent = content.filter((c) => c.author_id === user?.id);
  const myActivity = activity.filter((a) => a.actor_id === user?.id);

  const todayTasks = myTasks.filter((t) => t.due_at && isToday(new Date(t.due_at)) && t.status !== "completed");
  const completedToday = myTasks.filter((t) => t.status === "completed" && t.completed_at && isToday(new Date(t.completed_at)));
  const overdue = myTasks.filter((t) => t.due_at && isPast(new Date(t.due_at)) && t.status !== "completed");
  const pending = myTasks.filter((t) => t.status === "pending");
  const progressPct = myTasks.length > 0 ? Math.round((completedToday.length / myTasks.length) * 100) : 0;

  const submittedContent = myContent.filter((c) => c.status === "submitted" || c.status === "under_review");
  const approvedContent = myContent.filter((c) => c.status === "approved" || c.status === "published");

  const categories = ["LinkedIn", "X", "Instagram", "Content"];
  const categoryStats = categories.map((cat) => {
    const catTasks = myTasks.filter((t) => t.category === cat);
    return {
      category: cat,
      total: catTasks.length,
      completed: catTasks.filter((t) => t.status === "completed").length,
      pending: catTasks.filter((t) => t.status !== "completed").length,
    };
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Overview" subtitle="Loading…" />
        <LoadingCards cards={4} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`${greeting()}, ${profile?.full_name?.split(" ")[0] ?? "there"} 👋`}
        subtitle={`Here is your work for today · ${format(new Date(), "EEEE d MMMM yyyy")}`}
        actions={
          <>
            <Button size="sm" onClick={() => void navigate({ to: "/content" })}>
              <Plus className="mr-1.5 size-4" /> New Content
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/my-tasks" })}>
              <ClipboardList className="mr-1.5 size-4" /> My Tasks
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Today's tasks" value={todayTasks.length} icon={ClipboardList} />
        <KpiCard label="Completed today" value={completedToday.length} icon={CheckCircle2} tone="success" />
        <KpiCard label="Pending" value={pending.length} icon={Clock} tone="info" />
        <KpiCard label="Overdue" value={overdue.length} icon={Clock} tone="warning" />
      </div>

      <div className="mb-5">
        <SectionCard title="Daily progress" description={`${progressPct}% complete`}>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Today's tasks" icon={ClipboardList} description={`${todayTasks.length} due today`}>
          {todayTasks.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nothing due today" description="Your schedule is clear." />
          ) : (
            <ul className="space-y-2">
              {todayTasks.slice(0, 8).map((t) => (
                <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.category ?? "—"}</p>
                  </div>
                  <StatusBadge tone={priorityTone(t.priority)}>{t.priority}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Task categories" icon={ClipboardList}>
          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="rounded-lg border border-border/60 px-3 py-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.category}</span>
                  <span className="text-xs text-muted-foreground">{cat.completed}/{cat.total} done</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${cat.total > 0 ? (cat.completed / cat.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Content submissions" icon={FileText} description={`${submittedContent.length} pending approval`}>
          {submittedContent.length === 0 ? (
            <EmptyState icon={FileText} title="Nothing pending" description="No content waiting for approval." />
          ) : (
            <ul className="space-y-2">
              {submittedContent.slice(0, 5).map((c) => (
                <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <span className="truncate text-sm">{c.title}</span>
                  <StatusBadge tone="warning">{c.status}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent activity" icon={Clock}>
          {myActivity.length === 0 ? (
            <EmptyState icon={Clock} title="No activity yet" description="Your actions will appear here." />
          ) : (
            <ul className="space-y-2.5">
              {myActivity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  <div className="min-w-0">
                    <p className="text-sm">{a.description ?? a.action}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

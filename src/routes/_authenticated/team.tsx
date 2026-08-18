import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Plus, CircleCheck as CheckCircle2, Clock, FileText, Activity as ActivityIcon } from "lucide-react";
import { isToday, isPast } from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import {
  useProfiles,
  useRoles,
  useTasks,
  useContent,
  useActivity,
} from "@/lib/data";
import type { AppRole } from "@/lib/constants";
import { timeAgo, fmtDate } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
  priorityTone,
} from "@/components/app/primitives";
import { TaskFormDialog } from "@/components/app/task-form";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Team — ElevateX Founder OS" },
      { name: "description", content: "Founder and co-founder overview with live stats." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { user, profile, isFounder } = useAuth();
  const navigate = useNavigate();
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: roles = [] } = useRoles();
  const { data: tasks = [] } = useTasks();
  const { data: content = [] } = useContent();
  const { data: activity = [] } = useActivity();
  const [assignOpen, setAssignOpen] = useState(false);

  function roleFor(userId: string): AppRole | null {
    return (roles.find((r) => r.user_id === userId)?.role as AppRole) ?? null;
  }

  function statsFor(userId: string) {
    const userTasks = tasks.filter((t) => t.assigned_to === userId);
    const userContent = content.filter((c) => c.author_id === userId);
    const userActivity = activity.filter((a) => a.actor_id === userId);
    return {
      currentTasks: userTasks.filter((t) => t.status !== "completed").length,
      completedToday: userTasks.filter((t) => t.status === "completed" && t.completed_at && isToday(new Date(t.completed_at))).length,
      pending: userTasks.filter((t) => t.status === "pending").length,
      overdue: userTasks.filter((t) => t.due_at && isPast(new Date(t.due_at)) && t.status !== "completed").length,
      contentSubmitted: userContent.filter((c) => c.status === "submitted" || c.status === "under_review").length,
      contentApproved: userContent.filter((c) => c.status === "approved" || c.status === "published").length,
      lastActivity: userActivity[0]?.created_at ?? null,
      taskCount: userTasks.length,
    };
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Team" subtitle="Loading…" />
        <LoadingRows rows={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Team"
        subtitle="Founder and co-founder at a glance."
        actions={isFounder && <Button size="sm" onClick={() => setAssignOpen(true)}><Plus className="mr-1.5 size-4" /> Assign Task</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {profiles.map((p) => {
          const role = roleFor(p.id);
          const stats = statsFor(p.id);
          const isMe = p.id === user?.id;
          return (
            <SectionCard
              key={p.id}
              title={p.full_name}
              description={role === "founder" ? "Founder" : "Co-Founder"}
              icon={Users}
              action={<StatusBadge tone={role === "founder" ? "primary" : "info"}>{role === "founder" ? "Founder" : "Co-Founder"}</StatusBadge>}
            >
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Stat label="Current tasks" value={stats.currentTasks} />
                <Stat label="Completed today" value={stats.completedToday} />
                <Stat label="Pending" value={stats.pending} />
                <Stat label="Overdue" value={stats.overdue} tone="danger" />
                <Stat label="Content submitted" value={stats.contentSubmitted} />
                <Stat label="Content approved" value={stats.contentApproved} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">Last active: {stats.lastActivity ? timeAgo(stats.lastActivity) : "—"}</span>
                {!isMe && isFounder && (
                  <Button size="sm" variant="ghost" onClick={() => setAssignOpen(true)}>Assign task</Button>
                )}
              </div>

              {/* Recent activity for this user */}
              {activity.filter((a) => a.actor_id === p.id).length > 0 && (
                <div className="mt-4 border-t border-border/60 pt-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Recent activity</p>
                  <ul className="space-y-1.5">
                    {activity.filter((a) => a.actor_id === p.id).slice(0, 5).map((a) => (
                      <li key={a.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                        <span className="min-w-0 flex-1">{a.description ?? a.action}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SectionCard>
          );
        })}

        {profiles.length === 0 && (
          <EmptyState icon={Users} title="No team members yet" description="Team members appear here once they sign in." />
        )}
      </div>

      <TaskFormDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        leads={[]}
        profiles={profiles.map((p) => ({ id: p.id, full_name: p.full_name }))}
        currentUserId={user?.id}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "danger" }) {
  return (
    <div className={`rounded-lg border p-2 ${tone === "danger" && value > 0 ? "border-destructive/40 bg-destructive/5" : "border-border/60 bg-muted/30"}`}>
      <p className={`text-lg font-semibold ${tone === "danger" && value > 0 ? "text-destructive" : ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

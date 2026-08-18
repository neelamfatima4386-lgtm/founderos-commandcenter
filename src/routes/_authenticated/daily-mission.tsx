import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, isToday } from "date-fns";
import { Target, CircleCheck as CheckCircle2, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  useLeads,
  useDemos,
  useOutreach,
  useTasks,
  useFollowUps,
  useDailyGoal,
  useUpsert,
  logActivity,
} from "@/lib/data";
import { FOUNDER_WORKFLOW, stageLabel, type LeadStage } from "@/lib/constants";
import { fmtDateTime, isOverdue } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EmptyState,
  LoadingRows,
  MissionProgress,
  PageHeader,
  SectionCard,
  StatusBadge,
  priorityTone,
  taskStatusTone,
  ProgressBar,
} from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/daily-mission")({
  head: () => ({
    meta: [
      { title: "Daily Mission — ElevateX Founder OS" },
      { name: "description", content: "Your daily execution workflow and targets." },
    ],
  }),
  component: DailyMissionPage,
});

function DailyMissionPage() {
  const { user, profile } = useAuth();
  const { data: leads = [], isLoading } = useLeads();
  const { data: demos = [] } = useDemos();
  const { data: outreach = [] } = useOutreach();
  const { data: tasks = [] } = useTasks();
  const { data: followUps = [] } = useFollowUps();
  const { data: goal } = useDailyGoal(user?.id);
  const goalUpsert = useUpsert("daily_goals", "Targets saved");
  const taskUpsert = useUpsert("tasks", "Task updated");

  const [targets, setTargets] = useState({
    leads: goal?.leads_target ?? 10,
    demos: goal?.demos_target ?? 8,
    deploys: goal?.deploys_target ?? 8,
    outreach: goal?.outreach_target ?? 10,
  });

  // Update when goal loads
  if (goal && targets.leads !== goal.leads_target && targets.leads === 10 && goal.leads_target !== 10) {
    setTargets({
      leads: goal.leads_target,
      demos: goal.demos_target,
      deploys: goal.deploys_target,
      outreach: goal.outreach_target,
    });
  }

  const leadsToday = leads.filter((l) => isToday(new Date(l.created_at))).length;
  const demosReady = demos.filter((d) => d.demo_ready && isToday(new Date(d.updated_at))).length;
  const deployed = demos.filter((d) => d.deploy_done && isToday(new Date(d.deployed_at ?? d.updated_at))).length;
  const outreachSent = outreach.filter((o) => o.message_sent && isToday(new Date(o.first_contact_at ?? o.updated_at))).length;
  const overallPct = Math.round(
    ((leadsToday / targets.leads) + (demosReady / targets.demos) + (deployed / targets.deploys) + (outreachSent / targets.outreach)) / 4 * 100,
  );

  const todayTasks = tasks.filter((t) => t.due_at && isToday(new Date(t.due_at)) && t.status !== "completed");
  const overdueTasks = tasks.filter((t) => isOverdue(t.due_at, t.status));
  const completedToday = tasks.filter((t) => t.status === "completed" && t.completed_at && isToday(new Date(t.completed_at)));
  const dueFollowUps = followUps.filter((f) => !f.completed && isToday(new Date(f.due_date)));

  async function saveTargets() {
    if (!user) return;
    await goalUpsert.mutateAsync({
      ...(goal ? { id: goal.id } : {}),
      user_id: user.id,
      goal_date: new Date().toISOString().slice(0, 10),
      leads_target: targets.leads,
      demos_target: targets.demos,
      deploys_target: targets.deploys,
      outreach_target: targets.outreach,
    });
  }

  async function completeTask(taskId: string, title: string) {
    if (!user) return;
    await taskUpsert.mutateAsync({ id: taskId, status: "completed", completed_at: new Date().toISOString() });
    await logActivity({
      entity_type: "task",
      entity_id: taskId,
      action: "task_completed",
      description: `${profile?.full_name ?? "Someone"} completed "${title}"`,
    });
    toast.success("Task completed");
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Daily Mission"
        subtitle={`${format(new Date(), "EEEE d MMMM yyyy")} · ${overallPct}% complete`}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {/* Today's Mission */}
          <section className="clay-card relative overflow-hidden rounded-3xl p-6" style={{ boxShadow: "var(--shadow-glow)" }}>
            <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full opacity-20 blur-3xl" style={{ backgroundImage: "var(--gradient-primary)" }} />
            <div className="relative">
              <StatusBadge tone="primary"><Target className="size-3" /> Today's Mission</StatusBadge>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">Daily progress</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <MissionProgress label="Leads" done={leadsToday} target={targets.leads} />
                <MissionProgress label="Demos" done={demosReady} target={targets.demos} />
                <MissionProgress label="Deployments" done={deployed} target={targets.deploys} />
                <MissionProgress label="Outreach" done={outreachSent} target={targets.outreach} />
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Overall completion</span>
                  <span className="text-sm font-semibold">{Math.min(100, overallPct)}%</span>
                </div>
                <ProgressBar value={Math.min(100, overallPct)} tone={overallPct >= 100 ? "success" : "primary"} />
              </div>
            </div>
          </section>

          {/* Founder workflow */}
          <SectionCard title="Founder workflow" icon={Zap} description="The daily execution pipeline">
            <div className="space-y-2">
              {FOUNDER_WORKFLOW.map((step, i) => {
                const stageLeads = leads.filter((l) => l.stage === step.stage);
                const reached = leads.some((l) => {
                  const order = ["new", "analyzing", "prompt_ready", "demo_building", "deployed", "message_ready", "contacted", "follow_up", "replied", "meeting", "won", "lost"];
                  return order.indexOf(l.stage) >= order.indexOf(step.stage);
                });
                return (
                  <div key={step.key} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${reached ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{stageLeads.length} lead{stageLeads.length !== 1 ? "s" : ""} at this stage</p>
                    </div>
                    {reached ? <CheckCircle2 className="size-4 text-success" /> : <Clock className="size-4 text-muted-foreground/40" />}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Today's tasks */}
          <SectionCard title="Today's tasks" icon={Clock} description={`${todayTasks.length} due today`}>
            {todayTasks.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nothing due today" description="Your schedule is clear." />
            ) : (
              <ul className="space-y-2">
                {todayTasks.map((t) => (
                  <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{fmtDateTime(t.due_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={priorityTone(t.priority)}>{t.priority}</StatusBadge>
                      <Button size="sm" variant="ghost" onClick={() => completeTask(t.id, t.title)}>
                        <CheckCircle2 className="size-4 text-success" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-5">
          {/* Daily targets editor */}
          <SectionCard title="Daily targets" icon={Target} action={<Button size="sm" onClick={saveTargets} disabled={goalUpsert.isPending}>Save</Button>}>
            <div className="space-y-3">
              <TargetInput label="Leads target" value={targets.leads} onChange={(v) => setTargets((p) => ({ ...p, leads: v }))} />
              <TargetInput label="Demos target" value={targets.demos} onChange={(v) => setTargets((p) => ({ ...p, demos: v }))} />
              <TargetInput label="Deploys target" value={targets.deploys} onChange={(v) => setTargets((p) => ({ ...p, deploys: v }))} />
              <TargetInput label="Outreach target" value={targets.outreach} onChange={(v) => setTargets((p) => ({ ...p, outreach: v }))} />
            </div>
          </SectionCard>

          {/* Overdue */}
          <SectionCard title="Overdue" icon={Clock} description={`${overdueTasks.length} overdue`}>
            {overdueTasks.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nothing overdue" description="You're on schedule." />
            ) : (
              <ul className="space-y-2">
                {overdueTasks.slice(0, 6).map((t) => (
                  <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{t.title}</p>
                      <p className="text-xs text-destructive">{fmtDateTime(t.due_at)}</p>
                    </div>
                    <StatusBadge tone={priorityTone(t.priority)}>{t.priority}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Follow-ups due */}
          <SectionCard title="Follow-ups due today" description={`${dueFollowUps.length} waiting`}>
            {dueFollowUps.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="No follow-ups due" description="Nothing to chase today." />
            ) : (
              <ul className="space-y-2">
                {dueFollowUps.map((f) => {
                  const lead = leads.find((l) => l.id === f.lead_id);
                  return (
                    <li key={f.id} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                      <CheckCircle2 className="size-3.5 text-muted-foreground/40" />
                      <span className="truncate text-sm">{lead?.business_name ?? "Lead"}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* Completed today */}
          <SectionCard title="Completed today" icon={CheckCircle2} description={`${completedToday.length} done`}>
            {completedToday.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing completed yet today.</p>
            ) : (
              <ul className="space-y-2">
                {completedToday.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-3.5 text-success" />
                    <span className="truncate text-muted-foreground line-through">{t.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function TargetInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <Label className="text-sm">{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-20 text-right" />
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity as ActivityIcon,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  FileText,
  MonitorSmartphone,
  Send,
  StickyNote,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { format, isToday } from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  KpiCard,
  LoadingCards,
  MissionProgress,
  PageHeader,
  SectionCard,
  StatusBadge,
  priorityTone,
  taskStatusTone,
} from "@/components/app/primitives";
import {
  useActivity,
  useContent,
  useDailyGoal,
  useDemos,
  useFollowUps,
  useLeads,
  useOutreach,
  useTasks,
  useUpsert,
} from "@/lib/data";
import { greeting, isOverdue, relativeDay, stageIndexHelpers, timeAgo } from "@/lib/overview-utils";
import { label, stageLabel, TASK_STATUSES } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/overview")({
  head: () => ({
    meta: [
      { title: "Overview — ElevateX Founder OS" },
      { name: "description", content: "Today's mission, progress, next action and co-founder activity." },
      { property: "og:title", content: "Overview — ElevateX Founder OS" },
      { property: "og:description", content: "Your daily command center for leads, demos and outreach." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { profile, role, user, isFounder } = useAuth();
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useLeads();
  const { data: demos = [] } = useDemos();
  const { data: outreach = [] } = useOutreach();
  const { data: tasks = [] } = useTasks();
  const { data: content = [] } = useContent();
  const { data: followUps = [] } = useFollowUps();
  const { data: activity = [] } = useActivity();
  const { data: goal } = useDailyGoal(user?.id);
  const updateTask = useUpsert("tasks", "Task updated");

  const targets = {
    leads: goal?.leads_target ?? 10,
    demos: goal?.demos_target ?? 8,
    deploys: goal?.deploys_target ?? 8,
    outreach: goal?.outreach_target ?? 10,
  };

  const leadsToday = leads.filter((l) => isToday(new Date(l.created_at))).length;
  const demosReady = demos.filter((d) => d.demo_ready).length;
  const deployed = demos.filter((d) => d.deploy_done).length;
  const sent = outreach.filter((o) => o.message_sent).length;
  const replies = outreach.filter((o) => o.replied_at).length;
  const meetings = outreach.filter((o) => o.meeting_at).length;
  const clients = leads.filter((l) => l.stage === "won").length;
  const doneTasks = tasks.filter((t) => t.status === "completed").length;
  const productivity = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const needsApproval = content.filter((c) => c.status === "submitted" || c.status === "under_review");
  const dueToday = followUps.filter((f) => !f.completed && isToday(new Date(f.due_date)));
  const overdue = tasks.filter((t) => isOverdue(t.due_at, t.status));
  const coFounderActivity = activity.filter((a) => a.actor_id !== user?.id).slice(0, 6);

  const next = stageIndexHelpers.nextAction(leads, tasks);

  if (!isFounder) {
    void navigate({ to: "/co-overview" });
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`${greeting()}, ${profile?.full_name?.split(" ")[0] ?? "there"} 👋`}
        subtitle={`Let's make today productive · ${format(new Date(), "EEEE d MMMM yyyy")}`}
        actions={
          <>
            <Button size="sm" onClick={() => void navigate({ to: "/leads" })}>
              <UserPlus className="mr-1.5 size-4" /> Add Lead
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/tasks" })}>
              <ClipboardList className="mr-1.5 size-4" /> Create Task
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/content" })}>
              <FileText className="mr-1.5 size-4" /> Add Content
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/notes" })}>
              <StickyNote className="mr-1.5 size-4" /> Add Note
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/outreach" })}>
              <CalendarPlus className="mr-1.5 size-4" /> Add Follow-up
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section
            className="clay-card relative overflow-hidden rounded-3xl p-6"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <div
              className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full opacity-20 blur-3xl"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            />
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <StatusBadge tone="primary">
                  <Target className="size-3" /> Today's Command Center
                </StatusBadge>
                <h2 className="mt-3 text-xl font-semibold tracking-tight">Today's Mission</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {targets.leads} qualified leads · {targets.demos} demos · {targets.outreach} outreach
                  messages
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/daily-mission" })}>
                Open mission
              </Button>
            </div>
            <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
              <MissionProgress label="Leads" done={leadsToday} target={targets.leads} />
              <MissionProgress label="Demos" done={demosReady} target={targets.demos} />
              <MissionProgress label="Deployments" done={deployed} target={targets.deploys} />
              <MissionProgress label="Outreach" done={sent} target={targets.outreach} />
            </div>
          </section>

          {isLoading ? (
            <LoadingCards cards={8} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Leads" value={leadsToday} target={targets.leads} icon={Users} onClick={() => void navigate({ to: "/leads" })} />
              <KpiCard label="Demos" value={demosReady} target={targets.demos} icon={MonitorSmartphone} onClick={() => void navigate({ to: "/demos" })} />
              <KpiCard label="Deployed" value={deployed} target={targets.deploys} icon={MonitorSmartphone} onClick={() => void navigate({ to: "/demos" })} />
              <KpiCard label="Outreach" value={sent} target={targets.outreach} icon={Send} onClick={() => void navigate({ to: "/outreach" })} />
              <KpiCard label="Replies" value={replies} hint="Conversations open" icon={Send} tone="info" onClick={() => void navigate({ to: "/outreach" })} />
              <KpiCard label="Meetings" value={meetings} hint="Booked calls" icon={CalendarPlus} tone="info" onClick={() => void navigate({ to: "/calendar" })} />
              <KpiCard label="Clients" value={clients} hint="Closed won" icon={CheckCircle2} tone="success" onClick={() => void navigate({ to: "/pipeline" })} />
              <KpiCard label="Productivity" value={`${productivity}%`} hint={`${doneTasks}/${tasks.length} tasks done`} icon={Target} tone="warning" onClick={() => void navigate({ to: "/analytics" })} />
            </div>
          )}

          <SectionCard title="What should I do next?" icon={Target} description="Highest-priority incomplete action">
            {next ? (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">{next.actionLabel}</p>
                  <h3 className="mt-1 truncate text-lg font-semibold">{next.lead?.business_name ?? next.task?.title}</h3>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {next.checklist.map((step) => (
                      <li key={step.label} className="flex items-center gap-2">
                        <CheckCircle2
                          className={step.done ? "size-3.5 text-success" : "size-3.5 text-muted-foreground/40"}
                        />
                        <span>{step.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() =>
                    next.lead
                      ? void navigate({ to: "/leads/$leadId", params: { leadId: next.lead.id } })
                      : void navigate({ to: "/tasks" })
                  }
                >
                  Continue <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Nothing blocking you"
                description="Every tracked action is complete. Add leads to start the next cycle."
                action={<Button onClick={() => void navigate({ to: "/leads" })}>Add Lead</Button>}
              />
            )}
          </SectionCard>

          <SectionCard title="Follow-ups due today" icon={Send} description={`${dueToday.length} waiting`}>
            {dueToday.length === 0 ? (
              <EmptyState icon={Send} title="No follow-ups due" description="Nothing needs chasing today." />
            ) : (
              <ul className="divide-y divide-border/70">
                {dueToday.map((f) => {
                  const lead = leads.find((l) => l.id === f.lead_id);
                  return (
                    <li key={f.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{lead?.business_name ?? "Lead"}</p>
                        <p className="truncate text-xs text-muted-foreground">{f.note ?? "Follow up"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => lead && void navigate({ to: "/leads/$leadId", params: { leadId: lead.id } })}
                      >
                        Open
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Co-Founder activity" icon={ActivityIcon} description="Auto-tracked, no check-ins needed">
            {coFounderActivity.length === 0 ? (
              <EmptyState icon={ActivityIcon} title="No activity yet" description="Co-founder actions appear here automatically." />
            ) : (
              <ul className="space-y-3">
                {coFounderActivity.map((a) => (
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

          <SectionCard
            title="Content needing approval"
            icon={FileText}
            description={`Needs approval: ${needsApproval.length}`}
            action={
              <Button size="sm" variant="secondary" onClick={() => void navigate({ to: "/content/approvals" })}>
                Review
              </Button>
            }
          >
            {needsApproval.length === 0 ? (
              <EmptyState icon={FileText} title="Approval queue clear" description="No submissions waiting on you." />
            ) : (
              <ul className="space-y-2.5">
                {needsApproval.slice(0, 5).map((c) => (
                  <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="truncate text-sm">{c.title}</span>
                    <StatusBadge tone="warning">{c.platform}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="What's blocking me" icon={ClipboardList} description={`${overdue.length} overdue`}>
            {overdue.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nothing overdue" description="You're on schedule." />
            ) : (
              <ul className="space-y-3">
                {overdue.slice(0, 6).map((t) => (
                  <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{t.title}</p>
                      <p className="text-xs text-destructive">{relativeDay(t.due_at)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateTask.mutate({ id: t.id, status: "completed", completed_at: new Date().toISOString() })
                      }
                    >
                      Done
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Pipeline snapshot" icon={Users}>
            <ul className="space-y-2 text-sm">
              {["new", "demo_building", "deployed", "contacted", "replied", "meeting"].map((stage) => (
                <li key={stage} className="flex items-center justify-between gap-2">
                  <span className="truncate text-muted-foreground">{stageLabel(stage as never)}</span>
                  <span className="font-semibold">{leads.filter((l) => l.stage === stage).length}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Task mix" icon={ClipboardList}>
            <ul className="space-y-2 text-sm">
              {TASK_STATUSES.map((s) => (
                <li key={s.value} className="flex items-center justify-between gap-2">
                  <StatusBadge tone={taskStatusTone(s.value)}>{s.label}</StatusBadge>
                  <span className="font-semibold">{tasks.filter((t) => t.status === s.value).length}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-2 pt-1">
                <StatusBadge tone={priorityTone("urgent")}>Urgent</StatusBadge>
                <span className="font-semibold">
                  {tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length}
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Role: {label([{ value: "founder", label: "Founder" }, { value: "co_founder", label: "Co-Founder" }], role)}
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

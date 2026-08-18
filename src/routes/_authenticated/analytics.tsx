import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChartBar as BarChart3, TrendingUp, Users, Send, CircleCheck as CheckCircle2, Clock } from "lucide-react";
import {
  format,
  isToday,
  isThisWeek,
  isThisMonth,
  subDays,
  differenceInCalendarDays,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

import { useLeads, useDemos, useOutreach, useTasks, useFollowUps, useTimeEntries } from "@/lib/data";
import { LEAD_STAGES, stageLabel } from "@/lib/constants";
import { formatHours, formatDuration } from "@/lib/app-utils";
import {
  KpiCard,
  LoadingCards,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/app/primitives";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — ElevateX Founder OS" },
      { name: "description", content: "Lead metrics, conversion funnel and productivity analytics." },
    ],
  }),
  component: AnalyticsPage,
});

type Range = "today" | "7" | "30";

function AnalyticsPage() {
  const { data: leads = [], isLoading } = useLeads();
  const { data: demos = [] } = useDemos();
  const { data: outreach = [] } = useOutreach();
  const { data: tasks = [] } = useTasks();
  const { data: followUps = [] } = useFollowUps();
  const { data: timeEntries = [] } = useTimeEntries();
  const [range, setRange] = useState<Range>("7");

  const inRange = useMemo(() => {
    const days = range === "today" ? 0 : range === "7" ? 7 : 30;
    const cutoff = subDays(new Date(), days);
    return (date: string) => new Date(date) >= cutoff;
  }, [range]);

  const leadsIn = leads.filter((l) => inRange(l.created_at));
  const demosIn = demos.filter((d) => inRange(d.updated_at));
  const outreachIn = outreach.filter((o) => inRange(o.updated_at));
  const tasksCompleted = tasks.filter((t) => t.status === "completed" && t.completed_at && inRange(t.completed_at));
  const followUpsDone = followUps.filter((f) => f.completed && f.completed_at && inRange(f.completed_at));
  const timeIn = timeEntries.filter((te) => inRange(te.started_at));
  const totalSeconds = timeIn.reduce((s, te) => s + te.seconds, 0);

  // Funnel
  const funnel = [
    { stage: "Leads", count: leads.length, fill: "var(--chart-1)" },
    { stage: "Contacted", count: outreach.filter((o) => o.message_sent).length, fill: "var(--chart-2)" },
    { stage: "Replies", count: outreach.filter((o) => o.replied_at).length, fill: "var(--chart-3)" },
    { stage: "Meetings", count: outreach.filter((o) => o.meeting_at).length, fill: "var(--chart-4)" },
    { stage: "Won", count: leads.filter((l) => l.stage === "won").length, fill: "var(--chart-5)" },
  ];

  const funnelWithPct = funnel.map((f, i) => ({
    ...f,
    pct: funnel[0].count > 0 ? Math.round((f.count / funnel[0].count) * 100) : 0,
    stepPct: i > 0 && funnel[i - 1].count > 0 ? Math.round((f.count / funnel[i - 1].count) * 100) : 100,
  }));

  // Leads by stage for bar chart
  const stageData = LEAD_STAGES.filter((s) => s.value !== "lost").map((s) => ({
    stage: s.label,
    count: leads.filter((l) => l.stage === s.value).length,
  }));

  // Time analysis
  const timeByLead = new Map<string, number>();
  timeEntries.forEach((te) => {
    if (te.lead_id) timeByLead.set(te.lead_id, (timeByLead.get(te.lead_id) ?? 0) + te.seconds);
  });
  const avgTimePerLead = timeByLead.size > 0 ? totalSeconds / timeByLead.size : 0;

  const config: ChartConfig = {
    count: { label: "Count" },
  };

  const rangeLabels: { key: Range; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "7", label: "7 Days" },
    { key: "30", label: "30 Days" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Analytics"
        subtitle="Lead metrics, conversion funnel and productivity from real data."
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {rangeLabels.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)} className={`rounded-md px-3 py-1 text-xs font-medium ${range === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{r.label}</button>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <LoadingCards cards={6} />
      ) : (
        <div className="space-y-5">
          {/* Lead metrics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total leads" value={leads.length} icon={Users} hint={`${leadsIn.length} in range`} />
            <KpiCard label="Demos" value={demos.filter((d) => d.demo_ready).length} icon={BarChart3} hint={`${demosIn.length} in range`} />
            <KpiCard label="Outreach sent" value={outreach.filter((o) => o.message_sent).length} icon={Send} hint={`${outreachIn.length} in range`} />
            <KpiCard label="Replies" value={outreach.filter((o) => o.replied_at).length} icon={TrendingUp} tone="info" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Meetings" value={outreach.filter((o) => o.meeting_at).length} icon={Users} tone="info" />
            <KpiCard label="Clients (won)" value={leads.filter((l) => l.stage === "won").length} icon={CheckCircle2} tone="success" />
            <KpiCard label="Tasks completed" value={tasksCompleted.length} icon={CheckCircle2} tone="success" />
            <KpiCard label="Hours worked" value={formatHours(totalSeconds)} icon={Clock} tone="warning" />
          </div>

          {/* Funnel */}
          <SectionCard title="Conversion funnel" icon={TrendingUp} description="Leads → Contacted → Replies → Meetings → Won">
            <div className="space-y-3">
              {funnelWithPct.map((f, i) => (
                <div key={f.stage}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{f.stage}</span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{f.count}</span>
                      {i > 0 && <span className="ml-2 text-xs">({f.stepPct}% from previous)</span>}
                      <span className="ml-2 text-xs">({f.pct}% of leads)</span>
                    </span>
                  </div>
                  <div className="h-7 w-full overflow-hidden rounded-lg bg-muted/30">
                    <div className="flex h-full items-center rounded-lg px-2 text-xs font-medium text-white transition-all" style={{ width: `${Math.max(2, f.pct)}%`, background: f.fill }}>
                      {f.pct > 10 && `${f.pct}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Leads by stage */}
          <SectionCard title="Leads by stage" icon={BarChart3}>
            <ChartContainer config={config} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="stage" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </SectionCard>

          {/* Productivity */}
          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard title="Productivity" icon={CheckCircle2}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Tasks completed</dt><dd className="font-medium">{tasksCompleted.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Follow-ups completed</dt><dd className="font-medium">{followUpsDone.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Hours worked</dt><dd className="font-medium">{formatHours(totalSeconds)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Leads generated</dt><dd className="font-medium">{leadsIn.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Demos created</dt><dd className="font-medium">{demosIn.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Outreach sent</dt><dd className="font-medium">{outreachIn.length}</dd></div>
              </dl>
            </SectionCard>

            <SectionCard title="Time analysis" icon={Clock}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Total time</dt><dd className="font-medium">{formatDuration(totalSeconds)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Avg time per lead</dt><dd className="font-medium">{formatDuration(avgTimePerLead)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Avg time per demo</dt><dd className="font-medium">{formatDuration(demosIn.length > 0 ? totalSeconds / demosIn.length : 0)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Avg time per outreach</dt><dd className="font-medium">{formatDuration(outreachIn.length > 0 ? totalSeconds / outreachIn.length : 0)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Avg time per task</dt><dd className="font-medium">{formatDuration(tasksCompleted.length > 0 ? totalSeconds / tasksCompleted.length : 0)}</dd></div>
              </dl>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}

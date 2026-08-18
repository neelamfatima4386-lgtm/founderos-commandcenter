import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ChevronLeft, ChevronRight, TrendingUp, Clock, CircleCheck as CheckCircle2 } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  isThisWeek,
  isThisMonth,
} from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import {
  useLeads,
  useDemos,
  useOutreach,
  useTasks,
  useTimeEntries,
  useWeeklyReview,
  useUpsert,
} from "@/lib/data";
import { formatHours, formatDuration } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  KpiCard,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/weekly-review")({
  head: () => ({
    meta: [
      { title: "Weekly review — ElevateX Founder OS" },
      { name: "description", content: "Weekly metrics, best day and notes." },
      { property: "og:title", content: "Weekly review — ElevateX Founder OS" },
      { property: "og:description", content: "Weekly metrics, best day and notes." },
    ],
  }),
  component: WeeklyReviewPage,
});

function WeeklyReviewPage() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const { data: weeklyReview } = useWeeklyReview(user?.id, weekStart);
  const reviewUpsert = useUpsert("weekly_reviews", "Notes saved");
  const [notes, setNotes] = useState(weeklyReview?.notes ?? "");

  const { data: leads = [] } = useLeads();
  const { data: demos = [] } = useDemos();
  const { data: outreach = [] } = useOutreach();
  const { data: tasks = [] } = useTasks();
  const { data: timeEntries = [] } = useTimeEntries();

  const weekDate = new Date(weekStart);
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
  const interval = { start: weekDate, end: weekEnd };

  const inWeek = (date: string) => isWithinInterval(new Date(date), interval);

  const weekLeads = leads.filter((l) => inWeek(l.created_at));
  const weekDemos = demos.filter((d) => inWeek(d.updated_at));
  const weekOutreach = outreach.filter((o) => inWeek(o.updated_at));
  const weekReplies = outreach.filter((o) => o.replied_at && inWeek(o.replied_at));
  const weekMeetings = outreach.filter((o) => o.meeting_at && inWeek(o.meeting_at));
  const weekClients = leads.filter((l) => l.stage === "won" && inWeek(l.updated_at));
  const weekTasks = tasks.filter((t) => t.completed_at && inWeek(t.completed_at));
  const weekTime = timeEntries.filter((te) => inWeek(te.started_at));
  const totalSeconds = weekTime.reduce((s, te) => s + te.seconds, 0);

  // Best performing day
  const days = eachDayOfInterval(interval);
  const dayStats = days.map((day) => {
    const dayLeads = weekLeads.filter((l) => format(new Date(l.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).length;
    const dayTasks = weekTasks.filter((t) => format(new Date(t.completed_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).length;
    const dayOutreach = weekOutreach.filter((o) => o.first_contact_at && format(new Date(o.first_contact_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).length;
    return { day, total: dayLeads + dayTasks + dayOutreach };
  });
  const bestDay = dayStats.reduce((best, d) => (d.total > best.total ? d : best), dayStats[0] ?? { day: weekDate, total: 0 });

  // Most productive task
  const taskTimeMap = new Map<string, number>();
  weekTime.forEach((te) => {
    if (te.task_id) taskTimeMap.set(te.task_id, (taskTimeMap.get(te.task_id) ?? 0) + te.seconds);
  });
  let mostProductiveTask = "—";
  let mostTimeTask = "—";
  let maxTime = 0;
  for (const [taskId, secs] of taskTimeMap) {
    const task = tasks.find((t) => t.id === taskId);
    if (secs > maxTime) {
      maxTime = secs;
      mostTimeTask = task?.title ?? "—";
    }
  }
  const completedTasks = weekTasks.length;
  const mostProductive = weekTasks.length > 0 ? weekTasks[0]!.title : "—";

  async function saveNotes() {
    if (!user) return;
    await reviewUpsert.mutateAsync({
      ...(weeklyReview ? { id: weeklyReview.id } : {}),
      user_id: user.id,
      week_start: weekStart,
      notes: notes || null,
    });
  }

  function navigateWeek(dir: number) {
    const newDate = dir > 0 ? addWeeks(weekDate, 1) : subWeeks(weekDate, 1);
    setWeekStart(format(startOfWeek(newDate, { weekStartsOn: 1 }), "yyyy-MM-dd"));
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Weekly review"
        subtitle={`${format(weekDate, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`}
        actions={
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => navigateWeek(-1)}><ChevronLeft className="size-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setWeekStart(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"))}>This week</Button>
            <Button size="icon" variant="ghost" onClick={() => navigateWeek(1)}><ChevronRight className="size-4" /></Button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total leads" value={weekLeads.length} icon={TrendingUp} />
        <KpiCard label="Total demos" value={weekDemos.length} icon={TrendingUp} tone="info" />
        <KpiCard label="Outreach sent" value={weekOutreach.filter((o) => o.message_sent).length} icon={TrendingUp} tone="warning" />
        <KpiCard label="Replies" value={weekReplies.length} icon={TrendingUp} tone="info" />
        <KpiCard label="Meetings" value={weekMeetings.length} icon={TrendingUp} tone="primary" />
        <KpiCard label="Clients won" value={weekClients.length} icon={CheckCircle2} tone="success" />
        <KpiCard label="Hours worked" value={formatHours(totalSeconds)} icon={Clock} tone="warning" />
        <KpiCard label="Tasks completed" value={completedTasks} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Weekly highlights" icon={Sparkles}>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Best performing day</dt>
              <dd className="font-medium">{bestDay.total > 0 ? `${format(bestDay.day, "EEEE")} (${bestDay.total} actions)` : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Most time-consuming task</dt>
              <dd className="max-w-[60%] truncate font-medium">{mostTimeTask}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total time tracked</dt>
              <dd className="font-medium">{formatDuration(totalSeconds)}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Weekly notes" icon={Sparkles} action={<Button size="sm" onClick={saveNotes} disabled={reviewUpsert.isPending}>Save</Button>}>
          <div>
            <Label className="mb-1.5 block text-xs">Notes for this week</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="What went well? What to improve next week?"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

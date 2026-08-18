import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Clock,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  addMonths,
  addWeeks,
  isToday,
} from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import {
  useCalendarEvents,
  useTasks,
  useFollowUps,
  useContent,
  useUpsert,
} from "@/lib/data";
import { fmtTime } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — ElevateX Founder OS" },
      { name: "description", content: "Unified calendar for tasks, follow-ups, meetings and content." },
    ],
  }),
  component: CalendarPage,
});

type ViewMode = "month" | "week" | "day";

type CalItem = {
  id: string;
  title: string;
  type: string;
  date: Date;
  link?: string;
};

const TYPE_TONES: Record<string, "primary" | "info" | "warning" | "success" | "neutral"> = {
  meeting: "primary",
  follow_up: "warning",
  deadline: "neutral",
  content: "info",
  task: "success",
};

function CalendarPage() {
  const { user } = useAuth();
  const { data: events = [], isLoading } = useCalendarEvents();
  const { data: tasks = [] } = useTasks();
  const { data: followUps = [] } = useFollowUps();
  const { data: content = [] } = useContent();
  const eventUpsert = useUpsert("calendar_events", "Event created");

  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", event_type: "meeting", starts_at: "", ends_at: "", notes: "" });

  const allItems = useMemo<CalItem[]>(() => {
    const items: CalItem[] = [];
    events.forEach((e) => items.push({ id: e.id, title: e.title, type: e.event_type, date: new Date(e.starts_at) }));
    tasks.forEach((t) => { if (t.due_at) items.push({ id: t.id, title: t.title, type: "task", date: new Date(t.due_at) }); });
    followUps.forEach((f) => { if (!f.completed) items.push({ id: f.id, title: `Follow-up: ${f.note ?? ""}`, type: "follow_up", date: new Date(f.due_date) }); });
    content.forEach((c) => { if (c.scheduled_at) items.push({ id: c.id, title: c.title, type: "content", date: new Date(c.scheduled_at) }); });
    return items;
  }, [events, tasks, followUps, content]);

  const days = useMemo(() => {
    if (view === "month") {
      return eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) });
    }
    if (view === "week") {
      return eachDayOfInterval({ start: startOfWeek(cursor), end: endOfWeek(cursor) });
    }
    return [cursor];
  }, [view, cursor]);

  function itemsForDay(day: Date) {
    return allItems.filter((i) => isSameDay(i.date, day));
  }

  function navigateCalendar(dir: number) {
    if (view === "month") setCursor((c) => addMonths(c, dir));
    else if (view === "week") setCursor((c) => addWeeks(c, dir));
    else setCursor((c) => addDays(c, dir));
  }

  async function createEvent() {
    if (!newEvent.title.trim() || !newEvent.starts_at || !user) return;
    await eventUpsert.mutateAsync({
      title: newEvent.title.trim(),
      event_type: newEvent.event_type,
      starts_at: new Date(newEvent.starts_at).toISOString(),
      ends_at: newEvent.ends_at ? new Date(newEvent.ends_at).toISOString() : null,
      notes: newEvent.notes || null,
      owner_id: user.id,
    });
    setFormOpen(false);
    setNewEvent({ title: "", event_type: "meeting", starts_at: "", ends_at: "", notes: "" });
  }

  const headerLabel = view === "month" ? format(cursor, "MMMM yyyy") : view === "week" ? `${format(startOfWeek(cursor), "d MMM")} – ${format(endOfWeek(cursor), "d MMM")}` : format(cursor, "EEEE d MMMM yyyy");

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Calendar"
        subtitle="Tasks, follow-ups, meetings, content and deadlines in one view."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              {(["month", "week", "day"] as ViewMode[]).map((m) => (
                <button key={m} onClick={() => setView(m)} className={cn("rounded-md px-3 py-1 text-xs font-medium capitalize", view === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{m}</button>
              ))}
            </div>
            <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="mr-1.5 size-4" /> Event</Button>
          </>
        }
      />

      <SectionCard
        title={headerLabel}
        icon={CalendarDays}
        action={
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => navigateCalendar(-1)}><ChevronLeft className="size-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setCursor(new Date())}>Today</Button>
            <Button size="icon" variant="ghost" onClick={() => navigateCalendar(1)}><ChevronRight className="size-4" /></Button>
          </div>
        }
      >
        {isLoading ? (
          <LoadingRows rows={5} />
        ) : (
          <>
            {/* Day headers */}
            <div className={cn("grid gap-1", view === "day" ? "grid-cols-1" : "grid-cols-7")}>
              {view !== "day" && ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className={cn("mt-1 grid gap-1", view === "day" ? "grid-cols-1" : "grid-cols-7")}>
              {days.map((day) => {
                const dayItems = itemsForDay(day);
                const inMonth = view === "month" ? isSameMonth(day, cursor) : true;
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[60px] rounded-lg border border-border/40 p-1.5",
                      !inMonth && "opacity-40",
                      isToday(day) && "border-primary/50 bg-primary/5",
                      view === "day" && "min-h-[300px]",
                    )}
                  >
                    <div className={cn("mb-1 text-xs font-medium", isToday(day) ? "text-primary" : "text-muted-foreground")}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayItems.slice(0, view === "day" ? 50 : 3).map((item) => (
                        <div key={item.id} className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-xs", `bg-${TYPE_TONES[item.type] ?? "neutral"}/10`)}>
                          <span className={cn("size-1.5 shrink-0 rounded-full", item.type === "meeting" ? "bg-primary" : item.type === "follow_up" ? "bg-warning" : item.type === "content" ? "bg-info" : item.type === "task" ? "bg-success" : "bg-muted")} />
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      {dayItems.length > 3 && view !== "day" && <span className="text-xs text-muted-foreground">+{dayItems.length - 3} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionCard>

      {/* Event legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Meeting</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" /> Follow-up</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" /> Content</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" /> Task deadline</span>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block text-xs">Title *</Label><Input value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))} /></div>
            <div>
              <Label className="mb-1 block text-xs">Type</Label>
              <Select value={newEvent.event_type} onValueChange={(v) => setNewEvent((p) => ({ ...p, event_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  {["meeting", "follow_up", "deadline", "content", "task"].map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-1 block text-xs">Start *</Label><Input type="datetime-local" value={newEvent.starts_at} onChange={(e) => setNewEvent((p) => ({ ...p, starts_at: e.target.value }))} /></div>
              <div><Label className="mb-1 block text-xs">End</Label><Input type="datetime-local" value={newEvent.ends_at} onChange={(e) => setNewEvent((p) => ({ ...p, ends_at: e.target.value }))} /></div>
            </div>
            <div><Label className="mb-1 block text-xs">Notes</Label><Input value={newEvent.notes} onChange={(e) => setNewEvent((p) => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={createEvent} disabled={!newEvent.title.trim() || !newEvent.starts_at}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

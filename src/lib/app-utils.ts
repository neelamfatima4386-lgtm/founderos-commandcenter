import { format, isToday, isTomorrow, startOfWeek } from "date-fns";

export const pct = (done: number, target: number) =>
  target <= 0 ? 0 : Math.min(100, Math.round((done / target) * 100));

export const fmtDate = (value?: string | Date | null, pattern = "d MMM yyyy") =>
  value ? format(new Date(value), pattern) : "—";

export const fmtTime = (value?: string | Date | null) =>
  value ? format(new Date(value), "HH:mm") : "—";

export const fmtDateTime = (value?: string | Date | null) =>
  value ? format(new Date(value), "d MMM, HH:mm") : "—";

export function relativeDay(value?: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (isToday(date)) return `Today ${format(date, "HH:mm")}`;
  if (isTomorrow(date)) return `Tomorrow ${format(date, "HH:mm")}`;
  return format(date, "d MMM, HH:mm");
}

export function timeAgo(value?: string | null) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export const todayISO = () => format(new Date(), "yyyy-MM-dd");
export const weekStartISO = () =>
  format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function formatHours(totalSeconds: number) {
  return `${(totalSeconds / 3600).toFixed(1)}h`;
}

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const initials = (name?: string | null) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const isOverdue = (dueAt?: string | null, status?: string) =>
  Boolean(dueAt) && status !== "completed" && new Date(dueAt as string) < new Date();

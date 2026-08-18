import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* --------------------------------- surfaces -------------------------------- */

export function SectionCard({
  title,
  description,
  action,
  icon: Icon,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn("clay-card rounded-2xl", className)}>
      {(title || action) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>
              )}
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)] gap-3 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-[28px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ---------------------------------- badges --------------------------------- */

const TONES = {
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/15 text-primary border-primary/25",
  success: "bg-success/15 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/25",
} as const;

export type Tone = keyof typeof TONES;

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const taskStatusTone = (status: string): Tone =>
  status === "completed"
    ? "success"
    : status === "in_progress"
      ? "info"
      : status === "blocked"
        ? "danger"
        : "neutral";

export const priorityTone = (priority: string): Tone =>
  priority === "urgent" || priority === "hot"
    ? "danger"
    : priority === "high" || priority === "warm"
      ? "warning"
      : priority === "medium"
        ? "info"
        : "neutral";

export const contentStatusTone = (status: string): Tone =>
  status === "approved" || status === "published"
    ? "success"
    : status === "rejected"
      ? "danger"
      : status === "submitted" || status === "under_review"
        ? "warning"
        : status === "scheduled"
          ? "info"
          : "neutral";

export const outreachStatusTone = (status: string): Tone =>
  status === "won" || status === "replied"
    ? "success"
    : status === "lost" || status === "no_response"
      ? "danger"
      : status === "follow_up_due"
        ? "warning"
        : status === "meeting" || status === "contacted"
          ? "info"
          : "neutral";

/* --------------------------------- progress -------------------------------- */

export function ProgressBar({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
}) {
  const fill = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", fill)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function MissionProgress({
  label,
  done,
  target,
}: {
  label: string;
  done: number;
  target: number;
}) {
  const value = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
  const tone = value >= 100 ? "success" : value >= 60 ? "primary" : "warning";
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium">{label}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          <span className="text-foreground font-semibold">{done}</span> / {target} · {value}%
        </span>
      </div>
      <ProgressBar value={value} tone={tone} />
    </div>
  );
}

/* ---------------------------------- states --------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 py-12 text-center">
      {Icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="size-5" />
        </span>
      )}
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function LoadingCards({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}

/* ----------------------------------- KPI ----------------------------------- */

export function KpiCard({
  label,
  value,
  target,
  hint,
  icon: Icon,
  onClick,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  target?: number;
  hint?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const accent = {
    primary: "text-primary bg-primary/12",
    success: "text-success bg-success/12",
    warning: "text-warning bg-warning/12",
    info: "text-info bg-info/12",
  }[tone];

  const numeric = typeof value === "number" && typeof target === "number";
  const progress = numeric ? Math.min(100, Math.round((value / (target || 1)) * 100)) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "clay-card group rounded-2xl p-4 text-left transition-all duration-200",
        onClick && "hover:-translate-y-0.5 hover:border-primary/40 active:translate-y-0",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {Icon && (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", accent)}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {typeof target === "number" && (
          <span className="text-sm text-muted-foreground">/ {target}</span>
        )}
      </div>
      {progress !== null ? (
        <ProgressBar
          className="mt-3 h-1.5"
          value={progress}
          tone={progress >= 100 ? "success" : "primary"}
        />
      ) : (
        hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      )}
    </button>
  );
}

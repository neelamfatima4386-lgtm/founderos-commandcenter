import { differenceInCalendarDays, formatDistanceToNowStrict, isPast } from "date-fns";

type LeadLike = {
  id: string;
  business_name: string;
  stage: string;
  created_at: string;
};

type TaskLike = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_at: string | null;
};

export type ChecklistStep = { label: string; done: boolean };

export type NextAction = {
  actionLabel: string;
  lead?: LeadLike;
  task?: TaskLike;
  checklist: ChecklistStep[];
};

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function timeAgo(value: string | null | undefined): string {
  if (!value) return "—";
  return `${formatDistanceToNowStrict(new Date(value))} ago`;
}

export function relativeDay(value: string | null | undefined): string {
  if (!value) return "No due date";
  const days = differenceInCalendarDays(new Date(value), new Date());
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  return `Due in ${days}d`;
}

export function isOverdue(due: string | null | undefined, status: string): boolean {
  if (!due || status === "completed") return false;
  return isPast(new Date(due));
}

const STAGE_FLOW = ["new", "demo_building", "deployed", "contacted", "replied", "meeting"];

const PRIORITY_WEIGHT: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export const stageIndexHelpers = {
  stageIndex(stage: string): number {
    const index = STAGE_FLOW.indexOf(stage);
    return index === -1 ? STAGE_FLOW.length : index;
  },

  nextAction(leads: LeadLike[], tasks: TaskLike[]): NextAction | null {
    const urgentTask = [...tasks]
      .filter((t) => t.status !== "completed")
      .sort(
        (a, b) =>
          (PRIORITY_WEIGHT[a.priority] ?? 9) - (PRIORITY_WEIGHT[b.priority] ?? 9) ||
          new Date(a.due_at ?? "9999-12-31").getTime() - new Date(b.due_at ?? "9999-12-31").getTime(),
      )[0];

    if (urgentTask && (urgentTask.priority === "urgent" || isOverdue(urgentTask.due_at, urgentTask.status))) {
      return {
        actionLabel: "Clear this task first",
        task: urgentTask,
        checklist: [
          { label: relativeDay(urgentTask.due_at), done: false },
          { label: `Priority: ${urgentTask.priority}`, done: false },
        ],
      };
    }

    const lead = [...leads]
      .filter((l) => l.stage !== "won" && l.stage !== "lost")
      .sort(
        (a, b) =>
          stageIndexHelpers.stageIndex(a.stage) - stageIndexHelpers.stageIndex(b.stage) ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )[0];

    if (lead) {
      const reached = stageIndexHelpers.stageIndex(lead.stage);
      return {
        actionLabel: "Advance this lead",
        lead,
        checklist: [
          { label: "Lead captured", done: reached >= 0 },
          { label: "Demo built", done: reached >= 1 },
          { label: "Demo deployed", done: reached >= 2 },
          { label: "Outreach sent", done: reached >= 3 },
        ],
      };
    }

    if (urgentTask) {
      return {
        actionLabel: "Next open task",
        task: urgentTask,
        checklist: [{ label: relativeDay(urgentTask.due_at), done: false }],
      };
    }

    return null;
  },
};

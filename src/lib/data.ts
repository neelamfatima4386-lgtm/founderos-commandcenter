import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type {
  ActivityLog,
  CalendarEvent,
  ContentItem,
  DailyGoal,
  Demo,
  FollowUp,
  Lead,
  Note,
  Notification,
  Outreach,
  Profile,
  Subtask,
  Task,
  TimeEntry,
  Tables,
} from "@/lib/constants";
import { todayISO } from "@/lib/app-utils";

/* ---------------------------------- helpers --------------------------------- */

async function must<T>(promise: PromiseLike<{ data: T | null; error: unknown }>) {
  const { data, error } = await promise;
  if (error) throw error;
  return (data ?? []) as T;
}

export async function logActivity(entry: {
  entity_type: string;
  action: string;
  description: string;
  entity_id?: string | null;
}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("activity_logs").insert({ ...entry, actor_id: data.user.id });
}

export async function notify(entry: {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  await supabase.from("notifications").insert(entry);
}

/* ----------------------------------- reads ---------------------------------- */

export const useProfiles = () =>
  useQuery({
    queryKey: ["profiles"],
    queryFn: () => must<Profile[]>(supabase.from("profiles").select("*").order("created_at")),
  });

export const useRoles = () =>
  useQuery({
    queryKey: ["user_roles"],
    queryFn: () =>
      must<Tables["user_roles"]["Row"][]>(supabase.from("user_roles").select("*")),
  });

export const useLeads = () =>
  useQuery({
    queryKey: ["leads"],
    queryFn: () =>
      must<Lead[]>(supabase.from("leads").select("*").order("created_at", { ascending: false })),
  });

export const useLead = (id: string) =>
  useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Lead | null;
    },
  });

export const useDemos = () =>
  useQuery({
    queryKey: ["demos"],
    queryFn: () => must<Demo[]>(supabase.from("demos").select("*")),
  });

export const useOutreach = () =>
  useQuery({
    queryKey: ["outreach"],
    queryFn: () => must<Outreach[]>(supabase.from("outreach").select("*")),
  });

export const useFollowUps = () =>
  useQuery({
    queryKey: ["follow_ups"],
    queryFn: () =>
      must<FollowUp[]>(supabase.from("follow_ups").select("*").order("due_date")),
  });

export const useTasks = () =>
  useQuery({
    queryKey: ["tasks"],
    queryFn: () =>
      must<Task[]>(supabase.from("tasks").select("*").order("due_at", { nullsFirst: false })),
  });

export const useSubtasks = (taskId?: string) =>
  useQuery({
    queryKey: ["subtasks", taskId],
    enabled: Boolean(taskId),
    queryFn: () =>
      must<Subtask[]>(
        supabase.from("task_subtasks").select("*").eq("task_id", taskId!).order("created_at"),
      ),
  });

export const useTimeEntries = () =>
  useQuery({
    queryKey: ["time_entries"],
    queryFn: () =>
      must<TimeEntry[]>(
        supabase.from("task_time_entries").select("*").order("started_at", { ascending: false }),
      ),
  });

export const useContent = () =>
  useQuery({
    queryKey: ["content"],
    queryFn: () =>
      must<ContentItem[]>(
        supabase.from("content").select("*").order("updated_at", { ascending: false }),
      ),
  });

export const useContentFeedback = (contentId?: string) =>
  useQuery({
    queryKey: ["content_feedback", contentId],
    enabled: Boolean(contentId),
    queryFn: () =>
      must<Tables["content_feedback"]["Row"][]>(
        supabase
          .from("content_feedback")
          .select("*")
          .eq("content_id", contentId!)
          .order("created_at", { ascending: false }),
      ),
  });

export const useNotes = () =>
  useQuery({
    queryKey: ["notes"],
    queryFn: () =>
      must<Note[]>(
        supabase
          .from("notes")
          .select("*")
          .order("pinned", { ascending: false })
          .order("updated_at", { ascending: false }),
      ),
  });

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      must<Notification[]>(
        supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      ),
  });

export const useCalendarEvents = () =>
  useQuery({
    queryKey: ["calendar_events"],
    queryFn: () =>
      must<CalendarEvent[]>(supabase.from("calendar_events").select("*").order("starts_at")),
  });

export const useActivity = () =>
  useQuery({
    queryKey: ["activity_logs"],
    queryFn: () =>
      must<ActivityLog[]>(
        supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      ),
  });

export const useLeadNotes = (leadId?: string) =>
  useQuery({
    queryKey: ["lead_notes", leadId],
    enabled: Boolean(leadId),
    queryFn: () =>
      must<Tables["lead_notes"]["Row"][]>(
        supabase
          .from("lead_notes")
          .select("*")
          .eq("lead_id", leadId!)
          .order("created_at", { ascending: false }),
      ),
  });

export const useLeadActivity = (leadId?: string) =>
  useQuery({
    queryKey: ["lead_activities", leadId],
    enabled: Boolean(leadId),
    queryFn: () =>
      must<Tables["lead_activities"]["Row"][]>(
        supabase
          .from("lead_activities")
          .select("*")
          .eq("lead_id", leadId!)
          .order("created_at", { ascending: false }),
      ),
  });

export const useDailyGoal = (userId?: string) =>
  useQuery({
    queryKey: ["daily_goal", userId, todayISO()],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("user_id", userId!)
        .eq("goal_date", todayISO())
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as DailyGoal | null;
    },
  });

export const useWeeklyReview = (userId: string | undefined, weekStart: string) =>
  useQuery({
    queryKey: ["weekly_review", userId, weekStart],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("user_id", userId!)
        .eq("week_start", weekStart)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

/* --------------------------------- mutations -------------------------------- */

const INVALIDATE: Record<string, string[]> = {
  leads: ["leads", "lead", "activity_logs"],
  demos: ["demos", "leads"],
  outreach: ["outreach", "leads"],
  follow_ups: ["follow_ups"],
  tasks: ["tasks", "activity_logs"],
  task_subtasks: ["subtasks"],
  task_time_entries: ["time_entries"],
  content: ["content", "activity_logs"],
  content_feedback: ["content_feedback", "content"],
  content_schedule: ["content_schedule", "content"],
  notes: ["notes"],
  notifications: ["notifications"],
  calendar_events: ["calendar_events"],
  lead_notes: ["lead_notes"],
  daily_goals: ["daily_goal"],
  weekly_reviews: ["weekly_review"],
};

type TableName = keyof typeof INVALIDATE;

export function useUpsert<T extends TableName>(table: T, successMessage?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const query = supabase.from(table as never);
      const id = values['id'] as string | undefined;
      const { data, error } = id
        ? await query
            .update(values as never)
            .eq("id", id!)
            .select()
            .maybeSingle()
        : await query
            .insert(values as never)
            .select()
            .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      (INVALIDATE[table] ?? [table]).forEach((key) =>
        qc.invalidateQueries({ queryKey: [key] }),
      );
      if (successMessage) toast.success(successMessage);
    },
    onError: (error: { message?: string }) =>
      toast.error(error?.message ?? "Something went wrong"),
  });
}

export function useRemove<T extends TableName>(table: T, successMessage?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      (INVALIDATE[table] ?? [table]).forEach((key) =>
        qc.invalidateQueries({ queryKey: [key] }),
      );
      if (successMessage) toast.success(successMessage);
    },
    onError: (error: { message?: string }) =>
      toast.error(error?.message ?? "Could not delete"),
  });
}

/* ------------------------------ AI-ready seams ------------------------------ */
/**
 * Placeholder hooks for future AI features (lead analysis, scoring, outreach
 * copy, daily planning, weekly review, productivity coaching).
 * V1 is fully manual — these return deterministic local suggestions only.
 */
export const aiSeams = {
  suggestLeadScore(lead: Pick<Lead, "priority" | "website" | "instagram" | "linkedin">) {
    let score = lead.priority === "hot" ? 80 : lead.priority === "warm" ? 60 : 40;
    if (lead.website) score += 5;
    if (lead.instagram) score += 3;
    if (lead.linkedin) score += 2;
    return Math.min(100, score);
  },
  outreachTemplate(lead: Pick<Lead, "business_name" | "decision_maker" | "website_problems">) {
    const name = lead.decision_maker?.split(" ")[0] ?? "there";
    return `Hi ${name} — I built a quick demo for ${lead.business_name}. ${
      lead.website_problems ? `Noticed: ${lead.website_problems} ` : ""
    }Want the link?`;
  },
};

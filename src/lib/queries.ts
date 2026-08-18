import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/lib/constants";

async function rows<T>(promise: PromiseLike<{ data: T[] | null; error: unknown }>) {
  const { data, error } = await promise;
  if (error) throw error;
  return (data ?? []) as T[];
}

export type AutomationSettings = Tables["automation_settings"]["Row"];
export type AutomationLogRow = Tables["automation_log"]["Row"];
export type ContentSchedule = Tables["content_schedule"]["Row"];

export const DEFAULT_AUTOMATION = {
  auto_tasks_enabled: true,
  followup_1_days: 3,
  followup_2_days: 7,
  followup_3_days: 14,
  stagnation_days: 3,
  notify_task_reminders: true,
  notify_followups: true,
  notify_content: true,
  notify_team: true,
  leads_target: 10,
  demos_target: 8,
  deploys_target: 8,
  outreach_target: 10,
};

export const useAutomationSettings = (userId?: string) =>
  useQuery({
    queryKey: ["automation_settings", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_settings")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as AutomationSettings | null;
    },
  });

export const useAutomationLog = () =>
  useQuery({
    queryKey: ["automation_log"],
    queryFn: () =>
      rows<AutomationLogRow>(
        supabase
          .from("automation_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(150),
      ),
  });

export const useContentSchedule = () =>
  useQuery({
    queryKey: ["content_schedule"],
    queryFn: () =>
      rows<ContentSchedule>(
        supabase.from("content_schedule").select("*").order("scheduled_at"),
      ),
  });

export const useAllSubtasks = () =>
  useQuery({
    queryKey: ["subtasks", "all"],
    queryFn: () =>
      rows<Tables["task_subtasks"]["Row"]>(
        supabase.from("task_subtasks").select("*").order("created_at"),
      ),
  });

export const useAllLeadNotes = () =>
  useQuery({
    queryKey: ["lead_notes", "all"],
    queryFn: () =>
      rows<Tables["lead_notes"]["Row"]>(
        supabase.from("lead_notes").select("*").order("created_at", { ascending: false }),
      ),
  });

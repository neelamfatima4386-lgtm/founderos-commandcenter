import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type LeadStage = Database["public"]["Enums"]["lead_stage"];
export type LeadPriority = Database["public"]["Enums"]["lead_priority"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type RecurrenceType = Database["public"]["Enums"]["recurrence_type"];
export type OutreachChannel = Database["public"]["Enums"]["outreach_channel"];
export type OutreachStatus = Database["public"]["Enums"]["outreach_status"];
export type ContentStatus = Database["public"]["Enums"]["content_status"];
export type ContentPlatform = Database["public"]["Enums"]["content_platform"];
export type ContentKind = Database["public"]["Enums"]["content_kind"];

export type Tables = Database["public"]["Tables"];
export type Lead = Tables["leads"]["Row"];
export type Demo = Tables["demos"]["Row"];
export type Outreach = Tables["outreach"]["Row"];
export type Task = Tables["tasks"]["Row"];
export type Subtask = Tables["task_subtasks"]["Row"];
export type TimeEntry = Tables["task_time_entries"]["Row"];
export type ContentItem = Tables["content"]["Row"];
export type Note = Tables["notes"]["Row"];
export type Notification = Tables["notifications"]["Row"];
export type CalendarEvent = Tables["calendar_events"]["Row"];
export type ActivityLog = Tables["activity_logs"]["Row"];
export type Profile = Tables["profiles"]["Row"];
export type FollowUp = Tables["follow_ups"]["Row"];
export type DailyGoal = Tables["daily_goals"]["Row"];

export const LEAD_STAGES: { value: LeadStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "analyzing", label: "Analyzing" },
  { value: "prompt_ready", label: "Prompt Ready" },
  { value: "demo_building", label: "Demo Building" },
  { value: "deployed", label: "Deployed" },
  { value: "message_ready", label: "Message Ready" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up", label: "Follow-up" },
  { value: "replied", label: "Replied" },
  { value: "meeting", label: "Meeting" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const stageLabel = (stage: LeadStage) =>
  LEAD_STAGES.find((s) => s.value === stage)?.label ?? stage;

export const LEAD_PRIORITIES: { value: LeadPriority; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
];

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const RECURRENCES: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "One-off" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export const OUTREACH_CHANNELS: { value: OutreachChannel; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "x", label: "X" },
  { value: "other", label: "Other" },
];

export const OUTREACH_STATUSES: { value: OutreachStatus; label: string }[] = [
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up_due", label: "Follow-up Due" },
  { value: "replied", label: "Replied" },
  { value: "no_response", label: "No Response" },
  { value: "meeting", label: "Meeting" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const CONTENT_STATUSES: { value: ContentStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

export const CONTENT_PLATFORMS: { value: ContentPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "Other" },
];

export const CONTENT_KINDS: { value: ContentKind; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "carousel", label: "Carousel" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
  { value: "thread", label: "Thread" },
  { value: "educational", label: "Educational" },
  { value: "promotional", label: "Promotional" },
  { value: "case_study", label: "Case Study" },
  { value: "personal_brand", label: "Personal Brand" },
];

export const label = <T extends string>(
  options: { value: T; label: string }[],
  value: T | null | undefined,
) => (value ? (options.find((o) => o.value === value)?.label ?? value) : "—");

/** The founder's daily execution workflow, in order. */
export const FOUNDER_WORKFLOW = [
  { key: "find", label: "Find Lead", stage: "new" as LeadStage },
  { key: "analyze", label: "Analyze Lead", stage: "analyzing" as LeadStage },
  { key: "prompt", label: "Generate AI Prompt", stage: "prompt_ready" as LeadStage },
  { key: "build", label: "Build Demo", stage: "demo_building" as LeadStage },
  { key: "deploy", label: "Deploy Demo", stage: "deployed" as LeadStage },
  { key: "message", label: "Personalized Message", stage: "message_ready" as LeadStage },
  { key: "outreach", label: "Send Outreach", stage: "contacted" as LeadStage },
];

export const CO_FOUNDER_CATEGORIES = ["LinkedIn", "X", "Instagram", "Content"];

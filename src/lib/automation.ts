import { addDays, differenceInCalendarDays, format } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import type {
  Demo,
  FollowUp,
  Lead,
  LeadStage,
  Outreach,
  Task,
} from "@/lib/constants";
import { stageLabel } from "@/lib/constants";
import { DEFAULT_AUTOMATION, type AutomationSettings } from "@/lib/queries";

export type Settings = typeof DEFAULT_AUTOMATION;

export const resolveSettings = (row?: AutomationSettings | null): Settings => ({
  ...DEFAULT_AUTOMATION,
  ...(row
    ? {
        auto_tasks_enabled: row.auto_tasks_enabled,
        followup_1_days: row.followup_1_days,
        followup_2_days: row.followup_2_days,
        followup_3_days: row.followup_3_days,
        stagnation_days: row.stagnation_days,
        notify_task_reminders: row.notify_task_reminders,
        notify_followups: row.notify_followups,
        notify_content: row.notify_content,
        notify_team: row.notify_team,
        leads_target: row.leads_target,
        demos_target: row.demos_target,
        deploys_target: row.deploys_target,
        outreach_target: row.outreach_target,
      }
    : {}),
});

/* ------------------------------ shared writers ----------------------------- */

export async function writeActivity(entry: {
  actorId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  description: string;
}) {
  const { error } = await supabase.from("activity_logs").insert({
    actor_id: entry.actorId ?? null,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    action: entry.action,
    description: entry.description,
  });
  if (error) console.warn("[activity]", error.message);
}

export async function writeNotification(entry: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  // Idempotent: skip when an identical unread notification already exists.
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", entry.userId)
    .eq("title", entry.title)
    .eq("read", false)
    .limit(1);
  if (existing && existing.length > 0) return;
  const { error } = await supabase.from("notifications").insert({
    user_id: entry.userId,
    type: entry.type,
    title: entry.title,
    body: entry.body ?? null,
    link: entry.link ?? null,
  });
  if (error) console.warn("[notify]", error.message);
}

export async function writeAutomationLog(entry: {
  actorId?: string | null;
  automation: string;
  trigger: string;
  action: string;
  entityType?: string;
  entityId?: string | null;
  result?: "success" | "skipped" | "failed";
  detail?: string;
}) {
  const { error } = await supabase.from("automation_log").insert({
    actor_id: entry.actorId ?? null,
    automation: entry.automation,
    trigger: entry.trigger,
    action: entry.action,
    entity_type: entry.entityType ?? null,
    entity_id: entry.entityId ?? null,
    result: entry.result ?? "success",
    detail: entry.detail ?? null,
  });
  if (error) console.warn("[automation-log]", error.message);
}

/** Creates a task unless an equivalent open task already exists (idempotent). */
export async function ensureTask(input: {
  title: string;
  actorId?: string | null;
  leadId?: string | null;
  assignedTo?: string | null;
  priority?: Task["priority"];
  category?: string;
  description?: string;
  dueAt?: string | null;
  automation: string;
  trigger: string;
}): Promise<"created" | "skipped" | "failed"> {
  try {
    let query = supabase
      .from("tasks")
      .select("id")
      .eq("title", input.title)
      .neq("status", "completed")
      .limit(1);
    query = input.leadId ? query.eq("lead_id", input.leadId) : query.is("lead_id", null);
    const { data: existing, error: findError } = await query;
    if (findError) throw findError;

    if (existing && existing.length > 0) {
      await writeAutomationLog({
        actorId: input.actorId,
        automation: input.automation,
        trigger: input.trigger,
        action: `Skipped duplicate task "${input.title}"`,
        entityType: "task",
        entityId: existing[0]!.id,
        result: "skipped",
      });
      return "skipped";
    }

    const { data: created, error } = await supabase
      .from("tasks")
      .insert({
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? "Lead workflow",
        priority: input.priority ?? "high",
        lead_id: input.leadId ?? null,
        assigned_to: input.assignedTo ?? input.actorId ?? null,
        created_by: input.actorId ?? null,
        due_at: input.dueAt ?? null,
      })
      .select("id")
      .maybeSingle();
    if (error) throw error;

    await writeAutomationLog({
      actorId: input.actorId,
      automation: input.automation,
      trigger: input.trigger,
      action: `Created task "${input.title}"`,
      entityType: "task",
      entityId: created?.id ?? null,
    });
    return "created";
  } catch (error) {
    await writeAutomationLog({
      actorId: input.actorId,
      automation: input.automation,
      trigger: input.trigger,
      action: `Could not create task "${input.title}"`,
      result: "failed",
      detail: (error as { message?: string })?.message ?? "Unknown error",
    });
    return "failed";
  }
}

/* --------------------------- lead workflow engine -------------------------- */

const STAGE_ORDER: LeadStage[] = [
  "new",
  "analyzing",
  "prompt_ready",
  "demo_building",
  "deployed",
  "message_ready",
  "contacted",
  "follow_up",
  "replied",
  "meeting",
  "won",
];

export const stageIndex = (stage: LeadStage) => STAGE_ORDER.indexOf(stage);

export const nextStage = (stage: LeadStage): LeadStage | null => {
  if (stage === "won" || stage === "lost") return null;
  const i = STAGE_ORDER.indexOf(stage);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1]! : null;
};

const STAGE_NEXT_ACTION: Record<LeadStage, string> = {
  new: "Research the business and analyze the website",
  analyzing: "Generate the build prompt for the demo",
  prompt_ready: "Build the demo",
  demo_building: "Deploy the demo and save the live URL",
  deployed: "Write a personalized outreach message",
  message_ready: "Send the outreach message",
  contacted: "Schedule the first follow-up",
  follow_up: "Complete the due follow-up",
  replied: "Reply and book a meeting",
  meeting: "Run the meeting and close the deal",
  won: "Onboard the new client",
  lost: "Archive and capture the lesson learned",
};

export const nextActionLabel = (stage: LeadStage) => STAGE_NEXT_ACTION[stage];

/** Derived (record-backed) execution checklist for a lead. */
export function leadChecklist(
  lead: Lead,
  demo?: Demo | null,
  outreach?: Outreach | null,
  followUps: FollowUp[] = [],
) {
  const reached = stageIndex(lead.stage);
  const at = (stage: LeadStage) => reached >= stageIndex(stage);
  return [
    { label: "Lead added", done: true },
    { label: "Research", done: Boolean(lead.website_problems) || at("analyzing") },
    { label: "Analysis", done: Boolean(lead.opportunity) || at("prompt_ready") },
    { label: "Prompt", done: Boolean(demo?.prompt_done) || at("demo_building") },
    { label: "Demo", done: Boolean(demo?.build_done ?? demo?.demo_ready) || at("deployed") },
    { label: "Deployment", done: Boolean(demo?.deploy_done) || at("deployed") },
    { label: "Personalized message", done: Boolean(outreach?.message_ready) || at("message_ready") },
    { label: "Outreach", done: Boolean(outreach?.message_sent) || at("contacted") },
    {
      label: "Follow-up",
      done: followUps.some((f) => f.completed) || at("replied"),
    },
    { label: "Reply", done: Boolean(outreach?.replied_at) || at("replied") },
    { label: "Meeting", done: Boolean(outreach?.meeting_at) || at("meeting") },
  ];
}

/** Runs when a lead moves stage: logs activity and prepares the next task. */
export async function onLeadStageChanged(input: {
  lead: Lead;
  from: LeadStage;
  to: LeadStage;
  actorId?: string | null;
  actorName?: string | null;
  settings: Settings;
}) {
  const { lead, from, to, actorId, actorName, settings } = input;
  await writeActivity({
    actorId,
    entityType: "lead",
    entityId: lead.id,
    action: "lead_stage_changed",
    description: `${actorName ?? "Someone"} moved ${lead.business_name} from ${stageLabel(from)} to ${stageLabel(to)}`,
  });

  if (!settings.auto_tasks_enabled) return;
  const action = STAGE_NEXT_ACTION[to];
  if (!action || to === "won" || to === "lost") return;
  await ensureTask({
    title: `${action} — ${lead.business_name}`,
    actorId,
    leadId: lead.id,
    priority: to === "deployed" || to === "follow_up" ? "high" : "medium",
    automation: "Create next task",
    trigger: `Lead moved to ${stageLabel(to)}`,
    description: `Auto-created from the lead workflow when ${lead.business_name} reached ${stageLabel(to)}.`,
  });
}

/** Runs when a demo record is saved: advances the lead + queues outreach work. */
export async function onDemoSaved(input: {
  lead?: Lead | null;
  demo: Partial<Demo> & { id?: string; lead_id: string };
  actorId?: string | null;
  actorName?: string | null;
  settings: Settings;
}) {
  const { lead, demo, actorId, actorName, settings } = input;
  if (!lead) return;
  if (demo.deploy_done && lead.stage !== "deployed" && stageIndex(lead.stage) < stageIndex("deployed")) {
    await supabase.from("leads").update({ stage: "deployed" }).eq("id", lead.id);
    await onLeadStageChanged({
      lead,
      from: lead.stage,
      to: "deployed",
      actorId,
      actorName,
      settings,
    });
  } else if (demo.deploy_done && settings.auto_tasks_enabled) {
    await ensureTask({
      title: `Write a personalized outreach message — ${lead.business_name}`,
      actorId,
      leadId: lead.id,
      priority: "high",
      automation: "Create next task",
      trigger: "Demo marked deployed",
    });
  }
}

/** Schedules follow-ups after outreach is sent, respecting configured intervals. */
export async function onOutreachSent(input: {
  lead: Lead;
  outreach: Outreach;
  existing: FollowUp[];
  actorId?: string | null;
  settings: Settings;
}) {
  const { lead, outreach, existing, actorId, settings } = input;
  if (outreach.replied_at || ["won", "lost", "replied", "meeting"].includes(outreach.status)) {
    await writeAutomationLog({
      actorId,
      automation: "Schedule follow-ups",
      trigger: "Outreach marked sent",
      action: "Skipped — lead already replied or closed",
      entityType: "lead",
      entityId: lead.id,
      result: "skipped",
    });
    return;
  }

  const base = outreach.first_contact_at ? new Date(outreach.first_contact_at) : new Date();
  const offsets = [settings.followup_1_days, settings.followup_2_days, settings.followup_3_days];
  const open = existing.filter((f) => f.lead_id === lead.id && !f.completed);
  let created = 0;

  for (const [index, days] of offsets.entries()) {
    const due = format(addDays(base, days), "yyyy-MM-dd");
    if (open.some((f) => f.due_date === due)) continue;
    const { error } = await supabase.from("follow_ups").insert({
      lead_id: lead.id,
      channel: outreach.channel,
      due_date: due,
      note: `Follow-up #${index + 1} for ${lead.business_name}`,
      created_by: actorId ?? null,
    });
    if (error) {
      await writeAutomationLog({
        actorId,
        automation: "Schedule follow-ups",
        trigger: "Outreach marked sent",
        action: `Could not create follow-up #${index + 1}`,
        entityType: "lead",
        entityId: lead.id,
        result: "failed",
        detail: error.message,
      });
      return;
    }
    created += 1;
  }

  await writeAutomationLog({
    actorId,
    automation: "Schedule follow-ups",
    trigger: "Outreach marked sent",
    action: created > 0 ? `Scheduled ${created} follow-up(s)` : "No new follow-ups needed",
    entityType: "lead",
    entityId: lead.id,
    result: created > 0 ? "success" : "skipped",
  });
}

/* ----------------------------- insight helpers ----------------------------- */

export type NextBestAction = {
  kind: "followup" | "task" | "lead";
  title: string;
  reason: string[];
  leadId?: string;
  taskId?: string;
  followUpId?: string;
};

export function nextBestAction(input: {
  leads: Lead[];
  tasks: Task[];
  followUps: FollowUp[];
  demos: Demo[];
  outreach: Outreach[];
}): NextBestAction | null {
  const { leads, tasks, followUps, demos, outreach } = input;
  const today = new Date();

  const overdueFollowUp = followUps
    .filter((f) => !f.completed && new Date(f.due_date) <= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  if (overdueFollowUp) {
    const lead = leads.find((l) => l.id === overdueFollowUp.lead_id);
    const days = differenceInCalendarDays(today, new Date(overdueFollowUp.due_date));
    return {
      kind: "followup",
      title: `Follow up with ${lead?.business_name ?? "this lead"}`,
      reason: [
        days > 0 ? `Follow-up was due ${days}d ago` : "Follow-up is due today",
        lead ? `Lead score: ${lead.lead_score}` : "",
        outreach.some((o) => o.lead_id === lead?.id && o.message_sent)
          ? "Outreach already sent, no reply yet"
          : "",
      ].filter(Boolean),
      leadId: lead?.id,
      followUpId: overdueFollowUp.id,
    };
  }

  const overdueTask = tasks
    .filter((t) => t.status !== "completed" && t.due_at && new Date(t.due_at) < today)
    .sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""))[0];
  if (overdueTask) {
    return {
      kind: "task",
      title: overdueTask.title,
      reason: ["Task is overdue", `Priority: ${overdueTask.priority}`],
      taskId: overdueTask.id,
      leadId: overdueTask.lead_id ?? undefined,
    };
  }

  const readyForOutreach = leads
    .filter((l) => l.stage === "deployed" || l.stage === "message_ready")
    .sort((a, b) => b.lead_score - a.lead_score)[0];
  if (readyForOutreach) {
    return {
      kind: "lead",
      title: `Send outreach to ${readyForOutreach.business_name}`,
      reason: [
        "Demo is deployed and waiting",
        `Lead score: ${readyForOutreach.lead_score}`,
        nextActionLabel(readyForOutreach.stage),
      ],
      leadId: readyForOutreach.id,
    };
  }

  const activeLead = leads
    .filter((l) => l.stage !== "won" && l.stage !== "lost")
    .sort((a, b) => stageIndex(b.stage) - stageIndex(a.stage) || b.lead_score - a.lead_score)[0];
  if (activeLead) {
    const demo = demos.find((d) => d.lead_id === activeLead.id);
    return {
      kind: "lead",
      title: `${nextActionLabel(activeLead.stage)} — ${activeLead.business_name}`,
      reason: [
        `Currently at ${stageLabel(activeLead.stage)}`,
        demo?.deploy_done ? "Demo deployed" : "Demo not deployed yet",
      ],
      leadId: activeLead.id,
    };
  }

  const openTask = tasks.filter((t) => t.status !== "completed")[0];
  if (openTask) {
    return {
      kind: "task",
      title: openTask.title,
      reason: ["Highest open task", `Priority: ${openTask.priority}`],
      taskId: openTask.id,
    };
  }
  return null;
}

export type Bottleneck = { title: string; detail: string; stage?: LeadStage };

export function detectBottlenecks(leads: Lead[], outreach: Outreach[]): Bottleneck[] {
  const out: Bottleneck[] = [];
  const counts = new Map<LeadStage, number>();
  leads.forEach((l) => counts.set(l.stage, (counts.get(l.stage) ?? 0) + 1));

  for (const [stage, count] of counts) {
    if (count >= 4 && stage !== "won" && stage !== "lost") {
      out.push({
        title: `Potential bottleneck at ${stageLabel(stage)}`,
        detail: `${count} leads are currently waiting at ${stageLabel(stage)}.`,
        stage,
      });
    }
  }

  const deployedWaiting = leads.filter(
    (l) =>
      (l.stage === "deployed" || l.stage === "message_ready") &&
      !outreach.some((o) => o.lead_id === l.id && o.message_sent),
  );
  if (deployedWaiting.length >= 2) {
    out.push({
      title: "Outreach bottleneck",
      detail: `${deployedWaiting.length} deployed demos are waiting for outreach.`,
    });
  }
  return out.slice(0, 4);
}

export function stagnantLeads(leads: Lead[], days: number) {
  return leads
    .filter(
      (l) =>
        l.stage !== "won" &&
        l.stage !== "lost" &&
        differenceInCalendarDays(new Date(), new Date(l.updated_at)) >= days,
    )
    .map((l) => ({
      lead: l,
      days: differenceInCalendarDays(new Date(), new Date(l.updated_at)),
    }))
    .sort((a, b) => b.days - a.days);
}

export type ScoreFactor = { label: string; delta: number };

export function productivityScore(input: {
  leadsToday: number;
  demosToday: number;
  outreachToday: number;
  tasksCompletedToday: number;
  tasksOpen: number;
  overdueCount: number;
  followUpsCompletedToday: number;
  targets: { leads: number; demos: number; outreach: number };
}) {
  const factors: ScoreFactor[] = [];
  const share = (done: number, target: number) => (target > 0 ? Math.min(1, done / target) : 0);

  const leadPart = Math.round(share(input.leadsToday, input.targets.leads) * 25);
  const demoPart = Math.round(share(input.demosToday, input.targets.demos) * 20);
  const outreachPart = Math.round(share(input.outreachToday, input.targets.outreach) * 25);
  const taskPart = Math.min(20, input.tasksCompletedToday * 4);
  const followPart = Math.min(10, input.followUpsCompletedToday * 5);
  const penalty = Math.min(20, input.overdueCount * 5);

  if (leadPart) factors.push({ label: `Lead target ${input.leadsToday}/${input.targets.leads}`, delta: leadPart });
  if (demoPart) factors.push({ label: `Demo target ${input.demosToday}/${input.targets.demos}`, delta: demoPart });
  if (outreachPart)
    factors.push({ label: `Outreach target ${input.outreachToday}/${input.targets.outreach}`, delta: outreachPart });
  if (taskPart) factors.push({ label: `${input.tasksCompletedToday} tasks completed`, delta: taskPart });
  if (followPart) factors.push({ label: `${input.followUpsCompletedToday} follow-ups completed`, delta: followPart });
  if (penalty) factors.push({ label: `${input.overdueCount} overdue items`, delta: -penalty });

  const score = Math.max(0, Math.min(100, leadPart + demoPart + outreachPart + taskPart + followPart - penalty));
  return { score, factors };
}

/** Rule-based daily plan blocks, seeded from real workload. */
export function suggestedPlan(input: {
  overdue: number;
  followUpsToday: number;
  meetingsToday: number;
  leadsRemaining: number;
  demosRemaining: number;
  outreachRemaining: number;
}) {
  const blocks = [
    { time: "09:00", label: "Lead generation", detail: `${input.leadsRemaining} leads remaining` },
    { time: "10:30", label: "Demo building", detail: `${input.demosRemaining} demos remaining` },
    { time: "12:00", label: "Outreach", detail: `${input.outreachRemaining} messages remaining` },
    { time: "14:00", label: "Follow-ups", detail: `${input.followUpsToday} due today` },
    { time: "16:00", label: "Co-founder review", detail: "Approvals and assignments" },
    { time: "18:00", label: "Daily review", detail: "Close out the day" },
  ];
  if (input.overdue > 0) {
    blocks.unshift({
      time: "08:30",
      label: "Clear overdue work",
      detail: `${input.overdue} overdue item(s)`,
    });
  }
  if (input.meetingsToday > 0) {
    blocks.splice(3, 0, {
      time: "13:00",
      label: "Scheduled meetings",
      detail: `${input.meetingsToday} today`,
    });
  }
  return blocks;
}

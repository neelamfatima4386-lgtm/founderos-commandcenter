import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, CircleCheck as CheckCircle2, Clock, Plus, MessageSquare } from "lucide-react";
import { isToday } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  useLeads,
  useOutreach,
  useFollowUps,
  useUpsert,
  logActivity,
} from "@/lib/data";
import { useAutomationSettings } from "@/lib/queries";
import {
  OUTREACH_CHANNELS,
  OUTREACH_STATUSES,
  stageLabel,
  type OutreachChannel,
  type OutreachStatus,
} from "@/lib/constants";
import { fmtDate, fmtDateTime } from "@/lib/app-utils";
import { onOutreachSent, resolveSettings } from "@/lib/automation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
  outreachStatusTone,
} from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";

export const Route = createFileRoute("/_authenticated/outreach")({
  head: () => ({
    meta: [
      { title: "Outreach — ElevateX Founder OS" },
      { name: "description", content: "Outreach CRM with follow-up tracking." },
    ],
  }),
  component: OutreachPage,
});

function OutreachPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: outreach = [], isLoading: outreachLoading } = useOutreach();
  const { data: followUps = [] } = useFollowUps();
  const { data: settings } = useAutomationSettings(user?.id);
  const outreachUpsert = useUpsert("outreach", "Outreach updated");
  const followUpUpsert = useUpsert("follow_ups", "Follow-up updated");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");

  const isLoading = leadsLoading || outreachLoading;
  const resolved = resolveSettings(settings ?? null);
  const dueToday = followUps.filter((f) => !f.completed && isToday(new Date(f.due_date)));

  function leadName(leadId: string) {
    return leads.find((l) => l.id === leadId)?.business_name ?? "Unknown";
  }

  async function markSent(o: typeof outreach[number]) {
    const payload: Record<string, unknown> = {
      id: o.id,
      message_sent: true,
      first_contact_at: o.first_contact_at ?? new Date().toISOString(),
      status: "contacted" as OutreachStatus,
    };
    await outreachUpsert.mutateAsync(payload);
    const lead = leads.find((l) => l.id === o.lead_id);
    if (lead && user) {
      await onOutreachSent({
        lead,
        outreach: { ...o, message_sent: true, first_contact_at: payload.first_contact_at as string },
        existing: followUps,
        actorId: user.id,
        settings: resolved,
      });
      await logActivity({
        entity_type: "outreach",
        entity_id: o.lead_id,
        action: "outreach_sent",
        description: `${profile?.full_name ?? "Someone"} sent outreach to ${lead.business_name}`,
      });
    }
    toast.success("Outreach marked as sent");
  }

  async function saveMessage(o: typeof outreach[number]) {
    await outreachUpsert.mutateAsync({ id: o.id, message: messageDraft });
    setEditingId(null);
    toast.success("Message saved");
  }

  async function completeFollowUp(id: string) {
    await followUpUpsert.mutateAsync({ id, completed: true, completed_at: new Date().toISOString() });
    toast.success("Follow-up completed");
  }

  const columns: Column<typeof outreach[number]>[] = [
    {
      key: "lead",
      header: "Lead",
      sortValue: (o) => leadName(o.lead_id),
      render: (o) => (
        <button onClick={() => void navigate({ to: "/leads/$leadId", params: { leadId: o.lead_id } })} className="truncate font-medium hover:text-primary">
          {leadName(o.lead_id)}
        </button>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      sortValue: (o) => o.channel,
      render: (o) => <span className="capitalize text-muted-foreground">{OUTREACH_CHANNELS.find((c) => c.value === o.channel)?.label ?? o.channel}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (o) => o.status,
      render: (o) => (
        <Select value={o.status} onValueChange={(v) => outreachUpsert.mutate({ id: o.id, status: v as OutreachStatus })}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {OUTREACH_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (o) => (
        <div className="max-w-xs">
          {editingId === o.id ? (
            <div className="flex gap-1">
              <Textarea value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} rows={2} className="text-sm" />
              <Button size="sm" onClick={() => saveMessage(o)}>Save</Button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingId(o.id); setMessageDraft(o.message ?? ""); }}
              className="truncate text-sm text-muted-foreground hover:text-foreground"
            >
              {o.message ?? "Click to add message…"}
            </button>
          )}
        </div>
      ),
    },
    {
      key: "first_contact",
      header: "First contact",
      sortValue: (o) => o.first_contact_at ?? "",
      render: (o) => <span className="text-muted-foreground">{o.first_contact_at ? fmtDate(o.first_contact_at) : "—"}</span>,
    },
    {
      key: "reply",
      header: "Reply",
      render: (o) => <span className="text-muted-foreground">{o.replied_at ? fmtDate(o.replied_at) : "—"}</span>,
    },
    {
      key: "meeting",
      header: "Meeting",
      render: (o) => <span className="text-muted-foreground">{o.meeting_at ? fmtDate(o.meeting_at) : "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (o) => (
        <div className="flex items-center justify-end gap-1">
          {!o.message_sent && (
            <Button size="sm" onClick={() => markSent(o)}><Send className="mr-1 size-3.5" /> Send</Button>
          )}
          {o.message_sent && <CheckCircle2 className="size-4 text-success" />}
        </div>
      ),
    },
  ];

  const filters: FilterDef[] = [
    {
      key: "channel",
      placeholder: "Channel",
      options: OUTREACH_CHANNELS.map((c) => ({ value: c.value, label: c.label })),
      match: (row, value) => (row.channel as string) === value,
    },
    {
      key: "status",
      placeholder: "Status",
      options: OUTREACH_STATUSES.map((s) => ({ value: s.value, label: s.label })),
      match: (row, value) => (row.status as string) === value,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Outreach" subtitle="Track every message, follow-up, reply and meeting." />

      {/* Follow-ups due today */}
      <SectionCard title="Follow-ups due today" icon={Clock} description={`${dueToday.length} waiting`} className="mb-5">
        {dueToday.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No follow-ups due" description="Nothing needs chasing today." />
        ) : (
          <ul className="space-y-2">
            {dueToday.map((f) => (
              <li key={f.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{leadName(f.lead_id)}</p>
                  <p className="truncate text-xs text-muted-foreground">{f.note ?? "Follow up"} · {f.channel}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => void navigate({ to: "/leads/$leadId", params: { leadId: f.lead_id } })}>Open</Button>
                  <Button size="sm" variant="ghost" onClick={() => completeFollowUp(f.id)}>
                    <CheckCircle2 className="size-4 text-success" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Outreach CRM" icon={Send} description={`${outreach.length} records`}>
        {isLoading ? (
          <LoadingRows rows={5} />
        ) : (
          <DataTable
            data={outreach}
            columns={columns}
            searchKeys={(o) => `${leadName(o.lead_id)} ${o.message ?? ""} ${o.outcome ?? ""}`}
            filters={filters}
            onRowClick={(o) => void navigate({ to: "/leads/$leadId", params: { leadId: o.lead_id } })}
            emptyState={
              <EmptyState
                icon={Send}
                title="No outreach yet"
                description="Create outreach records from each lead's detail page."
                action={<Button onClick={() => void navigate({ to: "/leads" })}>Go to leads</Button>}
              />
            }
          />
        )}
      </SectionCard>
    </div>
  );
}

import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CircleCheck as CheckCircle2, Clock, Copy, ExternalLink, FileText, Globe, Instagram, Linkedin, Mail, MessageSquare, Phone, Plus, Send, StickyNote, Trash2, Activity as ActivityIcon, MonitorSmartphone } from "lucide-react";
import { isToday, isPast } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  useLead,
  useDemos,
  useOutreach,
  useFollowUps,
  useLeadNotes,
  useLeadActivity,
  useUpsert,
  useRemove,
  logActivity,
  aiSeams,
} from "@/lib/data";
import { useAutomationSettings } from "@/lib/queries";
import {
  LEAD_STAGES,
  OUTREACH_CHANNELS,
  OUTREACH_STATUSES,
  stageLabel,
  type LeadStage,
  type OutreachChannel,
  type OutreachStatus,
} from "@/lib/constants";
import { fmtDate, fmtDateTime, timeAgo } from "@/lib/app-utils";
import { onLeadStageChanged, resolveSettings, nextStage } from "@/lib/automation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
  priorityTone,
  outreachStatusTone,
} from "@/components/app/primitives";
import { ConfirmDialog } from "@/components/app/confirm-dialog";

export const Route = createFileRoute("/_authenticated/leads/$leadId")({
  head: () => ({
    meta: [
      { title: "Lead detail — ElevateX Founder OS" },
      { name: "description", content: "Full lead workspace: demo, deployment, outreach and notes." },
      { property: "og:title", content: "Lead detail — ElevateX Founder OS" },
      { property: "og:description", content: "Full lead workspace: demo, deployment, outreach and notes." },
    ],
  }),
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { leadId } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(leadId);
  const { data: demos = [] } = useDemos();
  const { data: outreachList = [] } = useOutreach();
  const { data: followUps = [] } = useFollowUps();
  const { data: leadNotes = [] } = useLeadNotes(leadId);
  const { data: leadActivity = [] } = useLeadActivity(leadId);
  const { data: settings } = useAutomationSettings(user?.id);
  const resolved = resolveSettings(settings ?? null);

  const leadUpsert = useUpsert("leads");
  const demoUpsert = useUpsert("demos");
  const outreachUpsert = useUpsert("outreach");
  const followUpUpsert = useUpsert("follow_ups");
  const noteUpsert = useUpsert("lead_notes");
  const noteRemove = useRemove("lead_notes");

  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [newFollowUpChannel, setNewFollowUpChannel] = useState<OutreachChannel>("linkedin");
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const demo = demos.find((d) => d.lead_id === leadId) ?? null;
  const outreach = outreachList.find((o) => o.lead_id === leadId) ?? null;
  const leadFollowUps = followUps.filter((f) => f.lead_id === leadId);

  if (isLoading || !lead) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Lead detail" subtitle="Loading…" />
        <LoadingRows rows={5} />
      </div>
    );
  }

  async function advanceStage() {
    if (!lead) return;
    const next = nextStage(lead.stage);
    if (!next) return;
    await leadUpsert.mutateAsync({ id: lead.id, stage: next });
    await onLeadStageChanged({
      lead,
      from: lead.stage,
      to: next,
      actorId: user?.id,
      actorName: profile?.full_name,
      settings: resolved,
    });
    toast.success(`Moved to ${stageLabel(next)}`);
  }

  async function saveLeadField(field: string, value: string) {
    await leadUpsert.mutateAsync({ id: lead.id, [field]: value || null });
  }

  async function toggleDemoField(field: string, value: boolean) {
    if (!demo) {
      await demoUpsert.mutateAsync({ lead_id: lead.id, [field]: value });
    } else {
      const payload: Record<string, unknown> = { id: demo.id, [field]: value };
      if (field === "deploy_done" && value) {
        payload.deployed_at = new Date().toISOString();
      }
      await demoUpsert.mutateAsync(payload);
    }
    if (user) {
      await logActivity({
        entity_type: "demo",
        entity_id: lead.id,
        action: "demo_updated",
        description: `${profile?.full_name ?? "Someone"} updated demo for ${lead.business_name}: ${field} = ${value}`,
      });
    }
  }

  async function saveDemoUrl(field: string, value: string) {
    if (!demo) {
      await demoUpsert.mutateAsync({ lead_id: lead.id, [field]: value });
    } else {
      await demoUpsert.mutateAsync({ id: demo.id, [field]: value });
    }
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  }

  async function saveOutreachField(field: string, value: unknown) {
    if (!outreach) {
      await outreachUpsert.mutateAsync({ lead_id: lead.id, [field]: value });
    } else {
      await outreachUpsert.mutateAsync({ id: outreach.id, [field]: value });
    }
  }

  async function markOutreachSent() {
    if (!outreach) {
      await outreachUpsert.mutateAsync({
        lead_id: lead.id,
        message_sent: true,
        first_contact_at: new Date().toISOString(),
        status: "contacted" as OutreachStatus,
      });
    } else {
      await outreachUpsert.mutateAsync({
        id: outreach.id,
        message_sent: true,
        first_contact_at: outreach.first_contact_at ?? new Date().toISOString(),
        status: "contacted" as OutreachStatus,
      });
    }
    if (user) {
      await logActivity({
        entity_type: "outreach",
        entity_id: lead.id,
        action: "outreach_sent",
        description: `${profile?.full_name ?? "Someone"} sent outreach to ${lead.business_name}`,
      });
    }
    toast.success("Outreach marked as sent");
  }

  async function addNote() {
    if (!newNote.trim() || !user) return;
    await noteUpsert.mutateAsync({ lead_id: lead.id, body: newNote.trim(), author_id: user.id });
    setNewNote("");
    toast.success("Note added");
  }

  async function addFollowUp() {
    if (!newFollowUpDate || !user) return;
    await followUpUpsert.mutateAsync({
      lead_id: lead.id,
      due_date: newFollowUpDate,
      channel: newFollowUpChannel,
      note: `Follow-up for ${lead.business_name}`,
      created_by: user.id,
    });
    setNewFollowUpDate("");
    toast.success("Follow-up scheduled");
  }

  async function completeFollowUp(id: string) {
    await followUpUpsert.mutateAsync({ id, completed: true, completed_at: new Date().toISOString() });
    toast.success("Follow-up completed");
  }

  async function deleteNote() {
    if (!deleteNoteId) return;
    await noteRemove.mutateAsync(deleteNoteId);
    setDeleteNoteId(null);
  }

  const stageIdx = LEAD_STAGES.findIndex((s) => s.value === lead.stage);
  const progressStages = LEAD_STAGES.filter((s) => s.value !== "lost");

  return (
    <div className="mx-auto max-w-5xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => void navigate({ to: "/leads" })}
      >
        <ArrowLeft className="mr-1.5 size-4" /> Back to leads
      </Button>

      <PageHeader
        title={lead.business_name}
        subtitle={`${lead.industry ?? "—"} · ${lead.location ?? "—"}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge tone={priorityTone(lead.priority)}>{lead.priority}</StatusBadge>
            <StatusBadge tone="primary">{stageLabel(lead.stage)}</StatusBadge>
            <span className="text-sm text-muted-foreground">Score: {lead.lead_score}</span>
            {nextStage(lead.stage) && (
              <Button size="sm" onClick={advanceStage} disabled={leadUpsert.isPending}>
                Advance <ArrowRight className="ml-1.5 size-4" />
              </Button>
            )}
          </div>
        }
      />

      {/* Stage progression bar */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max items-center gap-1">
          {progressStages.map((s, i) => (
            <div key={s.value} className="flex items-center gap-1">
              <div
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  i <= stageIdx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                {s.label}
              </div>
              {i < progressStages.length - 1 && (
                <div className={`h-0.5 w-4 ${i < stageIdx ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <SectionCard title="Lead information" icon={FileText}>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditableField label="Business name" value={lead.business_name} onSave={(v) => saveLeadField("business_name", v)} />
              <EditableField label="Industry" value={lead.industry ?? ""} onSave={(v) => saveLeadField("industry", v)} />
              <EditableField label="Location" value={lead.location ?? ""} onSave={(v) => saveLeadField("location", v)} />
              <EditableField label="Lead source" value={lead.lead_source ?? ""} onSave={(v) => saveLeadField("lead_source", v)} />
              <EditableField label="Decision maker" value={lead.decision_maker ?? ""} onSave={(v) => saveLeadField("decision_maker", v)} />
              <EditableField label="Lead score" value={String(lead.lead_score)} onSave={(v) => saveLeadField("lead_score", v)} type="number" />
              <ContactLink icon={Globe} label="Website" value={lead.website} href={lead.website ? `https://${lead.website}` : null} />
              <ContactLink icon={Mail} label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : null} />
              <ContactLink icon={Phone} label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : null} />
              <ContactLink icon={Instagram} label="Instagram" value={lead.instagram} href={lead.instagram ? `https://instagram.com/${lead.instagram.replace("@", "")}` : null} />
              <ContactLink icon={Linkedin} label="LinkedIn" value={lead.linkedin} href={lead.linkedin ? `https://linkedin.com${lead.linkedin}` : null} />
              <div>
                <Label className="mb-1.5 block text-xs">Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {lead.tags.length > 0 ? lead.tags.map((t) => (
                    <StatusBadge key={t} tone="neutral">{t}</StatusBadge>
                  )) : <span className="text-sm text-muted-foreground">No tags</span>}
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* Research */}
        <TabsContent value="research">
          <div className="space-y-4">
            <SectionCard title="Website problems" icon={Globe}>
              <EditableTextarea value={lead.website_problems ?? ""} onSave={(v) => saveLeadField("website_problems", v)} placeholder="Describe current website issues…" />
            </SectionCard>
            <SectionCard title="Opportunity" icon={ArrowRight}>
              <EditableTextarea value={lead.opportunity ?? ""} onSave={(v) => saveLeadField("opportunity", v)} placeholder="What can we offer this lead?" />
            </SectionCard>
            <SectionCard title="Notes" icon={StickyNote}>
              <EditableTextarea value={lead.notes ?? ""} onSave={(v) => saveLeadField("notes", v)} placeholder="General notes about this lead…" />
            </SectionCard>
          </div>
        </TabsContent>

        {/* Demo */}
        <TabsContent value="demo">
          <SectionCard title="Demo tracker" icon={MonitorSmartphone} description="Track the build and deployment progress">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DemoCheckbox label="Lead research" done={demo?.research_done ?? false} onToggle={(v) => toggleDemoField("research_done", v)} />
                <DemoCheckbox label="AI prompt" done={demo?.prompt_done ?? false} onToggle={(v) => toggleDemoField("prompt_done", v)} />
                <DemoCheckbox label="Lovable build" done={demo?.build_done ?? false} onToggle={(v) => toggleDemoField("build_done", v)} />
                <DemoCheckbox label="Vercel deployment" done={demo?.deploy_done ?? false} onToggle={(v) => toggleDemoField("deploy_done", v)} />
                <DemoCheckbox label="Demo ready" done={demo?.demo_ready ?? false} onToggle={(v) => toggleDemoField("demo_ready", v)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <DemoUrlField label="Lovable URL" value={demo?.lovable_url ?? ""} onSave={(v) => saveDemoUrl("lovable_url", v)} />
                <DemoUrlField label="Vercel URL" value={demo?.vercel_url ?? ""} onSave={(v) => saveDemoUrl("vercel_url", v)} />
                <DemoUrlField label="Demo URL" value={demo?.demo_url ?? ""} onSave={(v) => saveDemoUrl("demo_url", v)} />
              </div>

              {demo?.deployed_at && (
                <p className="text-xs text-muted-foreground">Deployed: {fmtDateTime(demo.deployed_at)}</p>
              )}

              {demo?.demo_url && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => window.open(demo.demo_url!, "_blank")}>
                    <ExternalLink className="mr-1.5 size-3.5" /> Open Demo
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => copyUrl(demo.demo_url!)}>
                    <Copy className="mr-1.5 size-3.5" /> Copy URL
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Outreach */}
        <TabsContent value="outreach">
          <SectionCard title="Outreach" icon={Send}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Channel</Label>
                  <Select
                    value={outreach?.channel ?? "linkedin"}
                    onValueChange={(v) => saveOutreachField("channel", v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OUTREACH_CHANNELS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Status</Label>
                  <Select
                    value={outreach?.status ?? "not_contacted"}
                    onValueChange={(v) => saveOutreachField("status", v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OUTREACH_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label className="text-xs">Personalized message</Label>
                  <Button size="sm" variant="ghost" onClick={() => saveOutreachField("message", aiSeams.outreachTemplate(lead))}>
                    Generate template
                  </Button>
                </div>
                <Textarea
                  value={outreach?.message ?? ""}
                  onChange={(e) => {
                    if (!outreach) {
                      outreachUpsert.mutate({ lead_id: lead.id, message: e.target.value });
                    } else {
                      outreachUpsert.mutate({ id: outreach.id, message: e.target.value });
                    }
                  }}
                  rows={4}
                  placeholder="Write your personalized outreach message…"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={outreach?.message_ready ? "secondary" : "default"}
                  onClick={() => saveOutreachField("message_ready", !outreach?.message_ready)}
                >
                  <CheckCircle2 className="mr-1.5 size-3.5" />
                  {outreach?.message_ready ? "Message ready" : "Mark as ready"}
                </Button>
                <Button
                  size="sm"
                  variant={outreach?.message_sent ? "secondary" : "default"}
                  onClick={markOutreachSent}
                  disabled={outreach?.message_sent}
                >
                  <Send className="mr-1.5 size-3.5" />
                  {outreach?.message_sent ? "Sent" : "Mark as sent"}
                </Button>
                {outreach?.message && (
                  <Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard.writeText(outreach.message); toast.success("Message copied"); }}>
                    <Copy className="mr-1.5 size-3.5" /> Copy message
                  </Button>
                )}
              </div>

              {outreach && (
                <div className="grid gap-3 border-t border-border/60 pt-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-xs">Reply date</Label>
                    <Input
                      type="date"
                      value={outreach.replied_at ? outreach.replied_at.slice(0, 10) : ""}
                      onChange={(e) => saveOutreachField("replied_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block text-xs">Meeting date</Label>
                    <Input
                      type="date"
                      value={outreach.meeting_at ? outreach.meeting_at.slice(0, 10) : ""}
                      onChange={(e) => saveOutreachField("meeting_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Follow-ups */}
        <TabsContent value="followups">
          <SectionCard title="Follow-ups" icon={Clock} description={`${leadFollowUps.length} scheduled`}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border/60 p-3">
                <div>
                  <Label className="mb-1 block text-xs">Due date</Label>
                  <Input type="date" value={newFollowUpDate} onChange={(e) => setNewFollowUpDate(e.target.value)} className="w-auto" />
                </div>
                <div>
                  <Label className="mb-1 block text-xs">Channel</Label>
                  <Select value={newFollowUpChannel} onValueChange={(v) => setNewFollowUpChannel(v as OutreachChannel)}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OUTREACH_CHANNELS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={addFollowUp} disabled={!newFollowUpDate}>
                  <Plus className="mr-1 size-3.5" /> Schedule
                </Button>
              </div>

              {leadFollowUps.length === 0 ? (
                <EmptyState icon={Clock} title="No follow-ups" description="Schedule a follow-up to stay on top of this lead." />
              ) : (
                <ul className="space-y-2">
                  {leadFollowUps.map((f) => {
                    const overdue = !f.completed && isPast(new Date(f.due_date));
                    return (
                      <li key={f.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{f.note ?? "Follow up"}</p>
                          <p className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                            {fmtDate(f.due_date)} · {f.channel}
                            {f.completed && " · Completed"}
                          </p>
                        </div>
                        {!f.completed && (
                          <Button size="sm" variant="ghost" onClick={() => completeFollowUp(f.id)}>
                            <CheckCircle2 className="size-4 text-success" />
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <SectionCard title="Lead notes" icon={StickyNote}>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note…" rows={2} />
                <Button onClick={addNote} disabled={!newNote.trim()}><Plus className="size-4" /></Button>
              </div>
              {leadNotes.length === 0 ? (
                <EmptyState icon={StickyNote} title="No notes yet" description="Add notes specific to this lead." />
              ) : (
                <ul className="space-y-2">
                  {leadNotes.map((n) => (
                    <li key={n.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-lg border border-border/60 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm">{n.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteNoteId(n.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <SectionCard title="Lead activity" icon={ActivityIcon}>
            {leadActivity.length === 0 ? (
              <EmptyState icon={ActivityIcon} title="No activity yet" description="Actions on this lead will appear here." />
            ) : (
              <ul className="space-y-2">
                {leadActivity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/20">
                    <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{a.detail ?? a.action}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteNoteId !== null}
        onOpenChange={(v) => !v && setDeleteNoteId(null)}
        title="Delete this note?"
        onConfirm={deleteNote}
      />
    </div>
  );
}

function EditableField({ label, value, onSave, type = "text" }: { label: string; value: string; onSave: (v: string) => void; type?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div>
        <Label className="mb-1.5 block text-xs">{label}</Label>
        <div className="flex gap-1">
          <Input type={type} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          <Button size="sm" onClick={() => { onSave(draft); setEditing(false); }}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <button onClick={() => { setDraft(value); setEditing(true); }} className="w-full truncate text-left text-sm hover:text-primary">
        {value || <span className="text-muted-foreground">Click to edit…</span>}
      </button>
    </div>
  );
}

function EditableTextarea({ value, onSave, placeholder }: { value: string; onSave: (v: string) => void; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="space-y-2">
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus placeholder={placeholder} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { onSave(draft); setEditing(false); }}>Save</Button>
          <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => { setDraft(value); setEditing(true); }} className="w-full text-left">
      {value ? (
        <p className="text-sm">{value}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{placeholder ?? "Click to edit…"}</p>
      )}
    </button>
  );
}

function ContactLink({ icon: Icon, label, value, href }: { icon: typeof Globe; label: string; value: string | null; href: string | null }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {value && href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Icon className="size-3.5" /> {value}
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </div>
  );
}

function DemoCheckbox({ label, done, onToggle }: { label: string; done: boolean; onToggle: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5 hover:bg-muted/20">
      <Checkbox checked={done} onCheckedChange={(v) => onToggle(v as boolean)} />
      <span className={`text-sm ${done ? "text-muted-foreground line-through" : ""}`}>{label}</span>
    </label>
  );
}

function DemoUrlField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <div className="flex gap-1">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://…" className="text-sm" />
        <Button size="sm" variant="secondary" onClick={() => onSave(draft)}>Save</Button>
      </div>
    </div>
  );
}

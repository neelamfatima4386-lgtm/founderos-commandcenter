import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  useLeads,
  useProfiles,
  useUpsert,
  useRemove,
  logActivity,
} from "@/lib/data";
import {
  LEAD_PRIORITIES,
  LEAD_STAGES,
  type Lead,
  type LeadPriority,
  type LeadStage,
} from "@/lib/constants";
import { fmtDate } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  KpiCard,
  LoadingCards,
  PageHeader,
  SectionCard,
  StatusBadge,
  priorityTone,
} from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { LeadFormDialog } from "@/components/app/lead-form";

export const Route = createFileRoute("/_authenticated/leads/")({
  head: () => ({
    meta: [
      { title: "Leads — ElevateX Founder OS" },
      { name: "description", content: "Lead capture and CRM table for the ElevateX pipeline." },
      { property: "og:title", content: "Leads — ElevateX Founder OS" },
      { property: "og:description", content: "Lead capture and CRM table for the ElevateX pipeline." },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useLeads();
  const { data: profiles = [] } = useProfiles();
  const leadUpsert = useUpsert("leads");
  const leadRemove = useRemove("leads", "Lead deleted");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const hotCount = leads.filter((l) => l.priority === "hot").length;
  const warmCount = leads.filter((l) => l.priority === "warm").length;
  const wonCount = leads.filter((l) => l.stage === "won").length;
  const activeCount = leads.filter((l) => l.stage !== "won" && l.stage !== "lost").length;

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(lead: Lead) {
    setEditing(lead);
    setFormOpen(true);
  }

  async function changeStage(lead: Lead, stage: LeadStage) {
    await leadUpsert.mutateAsync({ id: lead.id, stage });
    if (user) {
      await logActivity({
        entity_type: "lead",
        entity_id: lead.id,
        action: "lead_stage_changed",
        description: `${profile?.full_name ?? "Someone"} moved ${lead.business_name} to ${LEAD_STAGES.find((s) => s.value === stage)?.label ?? stage}`,
      });
    }
  }

  async function changePriority(lead: Lead, priority: LeadPriority) {
    await leadUpsert.mutateAsync({ id: lead.id, priority });
  }

  async function deleteLead() {
    if (!deleteId) return;
    const lead = leads.find((l) => l.id === deleteId);
    await leadRemove.mutateAsync(deleteId);
    if (lead && user) {
      await logActivity({
        entity_type: "lead",
        entity_id: deleteId,
        action: "lead_deleted",
        description: `${profile?.full_name ?? "Someone"} deleted ${lead.business_name}`,
      });
    }
    setDeleteId(null);
  }

  const columns: Column<Lead>[] = [
    {
      key: "business_name",
      header: "Business",
      sortValue: (l) => l.business_name,
      render: (l) => (
        <div className="min-w-0">
          <button
            onClick={() => void navigate({ to: "/leads/$leadId", params: { leadId: l.id } })}
            className="truncate font-medium hover:text-primary"
          >
            {l.business_name}
          </button>
          {l.decision_maker && (
            <p className="truncate text-xs text-muted-foreground">{l.decision_maker}</p>
          )}
        </div>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      sortValue: (l) => l.industry ?? "",
      render: (l) => <span className="text-muted-foreground">{l.industry ?? "—"}</span>,
    },
    {
      key: "location",
      header: "Location",
      sortValue: (l) => l.location ?? "",
      render: (l) => <span className="text-muted-foreground">{l.location ?? "—"}</span>,
    },
    {
      key: "lead_score",
      header: "Score",
      sortValue: (l) => l.lead_score,
      render: (l) => <span className="font-medium tabular-nums">{l.lead_score}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      sortValue: (l) => l.priority,
      render: (l) => (
        <Select value={l.priority} onValueChange={(v) => changePriority(l, v as LeadPriority)}>
          <SelectTrigger className="w-[100px]" onClick={(e) => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortValue: (l) => l.stage,
      render: (l) => (
        <Select value={l.stage} onValueChange={(v) => changeStage(l, v as LeadStage)}>
          <SelectTrigger className="w-[130px]" onClick={(e) => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "assigned_to",
      header: "Assigned",
      sortValue: (l) => l.assigned_to ?? "",
      render: (l) => (
        <span className="text-muted-foreground">
          {profiles.find((p) => p.id === l.assigned_to)?.full_name ?? "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Added",
      sortValue: (l) => l.created_at,
      render: (l) => <span className="text-muted-foreground">{fmtDate(l.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (l) => (
        <div className="flex items-center justify-end gap-1">
          {l.website && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); window.open(`https://${l.website}`, "_blank"); }}
            >
              <ExternalLink className="size-3.5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(l); }}>
            <Pencil className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteId(l.id); }}>
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterDef[] = [
    {
      key: "priority",
      placeholder: "Priority",
      options: LEAD_PRIORITIES.map((p) => ({ value: p.value, label: p.label })),
      match: (row, value) => (row as Lead).priority === value,
    },
    {
      key: "stage",
      placeholder: "Stage",
      options: LEAD_STAGES.map((s) => ({ value: s.value, label: s.label })),
      match: (row, value) => (row as Lead).stage === value,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Leads"
        subtitle="Capture, qualify and advance every prospect."
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 size-4" /> Add Lead
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active leads" value={activeCount} icon={Users} onClick={() => void navigate({ to: "/pipeline" })} />
        <KpiCard label="Hot" value={hotCount} icon={Users} tone="warning" />
        <KpiCard label="Warm" value={warmCount} icon={Users} tone="info" />
        <KpiCard label="Won" value={wonCount} icon={Users} tone="success" />
      </div>

      <SectionCard title="Lead table" icon={Users} description={`${leads.length} leads`}>
        {isLoading ? (
          <LoadingCards cards={4} />
        ) : (
          <DataTable
            data={leads}
            columns={columns}
            searchKeys={(l) => `${l.business_name} ${l.industry ?? ""} ${l.location ?? ""} ${l.decision_maker ?? ""} ${l.email ?? ""} ${l.tags.join(" ")}`}
            filters={filters}
            onRowClick={(l) => void navigate({ to: "/leads/$leadId", params: { leadId: l.id } })}
            emptyState={
              <EmptyState
                icon={Users}
                title="No leads yet"
                description="Start building your pipeline by adding your first lead."
                action={<Button onClick={openAdd}><Plus className="mr-1.5 size-4" /> Add Lead</Button>}
              />
            }
          />
        )}
      </SectionCard>

      <LeadFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editing}
        profiles={profiles.map((p) => ({ id: p.id, full_name: p.full_name }))}
        currentUserId={user?.id}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete this lead?"
        description="This action cannot be undone. All related demos, outreach and follow-ups will also be removed."
        onConfirm={deleteLead}
      />
    </div>
  );
}

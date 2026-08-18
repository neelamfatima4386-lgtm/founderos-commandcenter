import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Kanban, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useLeads, useDemos, useOutreach, useFollowUps, useUpsert, logActivity } from "@/lib/data";
import { useAutomationSettings } from "@/lib/queries";
import { LEAD_STAGES, stageLabel, type Lead, type LeadStage } from "@/lib/constants";
import { fmtDate } from "@/lib/app-utils";
import { onLeadStageChanged, resolveSettings } from "@/lib/automation";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard, StatusBadge, priorityTone, EmptyState, LoadingRows } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — ElevateX Founder OS" },
      { name: "description", content: "Drag-and-drop lead pipeline kanban." },
      { property: "og:title", content: "Pipeline — ElevateX Founder OS" },
      { property: "og:description", content: "Drag-and-drop lead pipeline kanban." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useLeads();
  const { data: demos = [] } = useDemos();
  const { data: outreach = [] } = useOutreach();
  const { data: followUps = [] } = useFollowUps();
  const { data: settings } = useAutomationSettings(user?.id);
  const resolved = resolveSettings(settings ?? null);
  const leadUpsert = useUpsert("leads");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadStage;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;

    const oldStage = lead.stage;
    await leadUpsert.mutateAsync({ id: lead.id, stage: newStage });
    await onLeadStageChanged({
      lead,
      from: oldStage,
      to: newStage,
      actorId: user?.id,
      actorName: profile?.full_name,
      settings: resolved,
    });
    toast.success(`${lead.business_name} moved to ${stageLabel(newStage)}`);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Pipeline" subtitle="Loading…" />
        <LoadingRows rows={4} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Pipeline"
        subtitle="Drag leads between stages to update their status."
        actions={
          <Button size="sm" onClick={() => void navigate({ to: "/leads" })}>
            <Plus className="mr-1.5 size-4" /> Add Lead
          </Button>
        }
      />

      {leads.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="No leads in the pipeline"
          description="Add leads to start tracking them through your pipeline."
          action={<Button onClick={() => void navigate({ to: "/leads" })}>Go to leads</Button>}
        />
      ) : (
        <DndContext sensors={sensors} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-slim">
            {LEAD_STAGES.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage.value);
              return (
                <KanbanColumn
                  key={stage.value}
                  stage={stage.value}
                  label={stage.label}
                  leads={stageLeads}
                  demos={demos}
                  outreach={outreach}
                  followUps={followUps}
                  onLeadClick={(lead) => void navigate({ to: "/leads/$leadId", params: { leadId: lead.id } })}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeLead ? (
              <div className="clay-card w-64 rounded-xl p-3 opacity-90">
                <p className="truncate text-sm font-medium">{activeLead.business_name}</p>
                <p className="text-xs text-muted-foreground">{activeLead.industry ?? "—"}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function KanbanColumn({
  stage,
  label,
  leads,
  demos,
  outreach,
  followUps,
  onLeadClick,
}: {
  stage: LeadStage;
  label: string;
  leads: Lead[];
  demos: { lead_id: string; deploy_done: boolean; demo_ready: boolean }[];
  outreach: { lead_id: string; message_sent: boolean; replied_at: string | null; meeting_at: string | null }[];
  followUps: { lead_id: string; due_date: string; completed: boolean }[];
  onLeadClick: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex w-64 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
        <span className="rounded-full bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-xl border border-border/50 p-2 transition-colors min-h-[200px]",
          isOver && "border-primary/50 bg-primary/5",
        )}
      >
        {leads.length === 0 && (
          <div className="flex h-20 items-center justify-center text-xs text-muted-foreground/50">Drop here</div>
        )}
        {leads.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            demo={demos.find((d) => d.lead_id === lead.id)}
            outreachRec={outreach.find((o) => o.lead_id === lead.id)}
            nextFollowUp={followUps.filter((f) => f.lead_id === lead.id && !f.completed).sort((a, b) => a.due_date.localeCompare(b.due_date))[0]}
            onClick={() => onLeadClick(lead)}
          />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({
  lead,
  demo,
  outreachRec,
  nextFollowUp,
  onClick,
}: {
  lead: Lead;
  demo?: { deploy_done: boolean; demo_ready: boolean };
  outreachRec?: { message_sent: boolean; replied_at: string | null; meeting_at: string | null };
  nextFollowUp?: { due_date: string };
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (e.detail === 0) return;
        onClick();
      }}
      className={cn(
        "clay-card cursor-pointer rounded-xl p-3 transition-all",
        isDragging && "opacity-30",
      )}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium">{lead.business_name}</p>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">{lead.lead_score}</span>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <StatusBadge tone={priorityTone(lead.priority)}>{lead.priority}</StatusBadge>
        {demo?.deploy_done && <StatusBadge tone="success">Demo</StatusBadge>}
        {outreachRec?.message_sent && <StatusBadge tone="info">Sent</StatusBadge>}
        {outreachRec?.replied_at && <StatusBadge tone="success">Reply</StatusBadge>}
        {outreachRec?.meeting_at && <StatusBadge tone="primary">Meeting</StatusBadge>}
      </div>
      <p className="truncate text-xs text-muted-foreground">{lead.industry ?? "—"}</p>
      {nextFollowUp && (
        <p className="mt-1 text-xs text-warning">Follow-up: {fmtDate(nextFollowUp.due_date)}</p>
      )}
    </div>
  );
}

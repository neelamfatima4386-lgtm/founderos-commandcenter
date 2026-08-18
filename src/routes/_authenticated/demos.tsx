import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MonitorSmartphone, ExternalLink, Copy, Pencil, CircleCheck as CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useLeads, useDemos, useUpsert, logActivity } from "@/lib/data";
import type { Demo } from "@/lib/constants";
import { fmtDate } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  KpiCard,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";

export const Route = createFileRoute("/_authenticated/demos")({
  head: () => ({
    meta: [
      { title: "Demos — ElevateX Founder OS" },
      { name: "description", content: "Track demo builds, deployments and URLs." },
      { property: "og:title", content: "Demos — ElevateX Founder OS" },
      { property: "og:description", content: "Track demo builds, deployments and URLs." },
    ],
  }),
  component: DemosPage,
});

type DemoStatus = "not_started" | "prompt_ready" | "building" | "ready" | "deployed" | "revision" | "completed";

function demoStatus(demo?: Demo): DemoStatus {
  if (!demo) return "not_started";
  if (demo.demo_ready && demo.deploy_done) return "completed";
  if (demo.deploy_done) return "deployed";
  if (demo.demo_ready) return "ready";
  if (demo.build_done) return "building";
  if (demo.prompt_done) return "prompt_ready";
  return "not_started";
}

const STATUS_LABELS: Record<DemoStatus, string> = {
  not_started: "Not Started",
  prompt_ready: "Prompt Ready",
  building: "Building",
  ready: "Ready",
  deployed: "Deployed",
  revision: "Revision Required",
  completed: "Completed",
};

const STATUS_TONES: Record<DemoStatus, "neutral" | "info" | "warning" | "primary" | "success"> = {
  not_started: "neutral",
  prompt_ready: "info",
  building: "warning",
  ready: "primary",
  deployed: "primary",
  revision: "warning",
  completed: "success",
};

function DemosPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: demos = [], isLoading: demosLoading } = useDemos();
  const demoUpsert = useUpsert("demos");
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const isLoading = leadsLoading || demosLoading;

  function leadName(leadId: string) {
    return leads.find((l) => l.id === leadId)?.business_name ?? "Unknown";
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url);
    toast.success("URL copied");
  }

  async function toggleField(demo: Demo | undefined, leadId: string, field: string, value: boolean) {
    if (!demo) {
      await demoUpsert.mutateAsync({ lead_id: leadId, [field]: value });
    } else {
      const payload: Record<string, unknown> = { id: demo.id, [field]: value };
      if (field === "deploy_done" && value) payload.deployed_at = new Date().toISOString();
      await demoUpsert.mutateAsync(payload);
    }
    if (user) {
      await logActivity({
        entity_type: "demo",
        entity_id: leadId,
        action: "demo_updated",
        description: `${profile?.full_name ?? "Someone"} updated demo for ${leadName(leadId)}`,
      });
    }
  }

  const rows = leads.map((l) => ({
    lead: l,
    demo: demos.find((d) => d.lead_id === l.id),
  }));

  const readyCount = demos.filter((d) => d.demo_ready).length;
  const deployedCount = demos.filter((d) => d.deploy_done).length;
  const buildingCount = demos.filter((d) => d.build_done && !d.deploy_done).length;

  const columns: Column<typeof rows[number]>[] = [
    {
      key: "lead",
      header: "Lead",
      sortValue: (r) => r.lead.business_name,
      render: (r) => (
        <button
          onClick={() => void navigate({ to: "/leads/$leadId", params: { leadId: r.lead.id } })}
          className="truncate font-medium hover:text-primary"
        >
          {r.lead.business_name}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => demoStatus(r.demo),
      render: (r) => {
        const status = demoStatus(r.demo);
        return <StatusBadge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</StatusBadge>;
      },
    },
    {
      key: "lovable_url",
      header: "Lovable",
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.demo?.lovable_url ? (
            <>
              <a href={r.demo.lovable_url} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                {r.demo.lovable_url}
              </a>
              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); copyUrl(r.demo!.lovable_url!); }}>
                <Copy className="size-3" />
              </Button>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      key: "vercel_url",
      header: "Vercel",
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.demo?.vercel_url ? (
            <>
              <a href={r.demo.vercel_url} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                {r.demo.vercel_url}
              </a>
              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); copyUrl(r.demo!.vercel_url!); }}>
                <Copy className="size-3" />
              </Button>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      key: "demo_url",
      header: "Demo",
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.demo?.demo_url ? (
            <>
              <a href={r.demo.demo_url} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                {r.demo.demo_url}
              </a>
              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); copyUrl(r.demo!.demo_url!); }}>
                <Copy className="size-3" />
              </Button>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      key: "deployed_at",
      header: "Deployed",
      sortValue: (r) => r.demo?.deployed_at ?? "",
      render: (r) => <span className="text-muted-foreground">{r.demo?.deployed_at ? fmtDate(r.demo.deployed_at) : "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.demo?.demo_url && (
            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); window.open(r.demo!.demo_url!, "_blank"); }}>
              <ExternalLink className="size-3.5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingLeadId(r.lead.id); }}>
            <Pencil className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterDef[] = [
    {
      key: "status",
      placeholder: "Status",
      options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
      match: (row, value) => demoStatus((row as typeof rows[number]).demo) === value,
    },
  ];

  const editingRow = rows.find((r) => r.lead.id === editingLeadId);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Demos" subtitle="Track every demo build, deployment and URL." />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total demos" value={demos.length} icon={MonitorSmartphone} />
        <KpiCard label="Building" value={buildingCount} icon={MonitorSmartphone} tone="warning" />
        <KpiCard label="Ready" value={readyCount} icon={MonitorSmartphone} tone="primary" />
        <KpiCard label="Deployed" value={deployedCount} icon={MonitorSmartphone} tone="success" />
      </div>

      <SectionCard title="Demo tracker" icon={MonitorSmartphone} description={`${rows.length} leads`}>
        {isLoading ? (
          <LoadingRows rows={5} />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            searchKeys={(r) => r.lead.business_name}
            filters={filters}
            onRowClick={(r) => void navigate({ to: "/leads/$leadId", params: { leadId: r.lead.id } })}
            emptyState={
              <EmptyState
                icon={MonitorSmartphone}
                title="No demos yet"
                description="Demo records are created from the lead detail page."
                action={<Button onClick={() => void navigate({ to: "/leads" })}>Go to leads</Button>}
              />
            }
          />
        )}
      </SectionCard>

      <Dialog open={editingLeadId !== null} onOpenChange={(v) => !v && setEditingLeadId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit demo — {editingRow ? editingRow.lead.business_name : ""}</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <DemoEditForm
              demo={editingRow.demo}
              leadId={editingRow.lead.id}
              onToggle={toggleField}
              onSaveUrl={(field, value) => {
                if (editingRow.demo) {
                  demoUpsert.mutate({ id: editingRow.demo.id, [field]: value });
                } else {
                  demoUpsert.mutate({ lead_id: editingRow.lead.id, [field]: value });
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DemoEditForm({
  demo,
  leadId,
  onToggle,
  onSaveUrl,
}: {
  demo?: Demo;
  leadId: string;
  onToggle: (demo: Demo | undefined, leadId: string, field: string, value: boolean) => void;
  onSaveUrl: (field: string, value: string) => void;
}) {
  const [lovable, setLovable] = useState(demo?.lovable_url ?? "");
  const [vercel, setVercel] = useState(demo?.vercel_url ?? "");
  const [demoUrl, setDemoUrl] = useState(demo?.demo_url ?? "");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
          <Checkbox checked={demo?.research_done ?? false} onCheckedChange={(v) => onToggle(demo, leadId, "research_done", v as boolean)} />
          <span className="text-sm">Lead research</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
          <Checkbox checked={demo?.prompt_done ?? false} onCheckedChange={(v) => onToggle(demo, leadId, "prompt_done", v as boolean)} />
          <span className="text-sm">AI prompt</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
          <Checkbox checked={demo?.build_done ?? false} onCheckedChange={(v) => onToggle(demo, leadId, "build_done", v as boolean)} />
          <span className="text-sm">Lovable build</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
          <Checkbox checked={demo?.deploy_done ?? false} onCheckedChange={(v) => onToggle(demo, leadId, "deploy_done", v as boolean)} />
          <span className="text-sm">Vercel deploy</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
          <Checkbox checked={demo?.demo_ready ?? false} onCheckedChange={(v) => onToggle(demo, leadId, "demo_ready", v as boolean)} />
          <span className="text-sm">Demo ready</span>
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="mb-1.5 block text-xs">Lovable URL</Label>
          <div className="flex gap-1">
            <Input value={lovable} onChange={(e) => setLovable(e.target.value)} placeholder="https://lovable.dev/…" />
            <Button size="sm" variant="secondary" onClick={() => onSaveUrl("lovable_url", lovable)}>Save</Button>
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Vercel URL</Label>
          <div className="flex gap-1">
            <Input value={vercel} onChange={(e) => setVercel(e.target.value)} placeholder="https://….vercel.app" />
            <Button size="sm" variant="secondary" onClick={() => onSaveUrl("vercel_url", vercel)}>Save</Button>
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Demo URL</Label>
          <div className="flex gap-1">
            <Input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://demo.example.com" />
            <Button size="sm" variant="secondary" onClick={() => onSaveUrl("demo_url", demoUrl)}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

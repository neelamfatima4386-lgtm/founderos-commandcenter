import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEAD_PRIORITIES,
  LEAD_STAGES,
  type Lead,
  type LeadPriority,
  type LeadStage,
} from "@/lib/constants";
import { useUpsert } from "@/lib/data";

type LeadFormValues = {
  business_name: string;
  industry: string;
  location: string;
  website: string;
  instagram: string;
  linkedin: string;
  email: string;
  phone: string;
  decision_maker: string;
  lead_source: string;
  lead_score: number;
  priority: LeadPriority;
  stage: LeadStage;
  tags: string;
  notes: string;
  website_problems: string;
  opportunity: string;
  assigned_to: string | null;
};

const EMPTY: LeadFormValues = {
  business_name: "",
  industry: "",
  location: "",
  website: "",
  instagram: "",
  linkedin: "",
  email: "",
  phone: "",
  decision_maker: "",
  lead_source: "",
  lead_score: 50,
  priority: "warm",
  stage: "new",
  tags: "",
  notes: "",
  website_problems: "",
  opportunity: "",
  assigned_to: null,
};

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  profiles = [],
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead | null;
  profiles?: { id: string; full_name: string }[];
  currentUserId?: string;
}) {
  const upsert = useUpsert("leads", lead ? "Lead updated" : "Lead created");
  const [values, setValues] = useState<LeadFormValues>(
    lead
      ? {
          business_name: lead.business_name,
          industry: lead.industry ?? "",
          location: lead.location ?? "",
          website: lead.website ?? "",
          instagram: lead.instagram ?? "",
          linkedin: lead.linkedin ?? "",
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          decision_maker: lead.decision_maker ?? "",
          lead_source: lead.lead_source ?? "",
          lead_score: lead.lead_score,
          priority: lead.priority,
          stage: lead.stage,
          tags: lead.tags.join(", "),
          notes: lead.notes ?? "",
          website_problems: lead.website_problems ?? "",
          opportunity: lead.opportunity ?? "",
          assigned_to: lead.assigned_to ?? null,
        }
      : EMPTY,
  );

  function set<K extends keyof LeadFormValues>(key: K, val: LeadFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function save() {
    if (!values.business_name.trim()) return;
    const payload: Record<string, unknown> = {
      ...(lead ? { id: lead.id } : {}),
      business_name: values.business_name.trim(),
      industry: values.industry || null,
      location: values.location || null,
      website: values.website || null,
      instagram: values.instagram || null,
      linkedin: values.linkedin || null,
      email: values.email || null,
      phone: values.phone || null,
      decision_maker: values.decision_maker || null,
      lead_source: values.lead_source || null,
      lead_score: values.lead_score,
      priority: values.priority,
      stage: values.stage,
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: values.notes || null,
      website_problems: values.website_problems || null,
      opportunity: values.opportunity || null,
      assigned_to: values.assigned_to || null,
      ...(lead ? {} : { created_by: currentUserId ?? null }),
    };
    await upsert.mutateAsync(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Add Lead"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Business name" required>
            <Input value={values.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder="Acme Corp" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Industry">
              <Input value={values.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Fitness" />
            </Field>
            <Field label="Location">
              <Input value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="Dubai, UAE" />
            </Field>
            <Field label="Website">
              <Input value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="acme.com" />
            </Field>
            <Field label="Decision maker">
              <Input value={values.decision_maker} onChange={(e) => set("decision_maker", e.target.value)} placeholder="John Doe" />
            </Field>
            <Field label="Email">
              <Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="john@acme.com" />
            </Field>
            <Field label="Phone">
              <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+971 50 123 4567" />
            </Field>
            <Field label="Instagram">
              <Input value={values.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@acme" />
            </Field>
            <Field label="LinkedIn">
              <Input value={values.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="/company/acme" />
            </Field>
            <Field label="Lead source">
              <Input value={values.lead_source} onChange={(e) => set("lead_source", e.target.value)} placeholder="Instagram" />
            </Field>
            <Field label="Lead score (0–100)">
              <Input type="number" min={0} max={100} value={values.lead_score} onChange={(e) => set("lead_score", Number(e.target.value))} />
            </Field>
            <Field label="Priority">
              <Select value={values.priority} onValueChange={(v) => set("priority", v as LeadPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Stage">
              <Select value={values.stage} onValueChange={(v) => set("stage", v as LeadStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Assign to">
              <Select value={values.assigned_to ?? "unassigned"} onValueChange={(v) => set("assigned_to", v === "unassigned" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tags (comma separated)">
              <Input value={values.tags} onChange={(e) => set("tags", e.target.value)} placeholder="gulf, fitness" />
            </Field>
          </div>
          <Field label="Website problems">
            <Textarea value={values.website_problems} onChange={(e) => set("website_problems", e.target.value)} rows={2} placeholder="Slow load, no mobile layout" />
          </Field>
          <Field label="Opportunity">
            <Textarea value={values.opportunity} onChange={(e) => set("opportunity", e.target.value)} rows={2} placeholder="Rebuild as booking-first site" />
          </Field>
          <Field label="Notes">
            <Textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={upsert.isPending || !values.business_name.trim()}>
            {upsert.isPending ? "Saving…" : lead ? "Save changes" : "Create lead"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}{required && " *"}</Label>
      {children}
    </div>
  );
}

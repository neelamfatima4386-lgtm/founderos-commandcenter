import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

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
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Leads" subtitle="Capture, qualify and advance every prospect." />
      <SectionCard title="Lead table">
        <EmptyState title="Not built yet" description="The CRM table is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

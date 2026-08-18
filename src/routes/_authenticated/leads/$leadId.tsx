import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

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
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Lead detail" subtitle={`Lead ${leadId}`} />
      <SectionCard title="Lead workspace">
        <EmptyState title="Not built yet" description="This detail view is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

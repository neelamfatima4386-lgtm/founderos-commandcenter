import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/co-overview")({
  head: () => ({
    meta: [
      { title: "Co overview — ElevateX Founder OS" },
      { name: "description", content: "Co overview workspace inside ElevateX Founder OS." },
      { property: "og:title", content: "Co overview — ElevateX Founder OS" },
      { property: "og:description", content: "Co overview workspace inside ElevateX Founder OS." },
    ],
  }),
  component: CoOverviewPage,
});

function CoOverviewPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Co overview" subtitle="Coming up next in the build." />
      <SectionCard title="Co overview">
        <EmptyState title="Not built yet" description="This module is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — ElevateX Founder OS" },
      { name: "description", content: "Pipeline workspace inside ElevateX Founder OS." },
      { property: "og:title", content: "Pipeline — ElevateX Founder OS" },
      { property: "og:description", content: "Pipeline workspace inside ElevateX Founder OS." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Pipeline" subtitle="Coming up next in the build." />
      <SectionCard title="Pipeline">
        <EmptyState title="Not built yet" description="This module is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

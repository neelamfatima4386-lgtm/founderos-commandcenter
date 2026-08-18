import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/demos")({
  head: () => ({
    meta: [
      { title: "Demos — ElevateX Founder OS" },
      { name: "description", content: "Demos workspace inside ElevateX Founder OS." },
      { property: "og:title", content: "Demos — ElevateX Founder OS" },
      { property: "og:description", content: "Demos workspace inside ElevateX Founder OS." },
    ],
  }),
  component: DemosPage,
});

function DemosPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Demos" subtitle="Coming up next in the build." />
      <SectionCard title="Demos">
        <EmptyState title="Not built yet" description="This module is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

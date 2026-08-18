import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/my-tasks")({
  head: () => ({
    meta: [
      { title: "My tasks — ElevateX Founder OS" },
      { name: "description", content: "My tasks workspace inside ElevateX Founder OS." },
      { property: "og:title", content: "My tasks — ElevateX Founder OS" },
      { property: "og:description", content: "My tasks workspace inside ElevateX Founder OS." },
    ],
  }),
  component: MyTasksPage,
});

function MyTasksPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="My tasks" subtitle="Coming up next in the build." />
      <SectionCard title="My tasks">
        <EmptyState title="Not built yet" description="This module is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

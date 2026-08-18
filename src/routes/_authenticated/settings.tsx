import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ElevateX Founder OS" },
      { name: "description", content: "Settings workspace inside ElevateX Founder OS." },
      { property: "og:title", content: "Settings — ElevateX Founder OS" },
      { property: "og:description", content: "Settings workspace inside ElevateX Founder OS." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Settings" subtitle="Coming up next in the build." />
      <SectionCard title="Settings">
        <EmptyState title="Not built yet" description="This module is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

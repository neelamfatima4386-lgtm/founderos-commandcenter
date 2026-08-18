import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/social")({
  head: () => ({
    meta: [
      { title: "Social — ElevateX Founder OS" },
      { name: "description", content: "Social workspace inside ElevateX Founder OS." },
      { property: "og:title", content: "Social — ElevateX Founder OS" },
      { property: "og:description", content: "Social workspace inside ElevateX Founder OS." },
    ],
  }),
  component: SocialPage,
});

function SocialPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Social" subtitle="Coming up next in the build." />
      <SectionCard title="Social">
        <EmptyState title="Not built yet" description="This module is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

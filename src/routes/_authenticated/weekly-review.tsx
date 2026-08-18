import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmptyState } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/weekly-review")({
  head: () => ({
    meta: [
      { title: "Weekly review — ElevateX Founder OS" },
      { name: "description", content: "Weekly review workspace inside ElevateX Founder OS." },
      { property: "og:title", content: "Weekly review — ElevateX Founder OS" },
      { property: "og:description", content: "Weekly review workspace inside ElevateX Founder OS." },
    ],
  }),
  component: WeeklyReviewPage,
});

function WeeklyReviewPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Weekly review" subtitle="Coming up next in the build." />
      <SectionCard title="Weekly review">
        <EmptyState title="Not built yet" description="This module is scheduled for the next phase of the build." />
      </SectionCard>
    </div>
  );
}

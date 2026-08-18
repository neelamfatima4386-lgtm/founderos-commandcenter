import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Kanban, Send, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ElevateX Founder OS — Agency Operating Dashboard" },
      {
        name: "description",
        content:
          "Private operating system for the ElevateX agency: daily mission, lead pipeline, demos, outreach, tasks and co-founder collaboration in one command center.",
      },
      { property: "og:title", content: "ElevateX Founder OS" },
      {
        property: "og:description",
        content: "Know exactly what to work on, track every lead, and run your co-founder from one dashboard.",
      },
    ],
  }),
  component: Landing,
});

const HIGHLIGHTS = [
  { icon: Target, title: "Today's mission", body: "Leads, demos, deployments and outreach against daily targets." },
  { icon: Kanban, title: "Lead pipeline", body: "Discovery to closed, with demo and outreach state on every card." },
  { icon: Send, title: "Outreach CRM", body: "Messages, follow-ups, replies and meetings tracked per lead." },
];

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Zap className="size-3.5 text-primary" /> Internal agency operating system
        </span>
        <h1 className="mt-6 max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
          ElevateX <span className="text-gradient">Founder OS</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          One command center for daily execution, the lead pipeline, demo delivery, outreach and
          co-founder work. Open it in the morning and know exactly what to do next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            Enter Founder OS <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="clay-card rounded-2xl p-5">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary">
                <item.icon className="size-4" />
              </span>
              <h2 className="mt-4 text-sm font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

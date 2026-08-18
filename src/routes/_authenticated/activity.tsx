import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity as ActivityIcon, ListFilter as Filter } from "lucide-react";

import { useActivity, useProfiles } from "@/lib/data";
import { timeAgo, fmtDateTime } from "@/lib/app-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({
    meta: [
      { title: "Activity — ElevateX Founder OS" },
      { name: "description", content: "Full audit log of all actions across the system." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { data: activity = [], isLoading } = useActivity();
  const { data: profiles = [] } = useProfiles();
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const actionTypes = useMemo(() => {
    const set = new Set(activity.map((a) => a.action));
    return Array.from(set).sort();
  }, [activity]);

  const filtered = activity.filter((a) => {
    if (actionFilter !== "all" && a.action !== actionFilter) return false;
    if (userFilter !== "all" && a.actor_id !== userFilter) return false;
    return true;
  });

  function actorName(id: string | null) {
    if (!id) return "System";
    return profiles.find((p) => p.id === id)?.full_name ?? "Unknown";
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Activity" subtitle="Every important action, automatically tracked." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actionTypes.map((a) => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="User" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <SectionCard title="Audit log" icon={ActivityIcon} description={`${filtered.length} entries`}>
        {isLoading ? (
          <LoadingRows rows={8} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ActivityIcon} title="No activity yet" description="Actions across the system will appear here automatically." />
        ) : (
          <ul className="space-y-1">
            {filtered.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/20">
                <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{a.description ?? a.action}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{actorName(a.actor_id)}</span>
                    <span>·</span>
                    <span>{a.entity_type}</span>
                    <span>·</span>
                    <span>{timeAgo(a.created_at)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

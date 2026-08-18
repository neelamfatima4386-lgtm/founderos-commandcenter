import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, User, Target, Bell } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUpsert } from "@/lib/data";
import { useAutomationSettings } from "@/lib/queries";
import { resolveSettings } from "@/lib/automation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader, SectionCard } from "@/components/app/primitives";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ElevateX Founder OS" },
      { name: "description", content: "Manage your profile, daily targets and notification preferences." },
      { property: "og:title", content: "Settings — ElevateX Founder OS" },
      { property: "og:description", content: "Manage your profile, daily targets and notification preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { data: settings } = useAutomationSettings(user?.id);
  const resolved = resolveSettings(settings ?? null);
  const profileUpsert = useUpsert("profiles", "Profile updated");
  const settingsUpsert = useUpsert("automation_settings", "Settings saved");

  const [name, setName] = useState(profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [title, setTitle] = useState(profile?.title ?? "");

  const [targets, setTargets] = useState({
    leads_target: resolved.leads_target,
    demos_target: resolved.demos_target,
    deploys_target: resolved.deploys_target,
    outreach_target: resolved.outreach_target,
  });

  const [notify, setNotify] = useState({
    notify_task_reminders: resolved.notify_task_reminders,
    notify_followups: resolved.notify_followups,
    notify_content: resolved.notify_content,
    notify_team: resolved.notify_team,
  });

  async function saveProfile() {
    if (!user) return;
    await profileUpsert.mutateAsync({ id: user.id, full_name: name, avatar_url: avatarUrl || null, title: title || null });
    await refreshProfile();
  }

  async function saveTargets() {
    if (!user) return;
    await settingsUpsert.mutateAsync({
      ...(settings ? { id: settings.id } : {}),
      user_id: user.id,
      ...targets,
    });
  }

  async function saveNotify() {
    if (!user) return;
    await settingsUpsert.mutateAsync({
      ...(settings ? { id: settings.id } : {}),
      user_id: user.id,
      ...notify,
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your profile, targets and notifications." />

      <div className="space-y-5">
        {/* Profile */}
        <SectionCard title="Profile" icon={User} description="Your account information">
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block text-xs">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Email</Label>
              <Input value={profile?.email ?? ""} disabled className="text-muted-foreground" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Founder & CEO" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Avatar URL</Label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
            </div>
            <Button size="sm" onClick={saveProfile} disabled={profileUpsert.isPending}>Save profile</Button>
          </div>
        </SectionCard>

        {/* Daily Targets */}
        <SectionCard title="Daily targets" icon={Target} description="These feed your Overview and Daily Mission progress">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">Leads target</Label>
                <Input type="number" min={0} value={targets.leads_target} onChange={(e) => setTargets((p) => ({ ...p, leads_target: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Demos target</Label>
                <Input type="number" min={0} value={targets.demos_target} onChange={(e) => setTargets((p) => ({ ...p, demos_target: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Deploys target</Label>
                <Input type="number" min={0} value={targets.deploys_target} onChange={(e) => setTargets((p) => ({ ...p, deploys_target: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Outreach target</Label>
                <Input type="number" min={0} value={targets.outreach_target} onChange={(e) => setTargets((p) => ({ ...p, outreach_target: Number(e.target.value) }))} />
              </div>
            </div>
            <Button size="sm" onClick={saveTargets} disabled={settingsUpsert.isPending}>Save targets</Button>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={Bell} description="Control which alerts you receive">
          <div className="space-y-3">
            <ToggleRow
              label="Task reminders"
              description="Get notified about overdue and upcoming tasks"
              checked={notify.notify_task_reminders}
              onToggle={(v) => setNotify((p) => ({ ...p, notify_task_reminders: v }))}
            />
            <ToggleRow
              label="Follow-up reminders"
              description="Get notified when follow-ups are due"
              checked={notify.notify_followups}
              onToggle={(v) => setNotify((p) => ({ ...p, notify_followups: v }))}
            />
            <ToggleRow
              label="Content notifications"
              description="Get notified about content submissions and approvals"
              checked={notify.notify_content}
              onToggle={(v) => setNotify((p) => ({ ...p, notify_content: v }))}
            />
            <ToggleRow
              label="Team notifications"
              description="Get notified about team activity and assignments"
              checked={notify.notify_team}
              onToggle={(v) => setNotify((p) => ({ ...p, notify_team: v }))}
            />
            <Button size="sm" onClick={saveNotify} disabled={settingsUpsert.isPending}>Save notifications</Button>
          </div>
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance" icon={SettingsIcon} description="Theme settings">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark theme</p>
              <p className="text-xs text-muted-foreground">ElevateX Founder OS uses a premium dark theme.</p>
            </div>
            <Switch checked disabled />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onToggle }: { label: string; description: string; checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={(v) => onToggle(v as boolean)} />
    </div>
  );
}

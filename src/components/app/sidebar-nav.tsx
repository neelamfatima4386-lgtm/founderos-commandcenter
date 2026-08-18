import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  Send,
  Settings,
  Share2,
  Sparkles,
  StickyNote,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/lib/constants";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export const FOUNDER_NAV: NavItem[] = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/daily-mission", label: "Daily Mission", icon: Target },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: Kanban },
  { to: "/demos", label: "Demos", icon: MonitorSmartphone },
  { to: "/outreach", label: "Outreach", icon: Send },
  { to: "/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/content", label: "Content", icon: FileText },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/team", label: "Team", icon: Users },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/notes", label: "Notes", icon: StickyNote },
];

export const CO_FOUNDER_NAV: NavItem[] = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/my-tasks", label: "My Tasks", icon: ClipboardList },
  { to: "/social", label: "Social Activity", icon: Share2 },
  { to: "/content", label: "Content", icon: FileText },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/activity", label: "Activity", icon: Activity },
];

export const navForRole = (role: AppRole | null) =>
  role === "founder" ? FOUNDER_NAV : CO_FOUNDER_NAV;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { role, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = navForRole(role);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <Link
        to="/overview"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2.5 rounded-xl px-2 py-2"
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          <Zap className="size-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">ElevateX</span>
          <span className="block truncate text-[11px] text-muted-foreground">Founder OS</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-slim">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
              isActive(item.to)
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}

        {role === "founder" && (
          <Link
            to="/weekly-review"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
              isActive("/weekly-review")
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Sparkles className="size-4 shrink-0" />
            <span className="truncate">Weekly Review</span>
          </Link>
        )}
      </nav>

      <div className="mt-2 space-y-0.5 border-t border-sidebar-border pt-2">
        <Link
          to="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
            isActive("/settings")
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
          )}
        >
          <Settings className="size-4 shrink-0" />
          <span className="truncate">Settings</span>
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4 shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </div>
  );
}

import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { format } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/primitives";
import { initials, timeAgo } from "@/lib/app-utils";
import { useNotifications, useUpsert } from "@/lib/data";
import { GlobalSearch } from "@/components/app/global-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  const { profile, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const markRead = useUpsert("notifications");
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-sidebar p-0">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search leads, tasks, content, notes…</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 hidden text-xs text-muted-foreground xl:block">
              {format(new Date(), "EEE d MMM yyyy")}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="size-5" />
                  {unread.length > 0 && (
                    <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {unread.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    Nothing yet — you're all caught up.
                  </p>
                )}
                {notifications.slice(0, 8).map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex-col items-start gap-0.5"
                    onClick={() => {
                      if (!n.read) markRead.mutate({ id: n.id, read: true });
                      if (n.link) void navigate({ to: n.link });
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{n.title}</span>
                      {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-accent/60">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {initials(profile?.full_name)}
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-[9rem] truncate text-xs font-medium">
                      {profile?.full_name ?? "Account"}
                    </span>
                    <StatusBadge tone={role === "founder" ? "primary" : "info"} className="mt-0.5">
                      {role === "founder" ? "Founder" : "Co-Founder"}
                    </StatusBadge>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

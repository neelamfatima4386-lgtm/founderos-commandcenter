import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/lib/constants";

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isFounder: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();

  async function loadAccount(userId: string) {
    // Creates the profile + role on first sign-in and hands over sample data.
    const { data: bootstrapped } = await supabase.rpc("bootstrap_account", {
      _full_name: "",
    });
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile(prof ?? null);
    setRole((roles?.[0]?.role as AppRole | undefined) ?? (bootstrapped as AppRole) ?? null);
    void supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", userId);
  }

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRole(null);
        queryClient.clear();
        void router.invalidate();
        return;
      }
      if (nextSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void loadAccount(nextSession.user.id).finally(() => setLoading(false));
        if (event === "SIGNED_IN") {
          void router.invalidate();
          void queryClient.invalidateQueries();
        }
      }
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) await loadAccount(data.session.user.id);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    profile,
    role,
    loading,
    isFounder: role === "founder",
    refreshProfile: async () => {
      if (session?.user) await loadAccount(session.user.id);
    },
    signOut: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

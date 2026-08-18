import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — ElevateX Founder OS" },
      { name: "description", content: "Sign in to the ElevateX Founder OS command center." },
      { property: "og:title", content: "Sign in — ElevateX Founder OS" },
      { property: "og:description", content: "Private access for the ElevateX founder and co-founder." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/overview", replace: true });
  }, [session, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setPendingConfirm(true);
      return;
    }
    toast.success("Account created");
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) toast.error("Google sign-in failed");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 size-[34rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      />
      <div className="clay-card relative w-full max-w-md rounded-3xl p-7">
        <div className="mb-6 flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-xl text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Zap className="size-4.5" />
          </span>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">ElevateX Founder OS</h1>
            <p className="text-xs text-muted-foreground">Private access</p>
          </div>
        </div>

        {pendingConfirm ? (
          <div className="rounded-2xl border border-border bg-card/60 p-5 text-sm">
            <p className="font-medium">Check your email</p>
            <p className="mt-1 text-muted-foreground">
              We sent a confirmation link to {email}. Confirm it, then sign in.
            </p>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => setPendingConfirm(false)}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form className="space-y-4" onSubmit={signIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={signUp}>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password2">Password</Label>
                  <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">
                  The first account becomes the Founder. Later accounts join as Co-Founder.
                </p>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {!pendingConfirm && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" className="w-full" onClick={() => void google()} disabled={busy}>
              Continue with Google
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

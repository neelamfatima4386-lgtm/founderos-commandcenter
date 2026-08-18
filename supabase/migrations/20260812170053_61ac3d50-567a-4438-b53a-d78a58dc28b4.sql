CREATE TABLE public.automation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  auto_tasks_enabled boolean NOT NULL DEFAULT true,
  followup_1_days integer NOT NULL DEFAULT 3,
  followup_2_days integer NOT NULL DEFAULT 7,
  followup_3_days integer NOT NULL DEFAULT 14,
  stagnation_days integer NOT NULL DEFAULT 3,
  notify_task_reminders boolean NOT NULL DEFAULT true,
  notify_followups boolean NOT NULL DEFAULT true,
  notify_content boolean NOT NULL DEFAULT true,
  notify_team boolean NOT NULL DEFAULT true,
  leads_target integer NOT NULL DEFAULT 10,
  demos_target integer NOT NULL DEFAULT 8,
  deploys_target integer NOT NULL DEFAULT 8,
  outreach_target integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_settings TO authenticated;
GRANT ALL ON public.automation_settings TO service_role;

ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own automation settings select" ON public.automation_settings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own automation settings insert" ON public.automation_settings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own automation settings update" ON public.automation_settings
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_automation_settings_touch BEFORE UPDATE ON public.automation_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.automation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  automation text NOT NULL,
  trigger text NOT NULL,
  entity_type text,
  entity_id uuid,
  action text NOT NULL,
  result text NOT NULL DEFAULT 'success',
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.automation_log TO authenticated;
GRANT ALL ON public.automation_log TO service_role;

ALTER TABLE public.automation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation log select" ON public.automation_log
  FOR SELECT TO authenticated USING (public.is_founder() OR actor_id = auth.uid());
CREATE POLICY "automation log insert" ON public.automation_log
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

CREATE INDEX idx_automation_log_created ON public.automation_log (created_at DESC);
CREATE INDEX idx_leads_stage ON public.leads (stage);
CREATE INDEX idx_leads_assigned ON public.leads (assigned_to);
CREATE INDEX idx_tasks_assigned_status ON public.tasks (assigned_to, status);
CREATE INDEX idx_tasks_due ON public.tasks (due_at);
CREATE INDEX idx_follow_ups_due ON public.follow_ups (due_date, completed);
CREATE INDEX idx_content_status ON public.content (status);
CREATE INDEX idx_activity_logs_created ON public.activity_logs (created_at DESC);
CREATE INDEX idx_time_entries_user_started ON public.task_time_entries (user_id, started_at DESC);
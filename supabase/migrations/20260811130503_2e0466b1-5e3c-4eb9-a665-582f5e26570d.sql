
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('founder','co_founder');
CREATE TYPE public.lead_priority AS ENUM ('hot','warm','cold');
CREATE TYPE public.lead_stage AS ENUM ('new','analyzing','prompt_ready','demo_building','deployed','message_ready','contacted','follow_up','replied','meeting','won','lost');
CREATE TYPE public.task_status AS ENUM ('pending','in_progress','completed','blocked');
CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.recurrence_type AS ENUM ('none','daily','weekly','monthly','custom');
CREATE TYPE public.outreach_channel AS ENUM ('linkedin','instagram','whatsapp','email','x','other');
CREATE TYPE public.outreach_status AS ENUM ('not_contacted','contacted','follow_up_due','replied','no_response','meeting','won','lost');
CREATE TYPE public.content_status AS ENUM ('idea','draft','submitted','under_review','approved','rejected','scheduled','published');
CREATE TYPE public.content_platform AS ENUM ('linkedin','x','instagram','other');
CREATE TYPE public.content_kind AS ENUM ('post','carousel','reel','story','thread','educational','promotional','case_study','personal_brand');

-- SHARED updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT 'Team member',
  email text,
  avatar_url text,
  title text,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'founder');
$$;

CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles update own or founder" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_founder());

CREATE POLICY "roles readable own or founder" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_founder());

-- LEADS
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  industry text,
  location text,
  website text,
  instagram text,
  linkedin text,
  email text,
  phone text,
  decision_maker text,
  lead_source text,
  lead_score int NOT NULL DEFAULT 50,
  priority public.lead_priority NOT NULL DEFAULT 'warm',
  stage public.lead_stage NOT NULL DEFAULT 'new',
  tags text[] NOT NULL DEFAULT '{}',
  notes text,
  website_problems text,
  opportunity text,
  next_follow_up date,
  assigned_to uuid,
  created_by uuid,
  is_sample boolean NOT NULL DEFAULT false,
  sample_role public.app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_leads_touch BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.can_see_lead(_lead_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_founder() OR EXISTS (
    SELECT 1 FROM public.leads l WHERE l.id = _lead_id AND l.assigned_to = auth.uid()
  );
$$;

CREATE POLICY "leads select" ON public.leads FOR SELECT TO authenticated USING (public.is_founder() OR assigned_to = auth.uid());
CREATE POLICY "leads insert founder" ON public.leads FOR INSERT TO authenticated WITH CHECK (public.is_founder());
CREATE POLICY "leads update" ON public.leads FOR UPDATE TO authenticated USING (public.is_founder() OR assigned_to = auth.uid());
CREATE POLICY "leads delete founder" ON public.leads FOR DELETE TO authenticated USING (public.is_founder());

-- DEMOS
CREATE TABLE public.demos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  research_done boolean NOT NULL DEFAULT false,
  prompt_done boolean NOT NULL DEFAULT false,
  build_done boolean NOT NULL DEFAULT false,
  deploy_done boolean NOT NULL DEFAULT false,
  demo_ready boolean NOT NULL DEFAULT false,
  lovable_url text,
  vercel_url text,
  demo_url text,
  deployed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demos TO authenticated;
GRANT ALL ON public.demos TO service_role;
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_demos_touch BEFORE UPDATE ON public.demos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "demos select" ON public.demos FOR SELECT TO authenticated USING (public.can_see_lead(lead_id));
CREATE POLICY "demos write founder" ON public.demos FOR INSERT TO authenticated WITH CHECK (public.is_founder());
CREATE POLICY "demos update founder" ON public.demos FOR UPDATE TO authenticated USING (public.is_founder());
CREATE POLICY "demos delete founder" ON public.demos FOR DELETE TO authenticated USING (public.is_founder());

-- OUTREACH
CREATE TABLE public.outreach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  message text,
  channel public.outreach_channel NOT NULL DEFAULT 'linkedin',
  status public.outreach_status NOT NULL DEFAULT 'not_contacted',
  message_ready boolean NOT NULL DEFAULT false,
  message_sent boolean NOT NULL DEFAULT false,
  first_contact_at timestamptz,
  followup_1_at timestamptz,
  followup_2_at timestamptz,
  followup_3_at timestamptz,
  replied_at timestamptz,
  meeting_at timestamptz,
  next_follow_up date,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outreach TO authenticated;
GRANT ALL ON public.outreach TO service_role;
ALTER TABLE public.outreach ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_outreach_touch BEFORE UPDATE ON public.outreach FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "outreach select" ON public.outreach FOR SELECT TO authenticated USING (public.can_see_lead(lead_id));
CREATE POLICY "outreach insert founder" ON public.outreach FOR INSERT TO authenticated WITH CHECK (public.is_founder());
CREATE POLICY "outreach update founder" ON public.outreach FOR UPDATE TO authenticated USING (public.is_founder());
CREATE POLICY "outreach delete founder" ON public.outreach FOR DELETE TO authenticated USING (public.is_founder());

-- FOLLOW UPS
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  channel public.outreach_channel NOT NULL DEFAULT 'linkedin',
  due_date date NOT NULL DEFAULT current_date,
  note text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_follow_ups_touch BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "follow_ups select" ON public.follow_ups FOR SELECT TO authenticated USING (public.can_see_lead(lead_id));
CREATE POLICY "follow_ups insert founder" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (public.is_founder());
CREATE POLICY "follow_ups update founder" ON public.follow_ups FOR UPDATE TO authenticated USING (public.is_founder());
CREATE POLICY "follow_ups delete founder" ON public.follow_ups FOR DELETE TO authenticated USING (public.is_founder());

-- LEAD NOTES
CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_notes TO authenticated;
GRANT ALL ON public.lead_notes TO service_role;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lead_notes_touch BEFORE UPDATE ON public.lead_notes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "lead_notes select" ON public.lead_notes FOR SELECT TO authenticated USING (public.can_see_lead(lead_id));
CREATE POLICY "lead_notes insert" ON public.lead_notes FOR INSERT TO authenticated WITH CHECK (public.can_see_lead(lead_id) AND author_id = auth.uid());
CREATE POLICY "lead_notes update own" ON public.lead_notes FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.is_founder());
CREATE POLICY "lead_notes delete own" ON public.lead_notes FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_founder());

-- LEAD ACTIVITIES
CREATE TABLE public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_activities select" ON public.lead_activities FOR SELECT TO authenticated USING (public.can_see_lead(lead_id));
CREATE POLICY "lead_activities insert" ON public.lead_activities FOR INSERT TO authenticated WITH CHECK (public.can_see_lead(lead_id));

-- TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  status public.task_status NOT NULL DEFAULT 'pending',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_at timestamptz,
  recurrence public.recurrence_type NOT NULL DEFAULT 'none',
  recurrence_detail text,
  daily_target int,
  notes text,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  assigned_to uuid,
  created_by uuid,
  completed_at timestamptz,
  is_sample boolean NOT NULL DEFAULT false,
  sample_role public.app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tasks_touch BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.can_see_task(_task_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_founder() OR EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = _task_id AND (t.assigned_to = auth.uid() OR t.created_by = auth.uid())
  );
$$;

CREATE POLICY "tasks select" ON public.tasks FOR SELECT TO authenticated USING (public.is_founder() OR assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "tasks insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.is_founder() OR (created_by = auth.uid() AND assigned_to = auth.uid()));
CREATE POLICY "tasks update" ON public.tasks FOR UPDATE TO authenticated USING (public.is_founder() OR assigned_to = auth.uid());
CREATE POLICY "tasks delete" ON public.tasks FOR DELETE TO authenticated USING (public.is_founder() OR created_by = auth.uid());

-- SUBTASKS
CREATE TABLE public.task_subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_subtasks TO authenticated;
GRANT ALL ON public.task_subtasks TO service_role;
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_subtasks_touch BEFORE UPDATE ON public.task_subtasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "subtasks all" ON public.task_subtasks FOR ALL TO authenticated USING (public.can_see_task(task_id)) WITH CHECK (public.can_see_task(task_id));

-- TIME ENTRIES
CREATE TABLE public.task_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  seconds int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_time_entries TO authenticated;
GRANT ALL ON public.task_time_entries TO service_role;
ALTER TABLE public.task_time_entries ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_time_touch BEFORE UPDATE ON public.task_time_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "time select" ON public.task_time_entries FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_founder());
CREATE POLICY "time insert own" ON public.task_time_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "time update own" ON public.task_time_entries FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "time delete own" ON public.task_time_entries FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_founder());

-- CONTENT
CREATE TABLE public.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform public.content_platform NOT NULL DEFAULT 'linkedin',
  content_type public.content_kind NOT NULL DEFAULT 'post',
  idea text,
  draft text,
  caption text,
  hashtags text,
  media_url text,
  status public.content_status NOT NULL DEFAULT 'idea',
  scheduled_at timestamptz,
  founder_feedback text,
  author_id uuid,
  is_sample boolean NOT NULL DEFAULT false,
  sample_role public.app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content TO authenticated;
GRANT ALL ON public.content TO service_role;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_content_touch BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "content select" ON public.content FOR SELECT TO authenticated USING (public.is_founder() OR author_id = auth.uid());
CREATE POLICY "content insert" ON public.content FOR INSERT TO authenticated WITH CHECK (public.is_founder() OR author_id = auth.uid());
CREATE POLICY "content update" ON public.content FOR UPDATE TO authenticated USING (public.is_founder() OR author_id = auth.uid());
CREATE POLICY "content delete" ON public.content FOR DELETE TO authenticated USING (public.is_founder() OR author_id = auth.uid());

CREATE OR REPLACE FUNCTION public.can_see_content(_content_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_founder() OR EXISTS (
    SELECT 1 FROM public.content c WHERE c.id = _content_id AND c.author_id = auth.uid()
  );
$$;

CREATE TABLE public.content_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  author_id uuid,
  action text NOT NULL DEFAULT 'comment',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_feedback TO authenticated;
GRANT ALL ON public.content_feedback TO service_role;
ALTER TABLE public.content_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_feedback select" ON public.content_feedback FOR SELECT TO authenticated USING (public.can_see_content(content_id));
CREATE POLICY "content_feedback insert founder" ON public.content_feedback FOR INSERT TO authenticated WITH CHECK (public.is_founder() AND author_id = auth.uid());

CREATE TABLE public.content_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  platform public.content_platform NOT NULL DEFAULT 'linkedin',
  published boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_schedule TO authenticated;
GRANT ALL ON public.content_schedule TO service_role;
ALTER TABLE public.content_schedule ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_content_schedule_touch BEFORE UPDATE ON public.content_schedule FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "content_schedule select" ON public.content_schedule FOR SELECT TO authenticated USING (public.can_see_content(content_id));
CREATE POLICY "content_schedule write founder" ON public.content_schedule FOR ALL TO authenticated USING (public.is_founder()) WITH CHECK (public.is_founder());

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  is_sample boolean NOT NULL DEFAULT false,
  sample_role public.app_role,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications select own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_founder());
CREATE POLICY "notifications update own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications delete own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- CALENDAR EVENTS
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_type text NOT NULL DEFAULT 'meeting',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  notes text,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  content_id uuid REFERENCES public.content(id) ON DELETE SET NULL,
  owner_id uuid,
  is_sample boolean NOT NULL DEFAULT false,
  sample_role public.app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_calendar_touch BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "calendar select" ON public.calendar_events FOR SELECT TO authenticated USING (public.is_founder() OR owner_id = auth.uid());
CREATE POLICY "calendar insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.is_founder() OR owner_id = auth.uid());
CREATE POLICY "calendar update" ON public.calendar_events FOR UPDATE TO authenticated USING (public.is_founder() OR owner_id = auth.uid());
CREATE POLICY "calendar delete" ON public.calendar_events FOR DELETE TO authenticated USING (public.is_founder() OR owner_id = auth.uid());

-- NOTES
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled note',
  body text,
  tags text[] NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  author_id uuid,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  content_id uuid REFERENCES public.content(id) ON DELETE SET NULL,
  is_sample boolean NOT NULL DEFAULT false,
  sample_role public.app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_notes_touch BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "notes select own" ON public.notes FOR SELECT TO authenticated USING (author_id = auth.uid() OR public.is_founder());
CREATE POLICY "notes insert own" ON public.notes FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "notes update own" ON public.notes FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "notes delete own" ON public.notes FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  description text,
  is_sample boolean NOT NULL DEFAULT false,
  sample_role public.app_role,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity select" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_founder() OR actor_id = auth.uid());
CREATE POLICY "activity insert own" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- DAILY GOALS
CREATE TABLE public.daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_date date NOT NULL DEFAULT current_date,
  leads_target int NOT NULL DEFAULT 10,
  demos_target int NOT NULL DEFAULT 8,
  deploys_target int NOT NULL DEFAULT 8,
  outreach_target int NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, goal_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_goals TO authenticated;
GRANT ALL ON public.daily_goals TO service_role;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_goals_touch BEFORE UPDATE ON public.daily_goals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "goals select" ON public.daily_goals FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_founder());
CREATE POLICY "goals insert own" ON public.daily_goals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "goals update own" ON public.daily_goals FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- WEEKLY REVIEWS
CREATE TABLE public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_reviews_touch BEFORE UPDATE ON public.weekly_reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "reviews founder only" ON public.weekly_reviews FOR ALL TO authenticated USING (public.is_founder() AND user_id = auth.uid()) WITH CHECK (public.is_founder() AND user_id = auth.uid());

-- BOOTSTRAP: profile + role + sample data claim
CREATE OR REPLACE FUNCTION public.bootstrap_account(_full_name text DEFAULT NULL)
RETURNS public.app_role LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _role public.app_role;
  _email text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT email INTO _email FROM auth.users WHERE id = _uid;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (_uid, COALESCE(NULLIF(_full_name,''), split_part(COALESCE(_email,'Team member'),'@',1)), _email)
  ON CONFLICT (id) DO UPDATE SET last_active_at = now(),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name,''), public.profiles.full_name);

  SELECT role INTO _role FROM public.user_roles WHERE user_id = _uid LIMIT 1;
  IF _role IS NULL THEN
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'founder') THEN
      _role := 'co_founder';
    ELSE
      _role := 'founder';
    END IF;
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _role) ON CONFLICT DO NOTHING;
  END IF;

  UPDATE public.leads SET assigned_to = _uid, created_by = COALESCE(created_by, _uid)
    WHERE is_sample AND assigned_to IS NULL AND sample_role = _role;
  UPDATE public.tasks SET assigned_to = _uid, created_by = COALESCE(created_by, _uid)
    WHERE is_sample AND assigned_to IS NULL AND sample_role = _role;
  UPDATE public.content SET author_id = _uid WHERE is_sample AND author_id IS NULL AND sample_role = _role;
  UPDATE public.notifications SET user_id = _uid WHERE is_sample AND user_id IS NULL AND sample_role = _role;
  UPDATE public.calendar_events SET owner_id = _uid WHERE is_sample AND owner_id IS NULL AND sample_role = _role;
  UPDATE public.notes SET author_id = _uid WHERE is_sample AND author_id IS NULL AND sample_role = _role;
  UPDATE public.activity_logs SET actor_id = _uid WHERE is_sample AND actor_id IS NULL AND sample_role = _role;
  UPDATE public.follow_ups SET created_by = _uid WHERE created_by IS NULL AND _role = 'founder';
  UPDATE public.lead_notes SET author_id = _uid WHERE author_id IS NULL AND _role = 'founder';

  INSERT INTO public.daily_goals (user_id, goal_date) VALUES (_uid, current_date)
  ON CONFLICT (user_id, goal_date) DO NOTHING;

  RETURN _role;
END; $$;

REVOKE ALL ON FUNCTION public.bootstrap_account(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_account(text) TO authenticated;

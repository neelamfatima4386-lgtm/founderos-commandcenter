export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          is_sample: boolean
          sample_role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          is_sample?: boolean
          sample_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          is_sample?: boolean
          sample_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      automation_log: {
        Row: {
          action: string
          actor_id: string | null
          automation: string
          created_at: string
          detail: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          result: string
          trigger: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          automation: string
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          result?: string
          trigger: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          automation?: string
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          result?: string
          trigger?: string
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          auto_tasks_enabled: boolean
          created_at: string
          demos_target: number
          deploys_target: number
          followup_1_days: number
          followup_2_days: number
          followup_3_days: number
          id: string
          leads_target: number
          notify_content: boolean
          notify_followups: boolean
          notify_task_reminders: boolean
          notify_team: boolean
          outreach_target: number
          stagnation_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_tasks_enabled?: boolean
          created_at?: string
          demos_target?: number
          deploys_target?: number
          followup_1_days?: number
          followup_2_days?: number
          followup_3_days?: number
          id?: string
          leads_target?: number
          notify_content?: boolean
          notify_followups?: boolean
          notify_task_reminders?: boolean
          notify_team?: boolean
          outreach_target?: number
          stagnation_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_tasks_enabled?: boolean
          created_at?: string
          demos_target?: number
          deploys_target?: number
          followup_1_days?: number
          followup_2_days?: number
          followup_3_days?: number
          id?: string
          leads_target?: number
          notify_content?: boolean
          notify_followups?: boolean
          notify_task_reminders?: boolean
          notify_team?: boolean
          outreach_target?: number
          stagnation_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          content_id: string | null
          created_at: string
          ends_at: string | null
          event_type: string
          id: string
          is_sample: boolean
          lead_id: string | null
          notes: string | null
          owner_id: string | null
          sample_role: Database["public"]["Enums"]["app_role"] | null
          starts_at: string
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          ends_at?: string | null
          event_type?: string
          id?: string
          is_sample?: boolean
          lead_id?: string | null
          notes?: string | null
          owner_id?: string | null
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          starts_at: string
          task_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          ends_at?: string | null
          event_type?: string
          id?: string
          is_sample?: boolean
          lead_id?: string | null
          notes?: string | null
          owner_id?: string | null
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          starts_at?: string
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          author_id: string | null
          caption: string | null
          content_type: Database["public"]["Enums"]["content_kind"]
          created_at: string
          draft: string | null
          founder_feedback: string | null
          hashtags: string | null
          id: string
          idea: string | null
          is_sample: boolean
          media_url: string | null
          platform: Database["public"]["Enums"]["content_platform"]
          sample_role: Database["public"]["Enums"]["app_role"] | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          caption?: string | null
          content_type?: Database["public"]["Enums"]["content_kind"]
          created_at?: string
          draft?: string | null
          founder_feedback?: string | null
          hashtags?: string | null
          id?: string
          idea?: string | null
          is_sample?: boolean
          media_url?: string | null
          platform?: Database["public"]["Enums"]["content_platform"]
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          caption?: string | null
          content_type?: Database["public"]["Enums"]["content_kind"]
          created_at?: string
          draft?: string | null
          founder_feedback?: string | null
          hashtags?: string | null
          id?: string
          idea?: string | null
          is_sample?: boolean
          media_url?: string | null
          platform?: Database["public"]["Enums"]["content_platform"]
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_feedback: {
        Row: {
          action: string
          author_id: string | null
          body: string
          content_id: string
          created_at: string
          id: string
        }
        Insert: {
          action?: string
          author_id?: string | null
          body: string
          content_id: string
          created_at?: string
          id?: string
        }
        Update: {
          action?: string
          author_id?: string | null
          body?: string
          content_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_feedback_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_schedule: {
        Row: {
          content_id: string
          created_at: string
          created_by: string | null
          id: string
          platform: Database["public"]["Enums"]["content_platform"]
          published: boolean
          scheduled_at: string
          updated_at: string
        }
        Insert: {
          content_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["content_platform"]
          published?: boolean
          scheduled_at: string
          updated_at?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["content_platform"]
          published?: boolean
          scheduled_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_schedule_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_goals: {
        Row: {
          created_at: string
          demos_target: number
          deploys_target: number
          goal_date: string
          id: string
          leads_target: number
          outreach_target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          demos_target?: number
          deploys_target?: number
          goal_date?: string
          id?: string
          leads_target?: number
          outreach_target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          demos_target?: number
          deploys_target?: number
          goal_date?: string
          id?: string
          leads_target?: number
          outreach_target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demos: {
        Row: {
          build_done: boolean
          created_at: string
          demo_ready: boolean
          demo_url: string | null
          deploy_done: boolean
          deployed_at: string | null
          id: string
          lead_id: string
          lovable_url: string | null
          prompt_done: boolean
          research_done: boolean
          updated_at: string
          vercel_url: string | null
        }
        Insert: {
          build_done?: boolean
          created_at?: string
          demo_ready?: boolean
          demo_url?: string | null
          deploy_done?: boolean
          deployed_at?: string | null
          id?: string
          lead_id: string
          lovable_url?: string | null
          prompt_done?: boolean
          research_done?: boolean
          updated_at?: string
          vercel_url?: string | null
        }
        Update: {
          build_done?: boolean
          created_at?: string
          demo_ready?: boolean
          demo_url?: string | null
          deploy_done?: boolean
          deployed_at?: string | null
          id?: string
          lead_id?: string
          lovable_url?: string | null
          prompt_done?: boolean
          research_done?: boolean
          updated_at?: string
          vercel_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          channel: Database["public"]["Enums"]["outreach_channel"]
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          lead_id: string
          note: string | null
          updated_at: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["outreach_channel"]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          lead_id: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["outreach_channel"]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          lead_id?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: string | null
          id: string
          lead_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          lead_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          lead_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          lead_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          business_name: string
          created_at: string
          created_by: string | null
          decision_maker: string | null
          email: string | null
          id: string
          industry: string | null
          instagram: string | null
          is_sample: boolean
          lead_score: number
          lead_source: string | null
          linkedin: string | null
          location: string | null
          next_follow_up: string | null
          notes: string | null
          opportunity: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"]
          sample_role: Database["public"]["Enums"]["app_role"] | null
          stage: Database["public"]["Enums"]["lead_stage"]
          tags: string[]
          updated_at: string
          website: string | null
          website_problems: string | null
        }
        Insert: {
          assigned_to?: string | null
          business_name: string
          created_at?: string
          created_by?: string | null
          decision_maker?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          is_sample?: boolean
          lead_score?: number
          lead_source?: string | null
          linkedin?: string | null
          location?: string | null
          next_follow_up?: string | null
          notes?: string | null
          opportunity?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          tags?: string[]
          updated_at?: string
          website?: string | null
          website_problems?: string | null
        }
        Update: {
          assigned_to?: string | null
          business_name?: string
          created_at?: string
          created_by?: string | null
          decision_maker?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          is_sample?: boolean
          lead_score?: number
          lead_source?: string | null
          linkedin?: string | null
          location?: string | null
          next_follow_up?: string | null
          notes?: string | null
          opportunity?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          tags?: string[]
          updated_at?: string
          website?: string | null
          website_problems?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          author_id: string | null
          body: string | null
          content_id: string | null
          created_at: string
          id: string
          is_sample: boolean
          lead_id: string | null
          pinned: boolean
          sample_role: Database["public"]["Enums"]["app_role"] | null
          tags: string[]
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          lead_id?: string | null
          pinned?: boolean
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          tags?: string[]
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          lead_id?: string | null
          pinned?: boolean
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          tags?: string[]
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_sample: boolean
          link: string | null
          read: boolean
          sample_role: Database["public"]["Enums"]["app_role"] | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          link?: string | null
          read?: boolean
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          link?: string | null
          read?: boolean
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      outreach: {
        Row: {
          channel: Database["public"]["Enums"]["outreach_channel"]
          created_at: string
          first_contact_at: string | null
          followup_1_at: string | null
          followup_2_at: string | null
          followup_3_at: string | null
          id: string
          lead_id: string
          meeting_at: string | null
          message: string | null
          message_ready: boolean
          message_sent: boolean
          next_follow_up: string | null
          outcome: string | null
          replied_at: string | null
          status: Database["public"]["Enums"]["outreach_status"]
          updated_at: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["outreach_channel"]
          created_at?: string
          first_contact_at?: string | null
          followup_1_at?: string | null
          followup_2_at?: string | null
          followup_3_at?: string | null
          id?: string
          lead_id: string
          meeting_at?: string | null
          message?: string | null
          message_ready?: boolean
          message_sent?: boolean
          next_follow_up?: string | null
          outcome?: string | null
          replied_at?: string | null
          status?: Database["public"]["Enums"]["outreach_status"]
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["outreach_channel"]
          created_at?: string
          first_contact_at?: string | null
          followup_1_at?: string | null
          followup_2_at?: string | null
          followup_3_at?: string | null
          id?: string
          lead_id?: string
          meeting_at?: string | null
          message?: string | null
          message_ready?: boolean
          message_sent?: boolean
          next_follow_up?: string | null
          outcome?: string | null
          replied_at?: string | null
          status?: Database["public"]["Enums"]["outreach_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          last_active_at: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          last_active_at?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          last_active_at?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      task_subtasks: {
        Row: {
          created_at: string
          done: boolean
          id: string
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_entries: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          lead_id: string | null
          seconds: number
          started_at: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          seconds?: number
          started_at?: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          seconds?: number
          started_at?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_entries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          daily_target: number | null
          description: string | null
          due_at: string | null
          id: string
          is_sample: boolean
          lead_id: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          recurrence: Database["public"]["Enums"]["recurrence_type"]
          recurrence_detail: string | null
          sample_role: Database["public"]["Enums"]["app_role"] | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          daily_target?: number | null
          description?: string | null
          due_at?: string | null
          id?: string
          is_sample?: boolean
          lead_id?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          recurrence_detail?: string | null
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          daily_target?: number | null
          description?: string | null
          due_at?: string | null
          id?: string
          is_sample?: boolean
          lead_id?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          recurrence_detail?: string | null
          sample_role?: Database["public"]["Enums"]["app_role"] | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_account: {
        Args: { _full_name?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      can_see_content: { Args: { _content_id: string }; Returns: boolean }
      can_see_lead: { Args: { _lead_id: string }; Returns: boolean }
      can_see_task: { Args: { _task_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_founder: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "founder" | "co_founder"
      content_kind:
        | "post"
        | "carousel"
        | "reel"
        | "story"
        | "thread"
        | "educational"
        | "promotional"
        | "case_study"
        | "personal_brand"
      content_platform: "linkedin" | "x" | "instagram" | "other"
      content_status:
        | "idea"
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "scheduled"
        | "published"
      lead_priority: "hot" | "warm" | "cold"
      lead_stage:
        | "new"
        | "analyzing"
        | "prompt_ready"
        | "demo_building"
        | "deployed"
        | "message_ready"
        | "contacted"
        | "follow_up"
        | "replied"
        | "meeting"
        | "won"
        | "lost"
      outreach_channel:
        | "linkedin"
        | "instagram"
        | "whatsapp"
        | "email"
        | "x"
        | "other"
      outreach_status:
        | "not_contacted"
        | "contacted"
        | "follow_up_due"
        | "replied"
        | "no_response"
        | "meeting"
        | "won"
        | "lost"
      recurrence_type: "none" | "daily" | "weekly" | "monthly" | "custom"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "blocked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["founder", "co_founder"],
      content_kind: [
        "post",
        "carousel",
        "reel",
        "story",
        "thread",
        "educational",
        "promotional",
        "case_study",
        "personal_brand",
      ],
      content_platform: ["linkedin", "x", "instagram", "other"],
      content_status: [
        "idea",
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "scheduled",
        "published",
      ],
      lead_priority: ["hot", "warm", "cold"],
      lead_stage: [
        "new",
        "analyzing",
        "prompt_ready",
        "demo_building",
        "deployed",
        "message_ready",
        "contacted",
        "follow_up",
        "replied",
        "meeting",
        "won",
        "lost",
      ],
      outreach_channel: [
        "linkedin",
        "instagram",
        "whatsapp",
        "email",
        "x",
        "other",
      ],
      outreach_status: [
        "not_contacted",
        "contacted",
        "follow_up_due",
        "replied",
        "no_response",
        "meeting",
        "won",
        "lost",
      ],
      recurrence_type: ["none", "daily", "weekly", "monthly", "custom"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "blocked"],
    },
  },
} as const

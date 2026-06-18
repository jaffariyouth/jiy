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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience_gender: string
          audience_max_age: number | null
          audience_min_age: number | null
          audience_visibility: string
          body_md: string
          created_at: string
          created_by: string | null
          id: string
          pinned: boolean
          published_at: string | null
          status: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at: string
        }
        Insert: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          body_md?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pinned?: boolean
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at?: string
        }
        Update: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          body_md?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pinned?: boolean
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
          updated_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
      event_payments: {
        Row: {
          created_at: string
          currency: string
          event_id: string
          id: string
          price_cents: number
          requires_payment: boolean
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          event_id: string
          id?: string
          price_cents?: number
          requires_payment?: boolean
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          event_id?: string
          id?: string
          price_cents?: number
          requires_payment?: boolean
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_public_registrations: {
        Row: {
          amount_cents: number
          confirmed_at: string | null
          created_at: string
          currency: string
          email: string
          event_id: string
          full_name: string
          id: string
          quantity: number
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          email: string
          event_id: string
          full_name: string
          id?: string
          quantity?: number
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          quantity?: number
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_public_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          cancelled_at: string | null
          check_in_status: Database["public"]["Enums"]["check_in_status"]
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          notes: string | null
          registered_at: string
          updated_at: string
          user_id: string
          volunteer_shift_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          check_in_status?: Database["public"]["Enums"]["check_in_status"]
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          notes?: string | null
          registered_at?: string
          updated_at?: string
          user_id: string
          volunteer_shift_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          check_in_status?: Database["public"]["Enums"]["check_in_status"]
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          notes?: string | null
          registered_at?: string
          updated_at?: string
          user_id?: string
          volunteer_shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ticket_orders: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          event_id: string
          id: string
          paid_at: string | null
          registration_id: string | null
          status: Database["public"]["Enums"]["ticket_order_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          event_id: string
          id?: string
          paid_at?: string | null
          registration_id?: string | null
          status?: Database["public"]["Enums"]["ticket_order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          event_id?: string
          id?: string
          paid_at?: string | null
          registration_id?: string | null
          status?: Database["public"]["Enums"]["ticket_order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_ticket_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_ticket_orders_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_ticket_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          audience_gender: string
          audience_max_age: number | null
          audience_min_age: number | null
          audience_visibility: string
          capacity: number | null
          category_label: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          featured_on_home: boolean
          form_template_id: string | null
          id: string
          is_member_only: boolean
          location: string | null
          recurring_event_id: string | null
          requires_payment: boolean
          speakers: Json
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          capacity?: number | null
          category_label?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          featured_on_home?: boolean
          form_template_id?: string | null
          id?: string
          is_member_only?: boolean
          location?: string | null
          recurring_event_id?: string | null
          requires_payment?: boolean
          speakers?: Json
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          capacity?: number | null
          category_label?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          featured_on_home?: boolean
          form_template_id?: string | null
          id?: string
          is_member_only?: boolean
          location?: string | null
          recurring_event_id?: string | null
          requires_payment?: boolean
          speakers?: Json
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_form_template_id_fkey"
            columns: ["form_template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_recurring_event_id_fkey"
            columns: ["recurring_event_id"]
            isOneToOne: false
            referencedRelation: "recurring_events"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          payload: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          payload?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          data: Json
          event_id: string | null
          id: string
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          schema: Json
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          schema?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          schema?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          expires_at: string
          key: string
          response_json: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          key: string
          response_json?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          key?: string
          response_json?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      isij_registry_cache: {
        Row: {
          created_at: string
          email_hash: string | null
          full_name: string | null
          id: string
          isij_number: string
          status: string
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_hash?: string | null
          full_name?: string | null
          id?: string
          isij_number: string
          status?: string
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_hash?: string | null
          full_name?: string | null
          id?: string
          isij_number?: string
          status?: string
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          attempted_at: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error: string | null
          id: string
          notification_id: string
          provider: string | null
          provider_message_id: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string
        }
        Insert: {
          attempted_at?: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error?: string | null
          id?: string
          notification_id: string
          provider?: string | null
          provider_message_id?: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
        }
        Update: {
          attempted_at?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string
          provider?: string | null
          provider_message_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error_message: string | null
          id: string
          payload: Json
          recipient_id: string
          retry_count: number
          scheduled_for: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          template_key: string
          updated_at: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          recipient_id: string
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template_key: string
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          recipient_id?: string
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      og_cache: {
        Row: {
          description: string | null
          fetched_at: string
          image_url: string | null
          site_name: string | null
          title: string | null
          url: string
          url_hash: string
        }
        Insert: {
          description?: string | null
          fetched_at?: string
          image_url?: string | null
          site_name?: string | null
          title?: string | null
          url: string
          url_hash: string
        }
        Update: {
          description?: string | null
          fetched_at?: string
          image_url?: string | null
          site_name?: string | null
          title?: string | null
          url?: string
          url_hash?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_demographic: string | null
          avatar_url: string | null
          consent_marketing: boolean
          country: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          gender: string | null
          id: string
          onboarding_completed_at: string | null
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          age_demographic?: string | null
          avatar_url?: string | null
          consent_marketing?: boolean
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          id: string
          onboarding_completed_at?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          age_demographic?: string | null
          avatar_url?: string | null
          consent_marketing?: boolean
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          onboarding_completed_at?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recurring_events: {
        Row: {
          audience_gender: string
          audience_max_age: number | null
          audience_min_age: number | null
          audience_visibility: string
          cadence_label: string | null
          cadence_rrule: string | null
          cover_image_url: string | null
          created_at: string
          default_capacity: number | null
          description_md: string
          id: string
          is_active: boolean
          location: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          cadence_label?: string | null
          cadence_rrule?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_capacity?: number | null
          description_md?: string
          id?: string
          is_active?: boolean
          location?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          cadence_label?: string | null
          cadence_rrule?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_capacity?: number | null
          description_md?: string
          id?: string
          is_active?: boolean
          location?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      scholar_questions: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          assigned_scholar_id: string | null
          category: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          question_text: string
          status: Database["public"]["Enums"]["question_status"]
          submitter_id: string
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          assigned_scholar_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          question_text: string
          status?: Database["public"]["Enums"]["question_status"]
          submitter_id: string
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          assigned_scholar_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          question_text?: string
          status?: Database["public"]["Enums"]["question_status"]
          submitter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholar_questions_assigned_scholar_id_fkey"
            columns: ["assigned_scholar_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholar_questions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content: Json
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      youth_press_articles: {
        Row: {
          audience_gender: string
          audience_max_age: number | null
          audience_min_age: number | null
          audience_visibility: string
          author_id: string
          body_md: string
          cover_image_url: string | null
          created_at: string
          editor_id: string | null
          excerpt: string | null
          featured_on_home: boolean
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at: string
        }
        Insert: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          author_id: string
          body_md: string
          cover_image_url?: string | null
          created_at?: string
          editor_id?: string | null
          excerpt?: string | null
          featured_on_home?: boolean
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at?: string
        }
        Update: {
          audience_gender?: string
          audience_max_age?: number | null
          audience_min_age?: number | null
          audience_visibility?: string
          author_id?: string
          body_md?: string
          cover_image_url?: string | null
          created_at?: string
          editor_id?: string | null
          excerpt?: string | null
          featured_on_home?: boolean
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "youth_press_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youth_press_articles_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_log_write: {
        Args: {
          _action: string
          _actor_id: string
          _entity?: string
          _entity_id?: string
          _metadata?: Json
        }
        Returns: string
      }
      can_view_audience: {
        Args: {
          _gender: string
          _max: number
          _min: number
          _user_id: string
          _vis: string
        }
        Returns: boolean
      }
      enqueue_notification: {
        Args: {
          _channel: Database["public"]["Enums"]["notification_channel"]
          _payload?: Json
          _recipient_id: string
          _scheduled_for?: string
          _template_key: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      profile_age: { Args: { _user_id: string }; Returns: number }
    }
    Enums: {
      announcement_status: "draft" | "published" | "archived"
      app_role: "member_isij" | "member_standalone" | "scholar" | "admin"
      article_status: "draft" | "in_review" | "published"
      check_in_status: "registered" | "checked_in" | "no_show" | "cancelled"
      event_status: "draft" | "published" | "completed" | "cancelled"
      notification_channel: "email" | "push" | "sms" | "in_app"
      notification_status: "pending" | "sent" | "failed" | "cancelled"
      question_status: "pending_triage" | "assigned" | "answered" | "rejected"
      subscription_plan: "monthly_10" | "yearly_100"
      subscription_status:
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "trialing"
        | "unpaid"
      ticket_order_status:
        | "pending"
        | "paid"
        | "refunded"
        | "failed"
        | "cancelled"
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
      announcement_status: ["draft", "published", "archived"],
      app_role: ["member_isij", "member_standalone", "scholar", "admin"],
      article_status: ["draft", "in_review", "published"],
      check_in_status: ["registered", "checked_in", "no_show", "cancelled"],
      event_status: ["draft", "published", "completed", "cancelled"],
      notification_channel: ["email", "push", "sms", "in_app"],
      notification_status: ["pending", "sent", "failed", "cancelled"],
      question_status: ["pending_triage", "assigned", "answered", "rejected"],
      subscription_plan: ["monthly_10", "yearly_100"],
      subscription_status: [
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "trialing",
        "unpaid",
      ],
      ticket_order_status: [
        "pending",
        "paid",
        "refunded",
        "failed",
        "cancelled",
      ],
    },
  },
} as const

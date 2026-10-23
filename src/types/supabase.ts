// Auto-generated shape — run `npm run db:types` after `supabase start` to replace with generated types.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'player' | 'co_admin' | 'admin'
export type GenderType = 'male' | 'female'
export type SkillTier = 'open' | 'D' | 'C' | 'B' | 'A'
export type SessionStatus = 'draft' | 'upcoming' | 'live' | 'closed' | 'cancelled'
export type CourtType = 'open' | 'strong' | 'casual' | 'women' | 'mixed'
export type CourtStatus = 'empty' | 'assigned' | 'playing' | 'paused'
export type QueueStatus = 'waiting' | 'assigned' | 'playing' | 'standby' | 'break' | 'away' | 'done'
export type QueueMode = 'solo' | 'pair'
export type CheckinMethod = 'qr' | 'code' | 'manual' | 'walk_in'
export type PairRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'
export type MatchTeam = 'a' | 'b'
export type FeedbackRating = '1' | '2' | '3' | '4' | '5'

type Rel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          gender: GenderType | null
          gender_verified: boolean
          role: UserRole
          dupr_username: string | null
          dupr_rating: number | null
          dupr_verified: boolean
          phone: string | null
          email: string | null
          email_verified: boolean
          skill_tier: SkillTier | null
          verified_tier: SkillTier | null
          women_courts_only: boolean
          no_strong_courts: boolean
          saved_partner_id: string | null
          avatar_url: string | null
          push_enabled: boolean
          email_enabled: boolean
          next_ping_enabled: boolean
          push_subscription: Json | null
          is_walk_in: boolean
          banned: boolean
          banned_at: string | null
          banned_reason: string | null
          deleted_at: string | null
          pdpa_consent_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          gender?: GenderType | null
          gender_verified?: boolean
          role?: UserRole
          dupr_username?: string | null
          dupr_rating?: number | null
          dupr_verified?: boolean
          phone?: string | null
          email?: string | null
          email_verified?: boolean
          skill_tier?: SkillTier | null
          verified_tier?: SkillTier | null
          women_courts_only?: boolean
          no_strong_courts?: boolean
          saved_partner_id?: string | null
          avatar_url?: string | null
          push_enabled?: boolean
          email_enabled?: boolean
          next_ping_enabled?: boolean
          push_subscription?: Json | null
          is_walk_in?: boolean
          banned?: boolean
          banned_at?: string | null
          banned_reason?: string | null
          deleted_at?: string | null
          pdpa_consent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          gender?: GenderType | null
          gender_verified?: boolean
          role?: UserRole
          dupr_username?: string | null
          dupr_rating?: number | null
          dupr_verified?: boolean
          phone?: string | null
          email?: string | null
          email_verified?: boolean
          skill_tier?: SkillTier | null
          verified_tier?: SkillTier | null
          women_courts_only?: boolean
          no_strong_courts?: boolean
          saved_partner_id?: string | null
          avatar_url?: string | null
          push_enabled?: boolean
          email_enabled?: boolean
          next_ping_enabled?: boolean
          push_subscription?: Json | null
          is_walk_in?: boolean
          banned?: boolean
          banned_at?: string | null
          banned_reason?: string | null
          deleted_at?: string | null
          pdpa_consent_at?: string | null
          created_at?: string
        }
        Relationships: Rel[]
      }
      sessions: {
        Row: {
          id: string
          name: string
          description: string | null
          date: string | null
          start_time: string | null
          end_time: string | null
          status: SessionStatus
          max_players: number
          checkin_open_mins: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          date?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: SessionStatus
          max_players?: number
          checkin_open_mins?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          date?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: SessionStatus
          max_players?: number
          checkin_open_mins?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      session_reminders: {
        Row: {
          id: string
          session_id: string
          player_id: string
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          sent_at?: string | null
          created_at?: string
        }
        Relationships: Rel[]
      }
      session_checkins: {
        Row: {
          id: string
          session_id: string
          player_id: string
          method: CheckinMethod
          checked_in_at: string
          checked_in_by: string | null
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          method: CheckinMethod
          checked_in_at?: string
          checked_in_by?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          method?: CheckinMethod
          checked_in_at?: string
          checked_in_by?: string | null
        }
        Relationships: Rel[]
      }
      checkin_tokens: {
        Row: {
          id: string
          session_id: string
          token: string
          code: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          token: string
          code: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          token?: string
          code?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: Rel[]
      }
      courts: {
        Row: {
          id: string
          session_id: string
          name: string
          type: CourtType
          status: CourtStatus
          current_match_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          type?: CourtType
          status?: CourtStatus
          current_match_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          type?: CourtType
          status?: CourtStatus
          current_match_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      queue_entries: {
        Row: {
          id: string
          session_id: string
          player_id: string
          status: QueueStatus
          mode: QueueMode
          pair_partner_id: string | null
          queue_position: number
          games_played: number
          strike_count: number
          last_assigned_at: string | null
          prompt_seen_at: string | null
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          status?: QueueStatus
          mode?: QueueMode
          pair_partner_id?: string | null
          queue_position: number
          games_played?: number
          strike_count?: number
          last_assigned_at?: string | null
          prompt_seen_at?: string | null
          joined_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          status?: QueueStatus
          mode?: QueueMode
          pair_partner_id?: string | null
          queue_position?: number
          games_played?: number
          strike_count?: number
          last_assigned_at?: string | null
          prompt_seen_at?: string | null
          joined_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      matches: {
        Row: {
          id: string
          session_id: string
          court_id: string
          started_at: string | null
          ended_at: string | null
          score_a: number | null
          score_b: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          court_id: string
          started_at?: string | null
          ended_at?: string | null
          score_a?: number | null
          score_b?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          court_id?: string
          started_at?: string | null
          ended_at?: string | null
          score_a?: number | null
          score_b?: number | null
          created_at?: string
        }
        Relationships: Rel[]
      }
      match_players: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team: MatchTeam
          queue_entry_id: string | null
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          team: MatchTeam
          queue_entry_id?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          team?: MatchTeam
          queue_entry_id?: string | null
        }
        Relationships: Rel[]
      }
      pair_requests: {
        Row: {
          id: string
          session_id: string
          requester_id: string
          target_id: string
          status: PairRequestStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          requester_id: string
          target_id: string
          status?: PairRequestStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          requester_id?: string
          target_id?: string
          status?: PairRequestStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      session_feedback: {
        Row: {
          id: string
          session_id: string
          player_id: string
          rating: FeedbackRating
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          rating: FeedbackRating
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          rating?: FeedbackRating
          comment?: string | null
          created_at?: string
        }
        Relationships: Rel[]
      }
      public_log: {
        Row: {
          id: string
          session_id: string
          event: string
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          event: string
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          event?: string
          payload?: Json | null
          created_at?: string
        }
        Relationships: Rel[]
      }
      admin_log: {
        Row: {
          id: string
          session_id: string | null
          actor_id: string | null
          action: string
          target_id: string | null
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          actor_id?: string | null
          action: string
          target_id?: string | null
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          actor_id?: string | null
          action?: string
          target_id?: string | null
          payload?: Json | null
          created_at?: string
        }
        Relationships: Rel[]
      }
      notifications: {
        Row: {
          id: string
          player_id: string
          session_id: string | null
          type: string
          title: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          session_id?: string | null
          type: string
          title: string
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          session_id?: string | null
          type?: string
          title?: string
          body?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: Rel[]
      }
    }
    Views: Record<never, never>
    Functions: {
      venue_checkin: {
        Args: { p_session_id: string; p_token?: string; p_code?: string }
        Returns: Json
      }
      join_queue: {
        Args: { p_session_id: string; p_mode?: string }
        Returns: Json
      }
      leave_queue: {
        Args: { p_session_id: string }
        Returns: Json
      }
      send_pair_request: {
        Args: { p_session_id: string; p_target_id: string }
        Returns: Json
      }
      respond_pair_request: {
        Args: { p_request_id: string; p_accept: boolean }
        Returns: Json
      }
      split_pair: {
        Args: { p_session_id: string }
        Returns: Json
      }
      mark_prompt_seen: {
        Args: { p_session_id: string }
        Returns: Json
      }
      requeue: {
        Args: { p_session_id: string }
        Returns: Json
      }
      take_break: {
        Args: { p_session_id: string }
        Returns: Json
      }
      my_role: {
        Args: Record<string, never>
        Returns: string
      }
      is_staff: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      gender_type: GenderType
      skill_tier: SkillTier
      session_status: SessionStatus
      court_type: CourtType
      court_status: CourtStatus
      queue_status: QueueStatus
      queue_mode: QueueMode
      checkin_method: CheckinMethod
      pair_request_status: PairRequestStatus
      match_team: MatchTeam
      feedback_rating: FeedbackRating
    }
    CompositeTypes: Record<never, never>
  }
}

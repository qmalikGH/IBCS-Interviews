// ============================================================
// IBCS Interview Tool — Database Types
// Mirrors the Supabase schema defined in 001_create_tables.sql
//
// NOTE: Row/Insert/Update types MUST be `type` aliases (not
// `interface`) so they satisfy `Record<string, unknown>`, which
// is required by the Supabase client's generic constraints.
// ============================================================

// ── Relationship shape (mirrors Supabase GenericRelationship) ─

type DbRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

// ── Raw row types (what Supabase returns on SELECT) ──────────

export type Session = {
  id: string;
  participant_role: string;
  powerbi_familiarity: string | null;   // 'nicht_vertraut' | 'vertraut'
  ibcs_familiarity: string | null;      // 'nicht_vertraut' | 'leicht_vertraut' | 'vertraut'
  started_at: string;            // ISO 8601 timestamptz
  completed_at: string | null;   // NULL until finished
  report_order: 'native_first' | 'ibcs_first';
  pair_order: string[];          // e.g. ["P3","P1","P2","P4"]
  pair_side_order: Record<string, 'native_first' | 'ibcs_first'>;
  current_step: string;
};

export type DbResponse = {
  id: string;
  session_id: string;
  stage: 'stufe1' | 'stufe2_tasks';
  task_id: string;               // e.g. 'P1_native', 'K1', 'V2'
  report_type: 'native' | 'ibcs';
  answer: string;
  is_correct: 0 | 1 | 2;        // 0=wrong, 1=partial, 2=correct
  time_ms: number | null;        // NULL if not timed
  seq_score: number | null;      // 1–7 or NULL
  preference: 'a' | 'b' | null;
  answered_at: string;
};

export type Feedback = {
  id: string;
  session_id: string;
  question_id: string;
  answer_type: 'likert' | 'ranking' | 'freetext';
  value: string;
  answered_at: string;
};

// ── Insert types (omit auto-generated / defaulted fields) ────

export type SessionInsert = Omit<Session, 'id' | 'started_at' | 'completed_at'> & {
  completed_at?: string | null;
};

export type ResponseInsert = Omit<DbResponse, 'id' | 'answered_at'>;

export type FeedbackInsert = Omit<Feedback, 'id' | 'answered_at'>;

// ── Supabase Database type (for typed createClient<Database>()) ─
// Must satisfy GenericSchema:
//   Tables:    Record<string, GenericTable>
//   Views:     Record<string, GenericView>
//   Functions: Record<string, GenericFunction>
//
// Tables must use type aliases (not interfaces) so that Row/Insert/Update
// extends Record<string, unknown>.

export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: Session;
        Insert: SessionInsert;
        Update: Partial<SessionInsert>;
        Relationships: DbRelationship[];
      };
      responses: {
        Row: DbResponse;
        Insert: ResponseInsert;
        Update: Partial<ResponseInsert>;
        Relationships: DbRelationship[];
      };
      feedback: {
        Row: Feedback;
        Insert: FeedbackInsert;
        Update: Partial<FeedbackInsert>;
        Relationships: DbRelationship[];
      };
    };
    Views: Record<string, {
      Row: Record<string, unknown>;
      Relationships: DbRelationship[];
    }>;
    Functions: Record<string, {
      Args: Record<string, unknown>;
      Returns: unknown;
    }>;
  };
};

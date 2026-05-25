-- ============================================================
-- IBCS Interview Tool — Initial Schema
-- Migration: 001_create_tables.sql
-- ============================================================

-- ============================================================
-- Table: sessions
-- One row per participant run through the interview tool.
-- ============================================================
CREATE TABLE sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_role TEXT        NOT NULL,
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,                    -- NULL until participant finishes
  report_order    TEXT        NOT NULL            -- 'native_first' | 'ibcs_first'
                              CHECK (report_order IN ('native_first', 'ibcs_first')),
  pair_order      JSONB       NOT NULL,           -- e.g. ["P3","P1","P2","P4"]
  pair_side_order JSONB       NOT NULL,           -- e.g. {"P1":"native_first","P2":"ibcs_first",...}
  current_step    TEXT        NOT NULL DEFAULT 'welcome'
);

-- ============================================================
-- Table: responses
-- One row per answered question / task.
-- ============================================================
CREATE TABLE responses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        REFERENCES sessions(id) ON DELETE CASCADE,
  stage       TEXT        NOT NULL
              CHECK (stage IN ('stufe1', 'stufe2_tasks')),
              -- Updated by 002_stufe2_redesign.sql (was: stufe2_block1/block2/depth)
  task_id     TEXT        NOT NULL,               -- e.g. 'P1_native', 'P1_ibcs', 'K1', 'V2'
  report_type TEXT        NOT NULL
              CHECK (report_type IN ('native', 'ibcs')),
  answer      TEXT        NOT NULL,
  is_correct  INT         NOT NULL                -- 0 = wrong, 1 = partial, 2 = correct
              CHECK (is_correct IN (0, 1, 2)),
  time_ms     INT,                                -- NULL if not timed
  seq_score   INT                                 -- 1–7, NULL if not applicable
              CHECK (seq_score IS NULL OR (seq_score >= 1 AND seq_score <= 7)),
  preference  TEXT                                -- 'a' | 'b', NULL if not applicable
              CHECK (preference IS NULL OR preference IN ('a', 'b')),
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Table: feedback
-- One row per feedback question answered (post-session survey).
-- ============================================================
CREATE TABLE feedback (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        REFERENCES sessions(id) ON DELETE CASCADE,
  question_id TEXT        NOT NULL,
  answer_type TEXT        NOT NULL
              CHECK (answer_type IN ('likert', 'ranking', 'freetext')),
  value       TEXT        NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- This is an unmoderated research tool: anon users can INSERT
-- and SELECT on all tables (no auth flow required).
-- ============================================================
ALTER TABLE sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback  ENABLE ROW LEVEL SECURITY;

-- sessions: allow anon insert + select
CREATE POLICY "anon_insert_sessions"
  ON sessions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_sessions"
  ON sessions FOR SELECT TO anon
  USING (true);

-- responses: allow anon insert + select
CREATE POLICY "anon_insert_responses"
  ON responses FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_responses"
  ON responses FOR SELECT TO anon
  USING (true);

-- feedback: allow anon insert + select
CREATE POLICY "anon_insert_feedback"
  ON feedback FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_feedback"
  ON feedback FOR SELECT TO anon
  USING (true);

-- ============================================================
-- Update helper: allow anon to patch current_step + completed_at
-- on their own session (needed by the wizard).
-- ============================================================
CREATE POLICY "anon_update_sessions"
  ON sessions FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

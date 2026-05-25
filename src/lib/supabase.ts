// ============================================================
// IBCS Interview Tool — Supabase Client
// ============================================================
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  SessionInsert,
  ResponseInsert,
  FeedbackInsert,
} from '@/types/database';

// Re-export row types for convenience
export type { Session, DbResponse, Feedback } from '@/types/database';

// ── Environment variables ─────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env.local.'
  );
}

// ── Typed client ──────────────────────────────────────────────
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ============================================================
// Helper: createSession
// Creates a new session row and returns the generated UUID.
// ============================================================
export async function createSession(data: SessionInsert): Promise<string> {
  const { data: row, error } = await supabase
    .from('sessions')
    .insert(data)
    .select('id')
    .single();

  if (error) throw new Error(`createSession failed: ${error.message}`);
  return row.id;
}

// ============================================================
// Helper: saveResponse
// Inserts one answered task into the responses table.
// ============================================================
export async function saveResponse(data: ResponseInsert): Promise<void> {
  const { error } = await supabase.from('responses').insert(data);
  if (error) throw new Error(`saveResponse failed: ${error.message}`);
}

// ============================================================
// Helper: saveFeedback
// Inserts one feedback answer (likert / ranking / freetext).
// ============================================================
export async function saveFeedback(data: FeedbackInsert): Promise<void> {
  const { error } = await supabase.from('feedback').insert(data);
  if (error) throw new Error(`saveFeedback failed: ${error.message}`);
}

// ============================================================
// Helper: updateSessionStep
// Persists the wizard's current_step so a refresh can resume.
// ============================================================
export async function updateSessionStep(
  sessionId: string,
  step: string
): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ current_step: step })
    .eq('id', sessionId);

  if (error) throw new Error(`updateSessionStep failed: ${error.message}`);
}

// ============================================================
// Helper: completeSession
// Stamps completed_at with the current server timestamp.
// ============================================================
export async function completeSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({
      completed_at: new Date().toISOString(),
      current_step: 'done',
    })
    .eq('id', sessionId);

  if (error) throw new Error(`completeSession failed: ${error.message}`);
}

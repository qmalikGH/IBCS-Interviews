import type { Database } from '@/types/database';

// These should all be true:
type PublicSchema = Database['public'];

// Check if it matches GenericSchema structure
type TestViews = PublicSchema['Views'];   // Should be Record<string, GenericView>
type TestFunctions = PublicSchema['Functions'];
type TestTables = PublicSchema['Tables'];
type TestSessions = TestTables['sessions'];
type TestInsert = TestSessions['Insert'];  // Should be SessionInsert, not never

// Force a compile error if Insert is never:
type CheckInsert = TestInsert extends never ? 'FAIL: Insert is never' : 'OK: Insert is not never';
const check: CheckInsert = 'OK: Insert is not never';
console.log(check);
